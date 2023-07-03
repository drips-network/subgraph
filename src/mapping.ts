/* eslint-disable @typescript-eslint/ban-types */
import { BigInt, Bytes } from '@graphprotocol/graph-ts';
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
  UserMetadataEmitted,
  Collected,
  Collectable
} from '../generated/Drips/Drips';
import { Transfer } from '../generated/NFTDriver/NFTDriver';
import { CreatedSplits } from '../generated/ImmutableSplitsDriver/ImmutableSplitsDriver';
import {
  User,
  StreamsEntry,
  UserAssetConfig,
  StreamsSetEvent,
  LastSetStreamUserMapping,
  StreamReceiverSeenEvent,
  ReceivedStreamsEvent,
  SqueezedStreamsEvent,
  SplitsEntry,
  SplitsSetEvent,
  LastSetSplitsUserMapping,
  SplitsReceiverSeenEvent,
  SplitEvent,
  CollectedEvent,
  CollectableEvent,
  UserMetadataByKey,
  UserMetadataEvent,
  GivenEvent,
  App,
  NFTSubAccount,
  ImmutableSplitsCreated
} from '../generated/schema';
import { store } from '@graphprotocol/graph-ts';

export function handleUserMetadata(event: UserMetadataEmitted): void {
  const userMetadataByKeyId = event.params.userId.toString() + '-' + event.params.key.toString();
  let userMetadataByKey = UserMetadataByKey.load(userMetadataByKeyId);
  if (!userMetadataByKey) {
    userMetadataByKey = new UserMetadataByKey(userMetadataByKeyId);
  }
  userMetadataByKey.userId = event.params.userId.toString();
  userMetadataByKey.key = event.params.key;
  userMetadataByKey.value = event.params.value;
  userMetadataByKey.lastUpdatedBlockTimestamp = event.block.timestamp;
  userMetadataByKey.save();

  const userMetadataEvent = new UserMetadataEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  userMetadataEvent.userId = event.params.userId.toString();
  userMetadataEvent.key = event.params.key;
  userMetadataEvent.value = event.params.value;
  userMetadataEvent.lastUpdatedBlockTimestamp = event.block.timestamp;
  userMetadataEvent.save();
}

export function handleCollectable(event: Collectable): void {
  const userId = event.params.userId.toString();
  const user = getOrCreateUser(userId, event.block.timestamp);

  const assetId = event.params.assetId;

  const collectableEvent = new CollectableEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  collectableEvent.user = userId;
  collectableEvent.assetId = event.params.assetId;
  collectableEvent.amt = event.params.amt;
  collectableEvent.blockTimestamp = event.block.timestamp;
  collectableEvent.save();

  // Update amountPostSplitsCollectable on the UserAssetConfig of the receving user
  const userAssetConfig = getOrCreateUserAssetConfig(userId, assetId, event.block.timestamp);
  userAssetConfig.amountPostSplitCollectable = userAssetConfig.amountPostSplitCollectable.plus(
    event.params.amt
  );
  userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  userAssetConfig.save();
}

export function handleCollected(event: Collected): void {
  const userId = event.params.userId.toString();
  const user = getOrCreateUser(userId, event.block.timestamp);

  const assetId = event.params.assetId;

  // Log the raw event
  const collectedEvent = new CollectedEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  collectedEvent.user = userId;
  collectedEvent.assetId = event.params.assetId;
  collectedEvent.collected = event.params.collected;
  collectedEvent.blockTimestamp = event.block.timestamp;
  collectedEvent.save();

  // Update amountCollected and amountPostSplitsCollectable on the UserAssetConfig of the receving user
  const userAssetConfig = getOrCreateUserAssetConfig(userId, assetId, event.block.timestamp);
  userAssetConfig.amountCollected = userAssetConfig.amountCollected.plus(event.params.collected);
  userAssetConfig.amountPostSplitCollectable = new BigInt(0);
  userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  userAssetConfig.save();
}

