/* eslint-disable @typescript-eslint/ban-types */
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  StreamsSet,
  StreamReceiverSeen,
  ReceivedStreams,
  SqueezedStreams,
  SplitsSet,
  SplitsReceiverSeen,
  Split,
  Given,
  DriverRegistered,
  DriverAddressUpdated,
  AccountMetadataEmitted,
  Collected,
  Collectable
} from '../generated/Drips/Drips';
import { Transfer } from '../generated/NFTDriver/NFTDriver';
import { CreatedSplits } from '../generated/ImmutableSplitsDriver/ImmutableSplitsDriver';
import {
  Account,
  StreamsEntry,
  AccountAssetConfig,
  StreamsSetEvent,
  LastSetStreamAccountMapping,
  StreamReceiverSeenEvent,
  ReceivedStreamsEvent,
  SqueezedStreamsEvent,
  SplitsEntry,
  SplitsSetEvent,
  LastSetSplitsAccountMapping,
  SplitsReceiverSeenEvent,
  SplitEvent,
  CollectedEvent,
  CollectableEvent,
  AccountMetadataByKey,
  AccountMetadataEvent,
  GivenEvent,
  App,
  NFTSubAccount,
  ImmutableSplitsCreated
} from '../generated/schema';
import { store } from '@graphprotocol/graph-ts';
import { erc20TokenToAssetId } from './utils';

export function handleAccountMetadata(event: AccountMetadataEmitted): void {
  const accountMetadataByKeyId =
    event.params.accountId.toString() + '-' + event.params.key.toString();
  let accountMetadataByKey = AccountMetadataByKey.load(accountMetadataByKeyId);
  if (!accountMetadataByKey) {
    accountMetadataByKey = new AccountMetadataByKey(accountMetadataByKeyId);
  }
  accountMetadataByKey.accountId = event.params.accountId.toString();
  accountMetadataByKey.key = event.params.key;
  accountMetadataByKey.value = event.params.value;
  accountMetadataByKey.lastUpdatedBlockTimestamp = event.block.timestamp;
  accountMetadataByKey.save();

  const accountMetadataEvent = new AccountMetadataEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  accountMetadataEvent.accountId = event.params.accountId.toString();
  accountMetadataEvent.key = event.params.key;
  accountMetadataEvent.value = event.params.value;
  accountMetadataEvent.lastUpdatedBlockTimestamp = event.block.timestamp;
  accountMetadataEvent.save();
}

export function handleCollectable(event: Collectable): void {
  const accountId = event.params.accountId.toString();
  const account = getOrCreateAccount(accountId, event.block.timestamp);

  const assetId = erc20TokenToAssetId(event.params.erc20);

  const collectableEvent = new CollectableEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  collectableEvent.account = accountId;
  collectableEvent.assetId = erc20TokenToAssetId(event.params.erc20);
  collectableEvent.amt = event.params.amt;
  collectableEvent.blockTimestamp = event.block.timestamp;
  collectableEvent.save();

  // Update amountPostSplitsCollectable on the AccountAssetConfig of the receving account
  const accountAssetConfig = getOrCreateAccountAssetConfig(
    accountId,
    assetId,
    event.block.timestamp
  );
  accountAssetConfig.amountPostSplitCollectable =
    accountAssetConfig.amountPostSplitCollectable.plus(event.params.amt);
  accountAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  accountAssetConfig.save();
}

export function handleCollected(event: Collected): void {
  const accountId = event.params.accountId.toString();
  const account = getOrCreateAccount(accountId, event.block.timestamp);

  const assetId = erc20TokenToAssetId(event.params.erc20);

  // Log the raw event
  const collectedEvent = new CollectedEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  collectedEvent.account = accountId;
  collectedEvent.assetId = erc20TokenToAssetId(event.params.erc20);
  collectedEvent.collected = event.params.collected;
  collectedEvent.blockTimestamp = event.block.timestamp;
  collectedEvent.save();

  // Update amountCollected and amountPostSplitsCollectable on the AccountAssetConfig of the receving account
  const accountAssetConfig = getOrCreateAccountAssetConfig(
    accountId,
    assetId,
    event.block.timestamp
  );
  accountAssetConfig.amountCollected = accountAssetConfig.amountCollected.plus(
    event.params.collected
  );
  accountAssetConfig.amountPostSplitCollectable = new BigInt(0);
  accountAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  accountAssetConfig.save();
}

