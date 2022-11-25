import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { DripsSet, DripsReceiverSeen, ReceivedDrips, SqueezedDrips, SplitsSet, SplitsReceiverSeen, Split, Given, DriverRegistered, DriverAddressUpdated, UserMetadata} from "../generated/DripsHub/DripsHub"
import { Transfer } from "../generated/NFTDriver/NFTDriver"
import { CreatedSplits } from "../generated/ImmutableSplitsDriver/ImmutableSplitsDriver"
import {
  Collected
} from "../generated/DripsHub/DripsHub"
import { User, DripsEntry, UserAssetConfig, DripsSetEvent, LastSetDripsUserMapping, DripsReceiverSeenEvent, 
  ReceivedDripsEvent, SqueezedDripsEvent, SplitsEntry, SplitsSetEvent, LastSetSplitsUserMapping, SplitsReceiverSeenEvent, 
  SplitEvent, CollectedEvent, UserMetadataByKey, UserMetadataEvent, GivenEvent, App, NFTSubAccount, 
  ImmutableSplitsCreated} from "../generated/schema"
import { store,ethereum,log } from '@graphprotocol/graph-ts'

export function handleUserMetadata(event: UserMetadata): void {

  let userMetadataByKeyId = event.params.userId.toString() + "-" + event.params.key.toString()
  let userMetadataByKey = UserMetadataByKey.load(userMetadataByKeyId)
  if (!userMetadataByKey) {
    userMetadataByKey = new UserMetadataByKey(userMetadataByKeyId)
  }
  userMetadataByKey.userId = event.params.userId.toString()
  userMetadataByKey.key = event.params.key
  userMetadataByKey.value = event.params.value
  userMetadataByKey.lastUpdatedBlockTimestamp = event.block.timestamp
  userMetadataByKey.save()

  let userMetadataEvent = new UserMetadataEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  userMetadataEvent.userId = event.params.userId.toString()
  userMetadataEvent.key = event.params.key
  userMetadataEvent.value = event.params.value
  userMetadataEvent.lastUpdatedBlockTimestamp = event.block.timestamp
  userMetadataEvent.save()
}

export function handleCollected(event: Collected): void {

  let userId = event.params.userId.toString()
  let assetId = event.params.assetId.toString()
  let userAssetConfigId = userId + "-" + assetId

  let userAssetConfig = UserAssetConfig.load(userAssetConfigId)

  if (userAssetConfig) {
    userAssetConfig.amountCollected = userAssetConfig.amountCollected.plus(event.params.collected)
    userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp
    userAssetConfig.save()
  
    let collectedEvent = new CollectedEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
    collectedEvent.user = userId
    collectedEvent.assetId = event.params.assetId
    collectedEvent.collected = event.params.collected
    collectedEvent.blockTimestamp = event.block.timestamp
    collectedEvent.save()
  }
}