export function handleStreamsSet(event: StreamsSet): void {
  // If the User doesn't exist, create it
  const userId = event.params.userId.toString();
  const user = getOrCreateUser(userId, event.block.timestamp);

  // Next create or update the UserAssetConfig and clear any old StreamsEntries if needed
  const userAssetConfigId = event.params.userId.toString() + '-' + event.params.assetId.toString();
  let userAssetConfig = UserAssetConfig.load(userAssetConfigId);
  if (!userAssetConfig) {
    userAssetConfig = getOrCreateUserAssetConfig(
      userId,
      event.params.assetId,
      event.block.timestamp
    );
  } else {
    // If this is an update, we need to delete the old StreamsEntry values and clear the
    // streamsEntryIds field
    if (
      !(event.params.receiversHash.toHexString() == userAssetConfig.assetConfigHash.toHexString())
    ) {
      const newStreamsEntryIds: string[] = [];
      for (let i = 0; i < userAssetConfig.streamsEntryIds.length; i++) {
        const streamsEntryId = userAssetConfig.streamsEntryIds[i];
        const streamsEntry = StreamsEntry.load(streamsEntryId);
        if (streamsEntry) {
          store.remove('StreamsEntry', streamsEntryId);
        }
      }
      userAssetConfig.streamsEntryIds = newStreamsEntryIds;
    }
  }
  userAssetConfig.balance = event.params.balance;
  userAssetConfig.assetConfigHash = event.params.receiversHash;
  userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  userAssetConfig.save();

  // Add the StreamsSetEvent
  const streamsSetEventId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  const streamsSetEvent = new StreamsSetEvent(streamsSetEventId);
  streamsSetEvent.userId = event.params.userId.toString();
  streamsSetEvent.assetId = event.params.assetId;
  streamsSetEvent.receiversHash = event.params.receiversHash;
  streamsSetEvent.streamsHistoryHash = event.params.streamsHistoryHash;
  streamsSetEvent.balance = event.params.balance;
  streamsSetEvent.maxEnd = event.params.maxEnd;
  streamsSetEvent.blockTimestamp = event.block.timestamp;
  streamsSetEvent.save();

  // TODO -- we need to add some kind of sequence number so we can historically order StreamsSetEvents that occur within the same block

  // Create/update LastStreamsSetUserMapping for this receiversHash
  const lastStreamsSetUserMappingId = event.params.receiversHash.toHexString();
  let lastStreamsSetUserMapping = LastSetStreamUserMapping.load(lastStreamsSetUserMappingId);
  if (!lastStreamsSetUserMapping) {
    lastStreamsSetUserMapping = new LastSetStreamUserMapping(lastStreamsSetUserMappingId);
  }
  lastStreamsSetUserMapping.streamsSetEventId = streamsSetEventId;
  lastStreamsSetUserMapping.userId = event.params.userId.toString();
  lastStreamsSetUserMapping.assetId = event.params.assetId;
  lastStreamsSetUserMapping.save();
}