export function handleStreamsSet(event: StreamsSet): void {
  // If the Account doesn't exist, create it
  const accountId = event.params.accountId.toString();
  const account = getOrCreateAccount(accountId, event.block.timestamp);

  // Next create or update the AccountAssetConfig and clear any old StreamsEntries if needed
  const accountAssetConfigId =
    event.params.accountId.toString() + '-' + erc20TokenToAssetId(event.params.erc20).toString();
  let accountAssetConfig = AccountAssetConfig.load(accountAssetConfigId);
  if (!accountAssetConfig) {
    accountAssetConfig = getOrCreateAccountAssetConfig(
      accountId,
      erc20TokenToAssetId(event.params.erc20),
      event.block.timestamp
    );
  } else {
    // If this is an update, we need to delete the old StreamsEntry values and clear the
    // streamsEntryIds field
    if (
      !(
        event.params.receiversHash.toHexString() == accountAssetConfig.assetConfigHash.toHexString()
      )
    ) {
      const newStreamsEntryIds: string[] = [];
      for (let i = 0; i < accountAssetConfig.streamsEntryIds.length; i++) {
        const streamsEntryId = accountAssetConfig.streamsEntryIds[i];
        const streamsEntry = StreamsEntry.load(streamsEntryId);
        if (streamsEntry) {
          store.remove('StreamsEntry', streamsEntryId);
        }
      }
      accountAssetConfig.streamsEntryIds = newStreamsEntryIds;
    }
  }
  accountAssetConfig.balance = event.params.balance;
  accountAssetConfig.assetConfigHash = event.params.receiversHash;
  accountAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  accountAssetConfig.save();

  // Add the StreamsSetEvent
  const streamsSetEventId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  const streamsSetEvent = new StreamsSetEvent(streamsSetEventId);
  streamsSetEvent.accountId = event.params.accountId.toString();
  streamsSetEvent.assetId = erc20TokenToAssetId(event.params.erc20);
  streamsSetEvent.receiversHash = event.params.receiversHash;
  streamsSetEvent.streamsHistoryHash = event.params.streamsHistoryHash;
  streamsSetEvent.balance = event.params.balance;
  streamsSetEvent.maxEnd = event.params.maxEnd;
  streamsSetEvent.blockTimestamp = event.block.timestamp;
  streamsSetEvent.save();

  // TODO -- we need to add some kind of sequence number so we can historically order StreamsSetEvents that occur within the same block

  // Create/update LastStreamsSetAccountMapping for this receiversHash
  const lastStreamsSetAccountMappingId = event.params.receiversHash.toHexString();
  let lastStreamsSetAccountMapping = LastSetStreamAccountMapping.load(
    lastStreamsSetAccountMappingId
  );
  if (!lastStreamsSetAccountMapping) {
    lastStreamsSetAccountMapping = new LastSetStreamAccountMapping(lastStreamsSetAccountMappingId);
  }
  lastStreamsSetAccountMapping.streamsSetEventId = streamsSetEventId;
  lastStreamsSetAccountMapping.accountId = event.params.accountId.toString();
  lastStreamsSetAccountMapping.assetId = erc20TokenToAssetId(event.params.erc20);
  lastStreamsSetAccountMapping.save();
}

export function handleStreamReceiverSeen(event: StreamReceiverSeen): void {
  const receiversHash = event.params.receiversHash;
  const lastSetStreamsAccountMapping = LastSetStreamAccountMapping.load(
    receiversHash.toHexString()
  );

  // We need to use the LastSetStreamAccountMapping to look up the accountId and assetId associated with this receiverHash
  if (lastSetStreamsAccountMapping) {
    const accountId = lastSetStreamsAccountMapping.accountId.toString();
    const accountAssetConfigId = accountId + '-' + lastSetStreamsAccountMapping.assetId.toString();
    const accountAssetConfig = getOrCreateAccountAssetConfig(
      accountId,
      lastSetStreamsAccountMapping.assetId,
      event.block.timestamp
    );

    // Now we can create the StreamsEntry
    if (!accountAssetConfig.streamsEntryIds) accountAssetConfig.streamsEntryIds = [];
    const newStreamsEntryIds = accountAssetConfig.streamsEntryIds;
    const streamsEntryId =
      lastSetStreamsAccountMapping.accountId.toString() +
      '-' +
      event.params.accountId.toString() +
      '-' +
      lastSetStreamsAccountMapping.assetId.toString();
    let streamsEntry = StreamsEntry.load(streamsEntryId);
    if (!streamsEntry) {
      streamsEntry = new StreamsEntry(streamsEntryId);
    }
    streamsEntry.sender = lastSetStreamsAccountMapping.accountId.toString();
    streamsEntry.senderAssetConfig = accountAssetConfigId;
    streamsEntry.accountId = event.params.accountId.toString();
    streamsEntry.config = event.params.config;
    streamsEntry.save();

    newStreamsEntryIds.push(streamsEntryId);
    accountAssetConfig.streamsEntryIds = newStreamsEntryIds;
    accountAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
    accountAssetConfig.save();
  }

  // Create the StreamReceiverSeenEvent entity
  const streamReceiverSeenEventId =
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  const streamReceiverSeenEvent = new StreamReceiverSeenEvent(streamReceiverSeenEventId);
  if (lastSetStreamsAccountMapping) {
    streamReceiverSeenEvent.streamsSetEvent = lastSetStreamsAccountMapping.streamsSetEventId;
  }
  streamReceiverSeenEvent.receiversHash = event.params.receiversHash;
  if (lastSetStreamsAccountMapping) {
    streamReceiverSeenEvent.senderAccountId = lastSetStreamsAccountMapping.accountId;
  }
  streamReceiverSeenEvent.receiverAccountId = event.params.accountId.toString();
  streamReceiverSeenEvent.config = event.params.config;
  streamReceiverSeenEvent.blockTimestamp = event.block.timestamp;
  streamReceiverSeenEvent.save();

  // TODO -- we need to add some kind of sequence number so we can historically order StreamsSetEvents that occur within the same block
}