export function handleDripsSet(event: DripsSet): void {

  // If the User doesn't exist, create it
  let userId = event.params.userId.toString()
  let user = User.load(userId)
  if (!user) {
    user = new User(userId)
    user.splitsEntryIds = []
    user.lastUpdatedBlockTimestamp = event.block.timestamp
    user.save()
  }

  // Next create or update the UserAssetConfig and clear any old DripsEntries if needed
  let userAssetConfigId = event.params.userId.toString() + "-" + event.params.assetId.toString()
  let userAssetConfig = UserAssetConfig.load(userAssetConfigId)
  if (!userAssetConfig) {
    userAssetConfig = new UserAssetConfig(userAssetConfigId)
    userAssetConfig.user = userId
    userAssetConfig.assetId = event.params.assetId
    userAssetConfig.dripsEntryIds = []
  } else {
    // If this is an update, we need to delete the old DripsEntry values and clear the
    // dripsEntryIds field
    if (!(event.params.receiversHash.toHexString() == userAssetConfig.assetConfigHash.toHexString())) {
      let newDripsEntryIds: string[] = []
      for (let i = 0; i<userAssetConfig.dripsEntryIds.length; i++) {
        let dripsEntryId = userAssetConfig.dripsEntryIds[i]
        let dripsEntry = DripsEntry.load(dripsEntryId)
        if (dripsEntry) {
          store.remove('DripsEntry', dripsEntryId)
        }
      }
      userAssetConfig.dripsEntryIds = newDripsEntryIds
    }
  }
  userAssetConfig.balance = event.params.balance
  userAssetConfig.assetConfigHash = event.params.receiversHash
  userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp
  userAssetConfig.save()

  // Add the DripsSetEvent
  let dripsSetEventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let dripsSetEvent = new DripsSetEvent(dripsSetEventId)
  dripsSetEvent.userId = event.params.userId.toString()
  dripsSetEvent.assetId = event.params.assetId
  dripsSetEvent.receiversHash = event.params.receiversHash
  dripsSetEvent.dripsHistoryHash = event.params.dripsHistoryHash
  dripsSetEvent.balance = event.params.balance
  dripsSetEvent.maxEnd = event.params.maxEnd
  dripsSetEvent.blockTimestamp = event.block.timestamp
  dripsSetEvent.save()

  // TODO -- we need to add some kind of sequence number so we can historically order DripsSetEvents that occur within the same block

  // Create/update LastDripsSetUserMapping for this receiversHash
  let lastDripsSetUserMappingId = event.params.receiversHash.toHexString()
  let lastDripsSetUserMapping = LastSetDripsUserMapping.load(lastDripsSetUserMappingId)
  if (!lastDripsSetUserMapping) {
    lastDripsSetUserMapping = new LastSetDripsUserMapping(lastDripsSetUserMappingId)
  }
  lastDripsSetUserMapping.dripsSetEventId = dripsSetEventId
  lastDripsSetUserMapping.userId = event.params.userId.toString()
  lastDripsSetUserMapping.assetId = event.params.assetId
  lastDripsSetUserMapping.save()
}

export function handleDripsReceiverSeen(event: DripsReceiverSeen): void {

  let receiversHash = event.params.receiversHash
  let lastSetDripsUserMapping = LastSetDripsUserMapping.load(receiversHash.toHexString())

  // We need to use the LastSetDripsUserMapping to look up the userId and assetId associated with this receiverHash
  if (lastSetDripsUserMapping) {
    let userAssetConfigId = lastSetDripsUserMapping.userId.toString() + "-" + lastSetDripsUserMapping.assetId.toString()
    let userAssetConfig = UserAssetConfig.load(userAssetConfigId)
    if (userAssetConfig) {
      
      // Now we can create the DripsEntry
      if (!userAssetConfig.dripsEntryIds) userAssetConfig.dripsEntryIds = []
      let newDripsEntryIds = userAssetConfig.dripsEntryIds
      let dripsEntryId = lastSetDripsUserMapping.userId.toString() + "-" + event.params.userId.toString() + "-" + lastSetDripsUserMapping.assetId.toString()
      let dripsEntry = DripsEntry.load(dripsEntryId)
      if (!dripsEntry) {
        dripsEntry = new DripsEntry(dripsEntryId)
      }
      dripsEntry.sender = lastSetDripsUserMapping.userId.toString()
      dripsEntry.senderAssetConfig = userAssetConfigId
      dripsEntry.userId = event.params.userId.toString()
      dripsEntry.config = event.params.config
      dripsEntry.save()

      newDripsEntryIds.push(dripsEntryId)
      userAssetConfig.dripsEntryIds = newDripsEntryIds
      userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp
      userAssetConfig.save()
    }
  }

  // Create the DripsReceiverSeenEvent entity
  let dripsReceiverSeenEventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let dripsReceiverSeenEvent = new DripsReceiverSeenEvent(dripsReceiverSeenEventId)
  if (lastSetDripsUserMapping) {
    dripsReceiverSeenEvent.dripsSetEvent = lastSetDripsUserMapping.dripsSetEventId
  }
  dripsReceiverSeenEvent.receiversHash = event.params.receiversHash
  if (lastSetDripsUserMapping) {
    dripsReceiverSeenEvent.senderUserId = lastSetDripsUserMapping.userId
  }
  dripsReceiverSeenEvent.receiverUserId = event.params.userId.toString()
  dripsReceiverSeenEvent.config = event.params.config
  dripsReceiverSeenEvent.blockTimestamp = event.block.timestamp
  dripsReceiverSeenEvent.save()

  // TODO -- we need to add some kind of sequence number so we can historically order DripsSetEvents that occur within the same block
}