export function handleStreamReceiverSeen(event: StreamReceiverSeen): void {
  const receiversHash = event.params.receiversHash;
  const lastSetStreamsUserMapping = LastSetStreamUserMapping.load(receiversHash.toHexString());

  // We need to use the LastSetStreamUserMapping to look up the userId and assetId associated with this receiverHash
  if (lastSetStreamsUserMapping) {
    const userId = lastSetStreamsUserMapping.userId.toString();
    const userAssetConfigId = userId + '-' + lastSetStreamsUserMapping.assetId.toString();
    const userAssetConfig = getOrCreateUserAssetConfig(
      userId,
      lastSetStreamsUserMapping.assetId,
      event.block.timestamp
    );

    // Now we can create the StreamsEntry
    if (!userAssetConfig.streamsEntryIds) userAssetConfig.streamsEntryIds = [];
    const newStreamsEntryIds = userAssetConfig.streamsEntryIds;
    const streamsEntryId =
      lastSetStreamsUserMapping.userId.toString() +
      '-' +
      event.params.userId.toString() +
      '-' +
      lastSetStreamsUserMapping.assetId.toString();
    let streamsEntry = StreamsEntry.load(streamsEntryId);
    if (!streamsEntry) {
      streamsEntry = new StreamsEntry(streamsEntryId);
    }
    streamsEntry.sender = lastSetStreamsUserMapping.userId.toString();
    streamsEntry.senderAssetConfig = userAssetConfigId;
    streamsEntry.userId = event.params.userId.toString();
    streamsEntry.config = event.params.config;
    streamsEntry.save();

    newStreamsEntryIds.push(streamsEntryId);
    userAssetConfig.streamsEntryIds = newStreamsEntryIds;
    userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
    userAssetConfig.save();
  }

  // Create the StreamReceiverSeenEvent entity
  const streamReceiverSeenEventId =
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  const streamReceiverSeenEvent = new StreamReceiverSeenEvent(streamReceiverSeenEventId);
  if (lastSetStreamsUserMapping) {
    streamReceiverSeenEvent.streamsSetEvent = lastSetStreamsUserMapping.streamsSetEventId;
  }
  streamReceiverSeenEvent.receiversHash = event.params.receiversHash;
  if (lastSetStreamsUserMapping) {
    streamReceiverSeenEvent.senderUserId = lastSetStreamsUserMapping.userId;
  }
  streamReceiverSeenEvent.receiverUserId = event.params.userId.toString();
  streamReceiverSeenEvent.config = event.params.config;
  streamReceiverSeenEvent.blockTimestamp = event.block.timestamp;
  streamReceiverSeenEvent.save();

  // TODO -- we need to add some kind of sequence number so we can historically order StreamsSetEvents that occur within the same block
}

export function handleSqueezedStreams(event: SqueezedStreams): void {
  const squeezedStreamsEvent = new SqueezedStreamsEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  squeezedStreamsEvent.userId = event.params.userId.toString();
  squeezedStreamsEvent.assetId = event.params.assetId;
  squeezedStreamsEvent.senderId = event.params.senderId.toString();
  squeezedStreamsEvent.amt = event.params.amt;
  squeezedStreamsEvent.streamsHistoryHashes = event.params.streamsHistoryHashes;
  squeezedStreamsEvent.blockTimestamp = event.block.timestamp;
  squeezedStreamsEvent.save();

  // Note the tokens received on the UserAssetConfig of the receiving user
  const userAssetConfig = getOrCreateUserAssetConfig(
    squeezedStreamsEvent.userId,
    squeezedStreamsEvent.assetId,
    event.block.timestamp
  );
  userAssetConfig.amountSplittable = userAssetConfig.amountSplittable.plus(event.params.amt);
  userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  userAssetConfig.save();
}

export function handleReceivedStreams(event: ReceivedStreams): void {
  // Store the raw event
  const receivedStreamsEvent = new ReceivedStreamsEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  receivedStreamsEvent.userId = event.params.userId.toString();
  receivedStreamsEvent.assetId = event.params.assetId;
  receivedStreamsEvent.amt = event.params.amt;
  receivedStreamsEvent.receivableCycles = event.params.receivableCycles;
  receivedStreamsEvent.blockTimestamp = event.block.timestamp;
  receivedStreamsEvent.save();

  // Note the tokens received on the UserAssetConfig of the receiving user
  const userAssetConfig = getOrCreateUserAssetConfig(
    receivedStreamsEvent.userId,
    receivedStreamsEvent.assetId,
    event.block.timestamp
  );
  userAssetConfig.amountSplittable = userAssetConfig.amountSplittable.plus(event.params.amt);
  userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  userAssetConfig.save();
}