export function handleSqueezedStreams(event: SqueezedStreams): void {
  const squeezedStreamsEvent = new SqueezedStreamsEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  squeezedStreamsEvent.accountId = event.params.accountId.toString();
  squeezedStreamsEvent.assetId = erc20TokenToAssetId(event.params.erc20);
  squeezedStreamsEvent.senderId = event.params.senderId.toString();
  squeezedStreamsEvent.amt = event.params.amt;
  squeezedStreamsEvent.streamsHistoryHashes = event.params.streamsHistoryHashes;
  squeezedStreamsEvent.blockTimestamp = event.block.timestamp;
  squeezedStreamsEvent.save();

  // Note the tokens received on the AccountAssetConfig of the receiving account
  const accountAssetConfig = getOrCreateAccountAssetConfig(
    squeezedStreamsEvent.accountId,
    squeezedStreamsEvent.assetId,
    event.block.timestamp
  );
  accountAssetConfig.amountSplittable = accountAssetConfig.amountSplittable.plus(event.params.amt);
  accountAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  accountAssetConfig.save();
}

export function handleReceivedStreams(event: ReceivedStreams): void {
  // Store the raw event
  const receivedStreamsEvent = new ReceivedStreamsEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  receivedStreamsEvent.accountId = event.params.accountId.toString();
  receivedStreamsEvent.assetId = erc20TokenToAssetId(event.params.erc20);
  receivedStreamsEvent.amt = event.params.amt;
  receivedStreamsEvent.receivableCycles = event.params.receivableCycles;
  receivedStreamsEvent.blockTimestamp = event.block.timestamp;
  receivedStreamsEvent.save();

  // Note the tokens received on the AccountAssetConfig of the receiving account
  const accountAssetConfig = getOrCreateAccountAssetConfig(
    receivedStreamsEvent.accountId,
    receivedStreamsEvent.assetId,
    event.block.timestamp
  );
  accountAssetConfig.amountSplittable = accountAssetConfig.amountSplittable.plus(event.params.amt);
  accountAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  accountAssetConfig.save();
}

export function handleSplitsSet(event: SplitsSet): void {
  // If the Account doesn't exist, create it
  const accountId = event.params.accountId.toString();

  let account = Account.load(accountId);
  if (!account) {
    account = getOrCreateAccount(accountId, event.block.timestamp);
  } else {
    // If this is an update, we need to delete the old SplitsEntry values and clear the
    // splitsEntryIds field
    if (!(event.params.receiversHash.toHexString() == account.splitsReceiversHash.toHexString())) {
      const newSplitsEntryIds: string[] = [];
      for (let i = 0; i < account.splitsEntryIds.length; i++) {
        const splitsEntryId = account.splitsEntryIds[i];
        const splitsEntry = SplitsEntry.load(splitsEntryId);
        if (splitsEntry) {
          store.remove('SplitsEntry', splitsEntryId);
        }
      }
      account.splitsEntryIds = newSplitsEntryIds;
    }
  }
  account.splitsReceiversHash = event.params.receiversHash;
  account.lastUpdatedBlockTimestamp = event.block.timestamp;
  account.save();

  // Add the SplitsSetEvent
  const splitsSetEventId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  const splitsSetEvent = new SplitsSetEvent(splitsSetEventId);
  splitsSetEvent.accountId = event.params.accountId.toString();
  splitsSetEvent.receiversHash = event.params.receiversHash;
  splitsSetEvent.blockTimestamp = event.block.timestamp;
  splitsSetEvent.save();

  // Create/update LastSplitsSetAccountMapping for this receiversHash
  const lastSplitsSetAccountMappingId = event.params.receiversHash.toHexString();
  let lastSplitsSetAccountMapping = LastSetSplitsAccountMapping.load(lastSplitsSetAccountMappingId);
  if (!lastSplitsSetAccountMapping) {
    lastSplitsSetAccountMapping = new LastSetSplitsAccountMapping(lastSplitsSetAccountMappingId);
  }
  lastSplitsSetAccountMapping.splitsSetEventId = splitsSetEventId;
  lastSplitsSetAccountMapping.accountId = event.params.accountId.toString();
  lastSplitsSetAccountMapping.save();

  // TODO -- we need to add some kind of sequence number so we can historically order StreamsSetEvents that occur within the same block
}

