import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  RadicleRegistry,
  NewProject,
} from "../generated/RadicleRegistry/RadicleRegistry"
import {
  MultiHash,
} from "../generated/MetaData/MetaData"
import {
  Collected, Dripping, Dripping1, Split, SplitsUpdated, SplitsUpdatedReceiversStruct, DripsUpdated, DripsUpdated1, Given, Given1
} from "../generated/DaiDripsHub/DaiDripsHub"
import { FundingProject, DripsConfig, DripsAccount, DripsEntry, SplitsConfig, SplitsEntry, IdentityMetaData, Give} from "../generated/schema"
import { DripsToken } from '../generated/templates';
import { store,ethereum,log } from '@graphprotocol/graph-ts'

export function handleIdentityMetaData(event: MultiHash): void {

  let id = event.params.addr.toHex()
  let identityMetaData = IdentityMetaData.load(id)
  if (!identityMetaData) {
    identityMetaData = new IdentityMetaData(id)
  }
  identityMetaData.key = event.params.id
  identityMetaData.multiHash = event.params.multiHash
  identityMetaData.save()
}

export function handleNewProject(event: NewProject): void {

  let fundingProject = new FundingProject(event.params.fundingToken.toHex())
  fundingProject.projectName = event.params.name
  fundingProject.daiCollected = new BigInt(0)

  // Entity fields can be set based on event parameters
  fundingProject.projectOwner = event.params.projectOwner
  fundingProject.dripsTokenTemplate = event.params.dripTokenTemplate
  if (event.block) {
    fundingProject.blockTimestampCreated = event.block.timestamp
  }
  fundingProject.save()

  DripsToken.create(event.params.fundingToken);
}

export function handleCollected(event: Collected): void {

  let fundingProject = FundingProject.load(event.params.user.toHex())

  if (!fundingProject) {
    return
  }

  fundingProject.daiCollected = fundingProject.daiCollected.plus(event.params.collected)
  fundingProject.daiSplit = fundingProject.daiSplit.plus(event.params.split)

  fundingProject.save()
}

export function handleSplitsUpdated(event: SplitsUpdated): void {
  let splitsConfigId = event.params.user.toHex()
  let splitsConfig = SplitsConfig.load(splitsConfigId)

  if (!splitsConfig) {
    splitsConfig = new SplitsConfig(splitsConfigId)
    splitsConfig.receiverAddresses = []
  } else {
    // Now we need to delete the old Splits entities and clear the receiverAddresses field on SplitsConfig
    for (let i = 0; i < splitsConfig.receiverAddresses.length; i++) {
      let receiverAddress = splitsConfig.receiverAddresses[i]
      let splitId = event.params.user.toHex() + "-" + receiverAddress
      store.remove('SplitsEntry', splitId)
    }
    // Clear the receiverAddresses array
    splitsConfig.receiverAddresses.splice(0, splitsConfig.receiverAddresses.length)
    splitsConfig.receiverAddresses = []
  }

  // Now we need to add the new Splits as entities and to the receiverAddresses field on SplitsConfig
  let newReceiverAddresses = splitsConfig.receiverAddresses
  for (let i = 0; i < event.params.receivers.length; i++) {
    // First create the new Split entity and save it
    let receiver = event.params.receivers[i]
    let receiverAddress = receiver.receiver
    let splitId = event.params.user.toHex() + "-" + receiverAddress.toHex()
    let splitsEntry = new SplitsEntry(splitId)
    splitsEntry.sender = event.params.user
    splitsEntry.receiver = receiverAddress
    splitsEntry.splitsConfig = splitsConfigId
    splitsEntry.weight = receiver.weight
    splitsEntry.save()

    // Next add the receiver address to the SplitsConfig
    splitsConfig.lastUpdatedBlockTimestamp = event.block.timestamp
    newReceiverAddresses.push(receiverAddress.toHex())
  }

  splitsConfig.receiverAddresses = newReceiverAddresses
  splitsConfig.save()
}