export function handleSqueezedDrips(event: SqueezedDrips): void {

    let squeezedDripsEvent = new SqueezedDripsEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
    squeezedDripsEvent.userId = event.params.userId.toString()
    squeezedDripsEvent.assetId = event.params.assetId
    squeezedDripsEvent.senderId = event.params.senderId.toString()
    squeezedDripsEvent.amt = event.params.amt
    squeezedDripsEvent.blockTimestamp = event.block.timestamp
    squeezedDripsEvent.save()
}

export function handleReceivedDrips(event: ReceivedDrips): void {

  let receivedDripsEvent = new ReceivedDripsEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  receivedDripsEvent.userId = event.params.userId.toString()
  receivedDripsEvent.assetId = event.params.assetId
  receivedDripsEvent.amt = event.params.amt
  receivedDripsEvent.receivableCycles = event.params.receivableCycles
  receivedDripsEvent.blockTimestamp = event.block.timestamp
  receivedDripsEvent.save()
}

export function handleSplitsSet(event: SplitsSet): void {

  // If the User doesn't exist, create it
  let userId = event.params.userId.toString()
  let user = User.load(userId)
  if (!user) {
    user = new User(userId)
    user.splitsEntryIds = []
  } else {
    // If this is an update, we need to delete the old SplitsEntry values and clear the
    // splitsEntryIds field
    if (!(event.params.receiversHash.toHexString() == user.splitsReceiversHash.toHexString())) {
      let newSplitsEntryIds: string[] = []
      for (let i = 0; i<user.splitsEntryIds.length; i++) {
        let splitsEntryId = user.splitsEntryIds[i]
        let splitsEntry = SplitsEntry.load(splitsEntryId)
        if (splitsEntry) {
          store.remove('SplitsEntry', splitsEntryId)
        }
      }
      user.splitsEntryIds = newSplitsEntryIds
    }
  }
  user.splitsReceiversHash = event.params.receiversHash
  user.lastUpdatedBlockTimestamp = event.block.timestamp
  user.save()

  // Add the SplitsSetEvent
  let splitsSetEventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let splitsSetEvent = new SplitsSetEvent(splitsSetEventId)
  splitsSetEvent.userId = event.params.userId.toString()
  splitsSetEvent.receiversHash = event.params.receiversHash
  splitsSetEvent.blockTimestamp = event.block.timestamp
  splitsSetEvent.save()

  // Create/update LastSplitsSetUserMapping for this receiversHash
  let lastSplitsSetUserMappingId = event.params.receiversHash.toHexString()
  let lastSplitsSetUserMapping = LastSetSplitsUserMapping.load(lastSplitsSetUserMappingId)
  if (!lastSplitsSetUserMapping) {
    lastSplitsSetUserMapping = new LastSetSplitsUserMapping(lastSplitsSetUserMappingId)
  }
  lastSplitsSetUserMapping.splitsSetEventId = splitsSetEventId
  lastSplitsSetUserMapping.userId = event.params.userId.toString()
  lastSplitsSetUserMapping.save()

  // TODO -- we need to add some kind of sequence number so we can historically order DripsSetEvents that occur within the same block
}