export function handleSplitsReceiverSeen(event: SplitsReceiverSeen): void {
  const lastSplitsSetAccountMappingId = event.params.receiversHash.toHexString();
  const lastSplitsSetAccountMapping = LastSetSplitsAccountMapping.load(
    lastSplitsSetAccountMappingId
  );
  if (lastSplitsSetAccountMapping) {
    // If the Account doesn't exist, create it
    const accountId = lastSplitsSetAccountMapping.accountId.toString();
    const account = getOrCreateAccount(accountId, event.block.timestamp);

    // Now we can create the SplitsEntry
    if (!account.splitsEntryIds) account.splitsEntryIds = [];
    const newSplitsEntryIds = account.splitsEntryIds;
    // splitsEntryId = (sender's account ID + "-" + receiver's account ID)
    const splitsEntryId =
      lastSplitsSetAccountMapping.accountId.toString() + '-' + event.params.accountId.toString();
    let splitsEntry = SplitsEntry.load(splitsEntryId);
    if (!splitsEntry) {
      splitsEntry = new SplitsEntry(splitsEntryId);
    }
    splitsEntry.sender = lastSplitsSetAccountMapping.accountId.toString();
    splitsEntry.accountId = event.params.accountId.toString();
    splitsEntry.weight = event.params.weight;
    splitsEntry.save();

    newSplitsEntryIds.push(splitsEntryId);
    account.splitsEntryIds = newSplitsEntryIds;
    account.lastUpdatedBlockTimestamp = event.block.timestamp;
    account.save();
  }

  // Create the SplitsReceiverSeenEvent entity
  const splitsReceiverSeenEventId =
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  const splitsReceiverSeenEvent = new SplitsReceiverSeenEvent(splitsReceiverSeenEventId);
  splitsReceiverSeenEvent.receiversHash = event.params.receiversHash;
  if (lastSplitsSetAccountMapping) {
    splitsReceiverSeenEvent.splitsSetEvent = lastSplitsSetAccountMapping.splitsSetEventId;
  }
  if (lastSplitsSetAccountMapping) {
    splitsReceiverSeenEvent.senderAccountId = lastSplitsSetAccountMapping.accountId;
  }
  splitsReceiverSeenEvent.receiverAccountId = event.params.accountId.toString();
  splitsReceiverSeenEvent.weight = event.params.weight;
  splitsReceiverSeenEvent.blockTimestamp = event.block.timestamp;
  splitsReceiverSeenEvent.save();

  // TODO -- we need to add some kind of sequence number so we can historically order StreamsSetEvents that occur within the same block
}

export function handleSplit(event: Split): void {
  const splitEvent = new SplitEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  splitEvent.accountId = event.params.accountId.toString();
  splitEvent.receiverId = event.params.receiver.toString();
  splitEvent.assetId = erc20TokenToAssetId(event.params.erc20);
  splitEvent.amt = event.params.amt;
  splitEvent.blockTimestamp = event.block.timestamp;
  splitEvent.save();

  // When a account calls split() we need to zero-out their splittable balance
  const splittingAccountAssetConfig = getOrCreateAccountAssetConfig(
    splitEvent.accountId,
    erc20TokenToAssetId(event.params.erc20),
    event.block.timestamp
  );
  splittingAccountAssetConfig.amountSplittable = new BigInt(0);
  splittingAccountAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  splittingAccountAssetConfig.save();

  // Note the tokens received on the AccountAssetConfig of the receiving account
  const receivingAccountAssetConfig = getOrCreateAccountAssetConfig(
    splitEvent.receiverId,
    erc20TokenToAssetId(event.params.erc20),
    event.block.timestamp
  );
  receivingAccountAssetConfig.amountSplittable = receivingAccountAssetConfig.amountSplittable.plus(
    event.params.amt
  );
  receivingAccountAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  receivingAccountAssetConfig.save();
}