export function handleSplitsSet(event: SplitsSet): void {
  // If the User doesn't exist, create it
  const userId = event.params.userId.toString();

  let user = User.load(userId);
  if (!user) {
    user = getOrCreateUser(userId, event.block.timestamp);
  } else {
    // If this is an update, we need to delete the old SplitsEntry values and clear the
    // splitsEntryIds field
    if (!(event.params.receiversHash.toHexString() == user.splitsReceiversHash.toHexString())) {
      const newSplitsEntryIds: string[] = [];
      for (let i = 0; i < user.splitsEntryIds.length; i++) {
        const splitsEntryId = user.splitsEntryIds[i];
        const splitsEntry = SplitsEntry.load(splitsEntryId);
        if (splitsEntry) {
          store.remove('SplitsEntry', splitsEntryId);
        }
      }
      user.splitsEntryIds = newSplitsEntryIds;
    }
  }
  user.splitsReceiversHash = event.params.receiversHash;
  user.lastUpdatedBlockTimestamp = event.block.timestamp;
  user.save();

  // Add the SplitsSetEvent
  const splitsSetEventId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  const splitsSetEvent = new SplitsSetEvent(splitsSetEventId);
  splitsSetEvent.userId = event.params.userId.toString();
  splitsSetEvent.receiversHash = event.params.receiversHash;
  splitsSetEvent.blockTimestamp = event.block.timestamp;
  splitsSetEvent.save();

  // Create/update LastSplitsSetUserMapping for this receiversHash
  const lastSplitsSetUserMappingId = event.params.receiversHash.toHexString();
  let lastSplitsSetUserMapping = LastSetSplitsUserMapping.load(lastSplitsSetUserMappingId);
  if (!lastSplitsSetUserMapping) {
    lastSplitsSetUserMapping = new LastSetSplitsUserMapping(lastSplitsSetUserMappingId);
  }
  lastSplitsSetUserMapping.splitsSetEventId = splitsSetEventId;
  lastSplitsSetUserMapping.userId = event.params.userId.toString();
  lastSplitsSetUserMapping.save();

  // TODO -- we need to add some kind of sequence number so we can historically order StreamsSetEvents that occur within the same block
}

export function handleSplitsReceiverSeen(event: SplitsReceiverSeen): void {
  const lastSplitsSetUserMappingId = event.params.receiversHash.toHexString();
  const lastSplitsSetUserMapping = LastSetSplitsUserMapping.load(lastSplitsSetUserMappingId);
  if (lastSplitsSetUserMapping) {
    // If the User doesn't exist, create it
    const userId = lastSplitsSetUserMapping.userId.toString();
    const user = getOrCreateUser(userId, event.block.timestamp);

    // Now we can create the SplitsEntry
    if (!user.splitsEntryIds) user.splitsEntryIds = [];
    const newSplitsEntryIds = user.splitsEntryIds;
    // splitsEntryId = (sender's user ID + "-" + receiver's user ID)
    const splitsEntryId =
      lastSplitsSetUserMapping.userId.toString() + '-' + event.params.userId.toString();
    let splitsEntry = SplitsEntry.load(splitsEntryId);
    if (!splitsEntry) {
      splitsEntry = new SplitsEntry(splitsEntryId);
    }
    splitsEntry.sender = lastSplitsSetUserMapping.userId.toString();
    splitsEntry.userId = event.params.userId.toString();
    splitsEntry.weight = event.params.weight;
    splitsEntry.save();

    newSplitsEntryIds.push(splitsEntryId);
    user.splitsEntryIds = newSplitsEntryIds;
    user.lastUpdatedBlockTimestamp = event.block.timestamp;
    user.save();
  }

  // Create the SplitsReceiverSeenEvent entity
  const splitsReceiverSeenEventId =
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  const splitsReceiverSeenEvent = new SplitsReceiverSeenEvent(splitsReceiverSeenEventId);
  splitsReceiverSeenEvent.receiversHash = event.params.receiversHash;
  if (lastSplitsSetUserMapping) {
    splitsReceiverSeenEvent.splitsSetEvent = lastSplitsSetUserMapping.splitsSetEventId;
  }
  if (lastSplitsSetUserMapping) {
    splitsReceiverSeenEvent.senderUserId = lastSplitsSetUserMapping.userId;
  }
  splitsReceiverSeenEvent.receiverUserId = event.params.userId.toString();
  splitsReceiverSeenEvent.weight = event.params.weight;
  splitsReceiverSeenEvent.blockTimestamp = event.block.timestamp;
  splitsReceiverSeenEvent.save();

  // TODO -- we need to add some kind of sequence number so we can historically order StreamsSetEvents that occur within the same block
}