export function handleDripsUpdated(event: DripsUpdated): void {
  
  // First we update the DripsConfig
  let dripsConfigId = event.params.user.toHex()
  let dripsConfig = DripsConfig.load(dripsConfigId)
  if (!dripsConfig) {
    dripsConfig = new DripsConfig(dripsConfigId)
    dripsConfig.balance = new BigInt(0)
    dripsConfig.dripsEntryIDs = []
  } else {
    // Now we need to delete the old Drips entities and clear the receiverAddresses field on DripsConfig
    let newDripsEntryIDs: string[] = []
    for (let i = 0; i < dripsConfig.dripsEntryIDs.length; i++) {
      let dripsEntryId = dripsConfig.dripsEntryIDs[i]
      
      let dripsEntry = DripsEntry.load(dripsEntryId)
      if (dripsEntry && dripsEntry.isAccountDrip == false) {
        store.remove('DripsEntry', dripsEntryId)
      } else {
        newDripsEntryIDs.push(dripsEntryId)
      }
    }
    // Clear the receiverAddresses array
    dripsConfig.dripsEntryIDs = newDripsEntryIDs
  }

  // Next we create/update the DripsAccount
  let dripsAccountId = event.params.user.toHex()
  let dripsAccount = DripsAccount.load(dripsAccountId)
  if (!dripsAccount) {
    dripsAccount = new DripsAccount(dripsAccountId)
    dripsAccount.isAccountDrip = false
  }
  dripsAccount.balance = event.params.balance
  dripsAccount.lastUpdatedBlockTimestamp = event.block.timestamp
  dripsAccount.save()

  // Now we need to add the new Drips as entities and to the receiverAddresses field on DripsConfig
  let newDripsEntryIDs = dripsConfig.dripsEntryIDs
  for (let i = 0; i < event.params.receivers.length; i++) {    
    // First create the new Drip entity and save it
    let receiver = event.params.receivers[i]
    let receiverAddress = receiver.receiver

    let dripId = event.params.user.toHexString() + "-" + receiverAddress.toHexString()
    let dripsEntry = new DripsEntry(dripId)
    dripsEntry.user = event.params.user
    dripsEntry.receiver = receiverAddress
    dripsEntry.dripsConfig = dripsConfigId
    dripsEntry.dripsAccount = dripsAccountId
    dripsEntry.isAccountDrip = false
    dripsEntry.amtPerSec = receiver.amtPerSec
    dripsEntry.save()

    // Next add the receiver address to the SplitsConfig
    newDripsEntryIDs.push(dripId)
  }

  dripsConfig.dripsEntryIDs = newDripsEntryIDs
  dripsConfig.lastUpdatedBlockTimestamp = event.block.timestamp
  dripsConfig.balance = event.params.balance
  dripsConfig.save()
}

export function handleDripsUpdatedWithAccount(event: DripsUpdated1): void {

  // First we update the DripsConfig
  let dripsConfigId = event.params.user.toHex()
  let dripsConfig = DripsConfig.load(dripsConfigId)
  if (!dripsConfig) {
    dripsConfig = new DripsConfig(dripsConfigId)
    dripsConfig.balance = new BigInt(0)
    dripsConfig.dripsEntryIDs = []
  } else {
    // Now we need to delete the old Drips entities and clear the receiverAddresses field on DripsConfig
    let newDripsEntryIDs: string[] = []
    for (let i = 0; i < dripsConfig.dripsEntryIDs.length; i++) {
      let dripsEntryId = dripsConfig.dripsEntryIDs[i]
      let dripsEntry = DripsEntry.load(dripsEntryId)
      if (dripsEntry && dripsEntry.isAccountDrip == true && dripsEntry.account.equals(event.params.account)) {
        store.remove('DripsEntry', dripsEntryId)
      } else {
        newDripsEntryIDs.push(dripsEntryId)
      }
    }
    // Clear the receiverAddresses array
    dripsConfig.dripsEntryIDs = newDripsEntryIDs
  }

  // Next we create/update the DripsAccount
  let dripsAccountId = event.params.user.toHex() + "-" + event.params.account.toString()
  let dripsAccount = DripsAccount.load(dripsAccountId)
  if (!dripsAccount) {
    dripsAccount = new DripsAccount(dripsAccountId)
    dripsAccount.isAccountDrip = true
    dripsAccount.account = event.params.account
  }
  dripsAccount.balance = event.params.balance
  dripsAccount.lastUpdatedBlockTimestamp = event.block.timestamp
  dripsAccount.save()

  // Now we need to add the new Drips as entities and to the receiverAddresses field on DripsConfig
  let newDripsEntryIDs = dripsConfig.dripsEntryIDs
  for (let i = 0; i < event.params.receivers.length; i++) {
    // First create the new Drip entity and save it
    let receiver = event.params.receivers[i]
    let receiverAddress = receiver.receiver

    let dripId = event.params.user.toHexString() + "-" + receiverAddress.toHexString() + "-" + event.params.account.toString()
    let dripsEntry = new DripsEntry(dripId)
    dripsEntry.user = event.params.user
    dripsEntry.receiver = receiverAddress
    dripsEntry.dripsConfig = dripsConfigId
    dripsEntry.dripsAccount = dripsAccountId
    dripsEntry.isAccountDrip = true
    dripsEntry.account = event.params.account
    dripsEntry.amtPerSec = receiver.amtPerSec
    dripsEntry.save()

    // Next add the receiver address to the SplitsConfig
    newDripsEntryIDs.push(dripId)
  }

  dripsConfig.dripsEntryIDs = newDripsEntryIDs
  dripsConfig.lastUpdatedBlockTimestamp = event.block.timestamp
  dripsConfig.save()
}

export function handleGive(event: Given): void {

  let give = new Give(event.transaction.hash.toHex())
  give.sender = event.params.user
  give.isAccountGive = false
  give.receiver = event.params.receiver
  give.amount = event.params.amt
  give.blockTimestampGiven = event.block.timestamp
  give.save()
}

export function handleGiveWithAccount(event: Given1): void {

  let give = new Give(event.transaction.hash.toHex())
  give.sender = event.params.user
  give.isAccountGive = true
  give.account = event.params.account
  give.receiver = event.params.receiver
  give.amount = event.params.amt
  give.blockTimestampGiven = event.block.timestamp
  give.save()
}