export function handleGiven(event: Given): void {
  // Log the raw event
  const givenEvent = new GivenEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  givenEvent.accountId = event.params.accountId.toString();
  givenEvent.receiverAccountId = event.params.receiver.toString();
  givenEvent.assetId = erc20TokenToAssetId(event.params.erc20);
  givenEvent.amt = event.params.amt;
  givenEvent.blockTimestamp = event.block.timestamp;
  givenEvent.save();

  // Note the tokens received on the AccountAssetConfig of the receiving account
  const accountAssetConfig = getOrCreateAccountAssetConfig(
    givenEvent.accountId,
    erc20TokenToAssetId(event.params.erc20),
    event.block.timestamp
  );
  accountAssetConfig.amountSplittable = accountAssetConfig.amountSplittable.plus(event.params.amt);
  accountAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  accountAssetConfig.save();
}

export function handleAppRegistered(event: DriverRegistered): void {
  const appId = event.params.driverId.toString();
  let app = App.load(appId);
  if (!app) {
    app = new App(appId);
  }
  app.appAddress = event.params.driverAddr;
  app.lastUpdatedBlockTimestamp = event.block.timestamp;
  app.save();
}

export function handleAppAddressUpdated(event: DriverAddressUpdated): void {
  const appId = event.params.driverId.toString();
  const app = App.load(appId);
  if (app) {
    app.appAddress = event.params.newDriverAddr;
    app.lastUpdatedBlockTimestamp = event.block.timestamp;
    app.save();
  }
}

export function handleNFTSubAccountTransfer(event: Transfer): void {
  const id = event.params.tokenId.toString();

  let nftSubAccount = NFTSubAccount.load(id);
  if (!nftSubAccount) {
    nftSubAccount = new NFTSubAccount(id);
  }

  // If the from address is zero, this is a mint.
  if (event.params.from == Address.zero()) {
    nftSubAccount.originalOwnerAddress = event.params.to;
  }

  nftSubAccount.ownerAddress = event.params.to;

  nftSubAccount.save();
}

export function handleImmutableSplitsCreated(event: CreatedSplits): void {
  const immutableSplitsCreated = new ImmutableSplitsCreated(
    event.params.accountId.toString() + '-' + event.params.receiversHash.toHexString()
  );
  immutableSplitsCreated.accountId = event.params.accountId.toString();
  immutableSplitsCreated.receiversHash = event.params.receiversHash;
  immutableSplitsCreated.save();
}

function getOrCreateAccount(accountId: string, blockTimestamp: BigInt): Account {
  let account = Account.load(accountId);

  if (!account) {
    account = new Account(accountId);

    account.splitsEntryIds = [];
    account.lastUpdatedBlockTimestamp = blockTimestamp;
    account.splitsReceiversHash = Bytes.fromUTF8('');

    account.save();
  }

  return account;
}

function getOrCreateAccountAssetConfig(
  accountId: string,
  assetId: BigInt,
  blockTimestamp: BigInt
): AccountAssetConfig {
  // Make sure the Account exists.
  getOrCreateAccount(accountId, blockTimestamp);

  // Get or create the AccountAssetConfig.
  const accountAssetConfigId = accountId.toString() + '-' + assetId.toString();

  let accountAssetConfig = AccountAssetConfig.load(accountAssetConfigId);

  if (!accountAssetConfig) {
    accountAssetConfig = new AccountAssetConfig(accountAssetConfigId);

    accountAssetConfig.account = accountId;
    accountAssetConfig.assetId = assetId;
    accountAssetConfig.streamsEntryIds = [];
    accountAssetConfig.balance = BigInt.fromI32(0);
    accountAssetConfig.amountCollected = BigInt.fromI32(0);
    accountAssetConfig.amountSplittable = BigInt.fromI32(0);
    accountAssetConfig.assetConfigHash = Bytes.fromUTF8('');
    accountAssetConfig.lastUpdatedBlockTimestamp = blockTimestamp;
    accountAssetConfig.lastUpdatedBlockTimestamp = BigInt.fromI32(0);
    accountAssetConfig.amountPostSplitCollectable = BigInt.fromI32(0);

    accountAssetConfig.save();
  }

  return accountAssetConfig;
}