export function handleSplit(event: Split): void {
  const splitEvent = new SplitEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  splitEvent.userId = event.params.userId.toString();
  splitEvent.receiverId = event.params.receiver.toString();
  splitEvent.assetId = event.params.assetId;
  splitEvent.amt = event.params.amt;
  splitEvent.blockTimestamp = event.block.timestamp;
  splitEvent.save();

  // When a user calls split() we need to zero-out their splittable balance
  const splittingUserAssetConfig = getOrCreateUserAssetConfig(
    splitEvent.userId,
    event.params.assetId,
    event.block.timestamp
  );
  splittingUserAssetConfig.amountSplittable = new BigInt(0);
  splittingUserAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  splittingUserAssetConfig.save();

  // Note the tokens received on the UserAssetConfig of the receiving user
  const receivingUserAssetConfig = getOrCreateUserAssetConfig(
    splitEvent.receiverId,
    event.params.assetId,
    event.block.timestamp
  );
  receivingUserAssetConfig.amountSplittable = receivingUserAssetConfig.amountSplittable.plus(
    event.params.amt
  );
  receivingUserAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  receivingUserAssetConfig.save();
}

export function handleGiven(event: Given): void {
  // Log the raw event
  const givenEvent = new GivenEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  givenEvent.userId = event.params.userId.toString();
  givenEvent.receiverUserId = event.params.receiver.toString();
  givenEvent.assetId = event.params.assetId;
  givenEvent.amt = event.params.amt;
  givenEvent.blockTimestamp = event.block.timestamp;
  givenEvent.save();

  // Note the tokens received on the UserAssetConfig of the receiving user
  const userAssetConfig = getOrCreateUserAssetConfig(
    givenEvent.userId,
    event.params.assetId,
    event.block.timestamp
  );
  userAssetConfig.amountSplittable = userAssetConfig.amountSplittable.plus(event.params.amt);
  userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  userAssetConfig.save();
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
  nftSubAccount.ownerAddress = event.params.to;
  nftSubAccount.save();
}

export function handleImmutableSplitsCreated(event: CreatedSplits): void {
  const immutableSplitsCreated = new ImmutableSplitsCreated(
    event.params.userId.toString() + '-' + event.params.receiversHash.toHexString()
  );
  immutableSplitsCreated.userId = event.params.userId.toString();
  immutableSplitsCreated.receiversHash = event.params.receiversHash;
  immutableSplitsCreated.save();
}

function getOrCreateUser(userId: string, blockTimestamp: BigInt): User {
  let user = User.load(userId);

  if (!user) {
    user = new User(userId);

    user.splitsEntryIds = [];
    user.lastUpdatedBlockTimestamp = blockTimestamp;
    user.splitsReceiversHash = Bytes.fromUTF8('');

    user.save();
  }

  return user;
}

function getOrCreateUserAssetConfig(
  userId: string,
  assetId: BigInt,
  blockTimestamp: BigInt
): UserAssetConfig {
  // Make sure the User exists.
  getOrCreateUser(userId, blockTimestamp);

  // Get or create the UserAssetConfig.
  const userAssetConfigId = userId.toString() + '-' + assetId.toString();

  let userAssetConfig = UserAssetConfig.load(userAssetConfigId);

  if (!userAssetConfig) {
    userAssetConfig = new UserAssetConfig(userAssetConfigId);

    userAssetConfig.user = userId;
    userAssetConfig.assetId = assetId;
    userAssetConfig.streamsEntryIds = [];
    userAssetConfig.balance = BigInt.fromI32(0);
    userAssetConfig.amountCollected = BigInt.fromI32(0);
    userAssetConfig.amountSplittable = BigInt.fromI32(0);
    userAssetConfig.assetConfigHash = Bytes.fromUTF8('');
    userAssetConfig.lastUpdatedBlockTimestamp = blockTimestamp;
    userAssetConfig.lastUpdatedBlockTimestamp = BigInt.fromI32(0);
    userAssetConfig.amountPostSplitCollectable = BigInt.fromI32(0);

    userAssetConfig.save();
  }

  return userAssetConfig;
}