export function handleSplitsReceiverSeen(event: SplitsReceiverSeen): void {

  let lastSplitsSetUserMappingId = event.params.receiversHash.toHexString()
  let lastSplitsSetUserMapping = LastSetSplitsUserMapping.load(lastSplitsSetUserMappingId)
  if (lastSplitsSetUserMapping) {
  // If the User doesn't exist, create it
    let userId = lastSplitsSetUserMapping.userId.toString()
    let user = User.load(userId)
    if (!user) {
      user = new User(userId)
      user.splitsEntryIds = []
      user.lastUpdatedBlockTimestamp = event.block.timestamp
      user.save()
    }

    // Now we can create the SplitsEntry
    if (!user.splitsEntryIds) user.splitsEntryIds = []
    let newSplitsEntryIds = user.splitsEntryIds
    // splitsEntryId = (sender's user ID + "-" + receiver's user ID)
    let splitsEntryId = lastSplitsSetUserMapping.userId.toString() + "-" + event.params.userId.toString()
    let splitsEntry = SplitsEntry.load(splitsEntryId)
    if (!splitsEntry) {
      splitsEntry = new SplitsEntry(splitsEntryId)
    }
    splitsEntry.sender = lastSplitsSetUserMapping.userId.toString()
    splitsEntry.userId = event.params.userId.toString()
    splitsEntry.weight = event.params.weight
    splitsEntry.save()
    
    newSplitsEntryIds.push(splitsEntryId)
    user.splitsEntryIds = newSplitsEntryIds
    user.lastUpdatedBlockTimestamp = event.block.timestamp
    user.save()
  }

  // Create the SplitsReceiverSeenEvent entity
  let splitsReceiverSeenEventId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let splitsReceiverSeenEvent = new SplitsReceiverSeenEvent(splitsReceiverSeenEventId)
  splitsReceiverSeenEvent.receiversHash = event.params.receiversHash
  if (lastSplitsSetUserMapping) {
    splitsReceiverSeenEvent.splitsSetEvent = lastSplitsSetUserMapping.splitsSetEventId
  }
  if (lastSplitsSetUserMapping) {
    splitsReceiverSeenEvent.senderUserId = lastSplitsSetUserMapping.userId
  }
  splitsReceiverSeenEvent.receiverUserId = event.params.userId.toString()
  splitsReceiverSeenEvent.weight = event.params.weight
  splitsReceiverSeenEvent.blockTimestamp = event.block.timestamp
  splitsReceiverSeenEvent.save()

  // TODO -- we need to add some kind of sequence number so we can historically order DripsSetEvents that occur within the same block
}

export function handleSplit(event: Split): void {

  let splitEvent = new SplitEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  splitEvent.userId = event.params.userId.toString()
  splitEvent.receiverId = event.params.receiver.toString()
  splitEvent.assetId = event.params.assetId
  splitEvent.amt = event.params.amt
  splitEvent.blockTimestamp = event.block.timestamp
  splitEvent.save()
}

export function handleGiven(event: Given): void {

  let assetId = event.params.assetId.toString()

  let givenEvent = new GivenEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  givenEvent.userId = event.params.userId.toString()
  givenEvent.receiverUserId = event.params.receiver.toString()
  givenEvent.assetId = event.params.assetId
  givenEvent.amt = event.params.amt
  givenEvent.blockTimestamp = event.block.timestamp
  givenEvent.save()
}

export function handleAppRegistered(event: DriverRegistered): void {

  let appId = event.params.driverId.toString()
  let app = App.load(appId)
  if (!app) {
    app = new App(appId)
  }
  app.appAddress = event.params.driverAddr
  app.lastUpdatedBlockTimestamp = event.block.timestamp
  app.save()
}

export function handleAppAddressUpdated(event: DriverAddressUpdated): void {

  let appId = event.params.driverId.toString()
  let app = App.load(appId)
  if (app) {
    app.appAddress = event.params.newDriverAddr
    app.lastUpdatedBlockTimestamp = event.block.timestamp
    app.save()
  }
}

export function handleNFTSubAccountTransfer(event: Transfer): void {

  let id = event.params.tokenId.toString()
  let nftSubAccount = NFTSubAccount.load(id)
  if (!nftSubAccount) {
    nftSubAccount = new NFTSubAccount(id)
  }
  nftSubAccount.ownerAddress = event.params.to
  nftSubAccount.save()
}

export function handleImmutableSplitsCreated(event: CreatedSplits): void {

  let immutableSplitsCreated = new ImmutableSplitsCreated(event.params.userId.toString() + "-" + event.params.receiversHash.toHexString())
  immutableSplitsCreated.userId = event.params.userId.toString()
  immutableSplitsCreated.receiversHash = event.params.receiversHash
  immutableSplitsCreated.save()
}