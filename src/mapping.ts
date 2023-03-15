/* eslint-disable @typescript-eslint/ban-types */
import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  DripsSet,
  DripsReceiverSeen,
  ReceivedDrips,
  SqueezedDrips,
  SplitsSet,
  SplitsReceiverSeen,
  Split,
  Given,
  DriverRegistered,
  DriverAddressUpdated,
  UserMetadataEmitted,
  Collected,
  Collectable
} from '../generated/DripsHub/DripsHub';
import { Transfer } from '../generated/NFTDriver/NFTDriver';
import { CreatedSplits } from '../generated/ImmutableSplitsDriver/ImmutableSplitsDriver';
import {
  User,
  DripsEntry,
  UserAssetConfig,
  DripsSetEvent,
  LastSetDripsUserMapping,
  DripsReceiverSeenEvent,
  ReceivedDripsEvent,
  SqueezedDripsEvent,
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

export function handleDripsSet(event: DripsSet): void {
  // If the User doesn't exist, create it
  const userId = event.params.userId.toString();
  const user = getOrCreateUser(userId, event.block.timestamp);

  // Next create or update the UserAssetConfig and clear any old DripsEntries if needed
  const userAssetConfigId = event.params.userId.toString() + '-' + event.params.assetId.toString();
  let userAssetConfig = UserAssetConfig.load(userAssetConfigId);
  if (!userAssetConfig) {
    userAssetConfig = getOrCreateUserAssetConfig(
      userId,
      event.params.assetId,
      event.block.timestamp
    );
  } else {
    // If this is an update, we need to delete the old DripsEntry values and clear the
    // dripsEntryIds field
    if (
      !(event.params.receiversHash.toHexString() == userAssetConfig.assetConfigHash.toHexString())
    ) {
      const newDripsEntryIds: string[] = [];
      for (let i = 0; i < userAssetConfig.dripsEntryIds.length; i++) {
        const dripsEntryId = userAssetConfig.dripsEntryIds[i];
        const dripsEntry = DripsEntry.load(dripsEntryId);
        if (dripsEntry) {
          store.remove('DripsEntry', dripsEntryId);
        }
      }
      userAssetConfig.dripsEntryIds = newDripsEntryIds;
    }
  }
  userAssetConfig.balance = event.params.balance;
  userAssetConfig.assetConfigHash = event.params.receiversHash;
  userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  userAssetConfig.save();

  // Add the DripsSetEvent
  const dripsSetEventId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  const dripsSetEvent = new DripsSetEvent(dripsSetEventId);
  dripsSetEvent.userId = event.params.userId.toString();
  dripsSetEvent.assetId = event.params.assetId;
  dripsSetEvent.receiversHash = event.params.receiversHash;
  dripsSetEvent.dripsHistoryHash = event.params.dripsHistoryHash;
  dripsSetEvent.balance = event.params.balance;
  dripsSetEvent.maxEnd = event.params.maxEnd;
  dripsSetEvent.blockTimestamp = event.block.timestamp;
  dripsSetEvent.save();

  // TODO -- we need to add some kind of sequence number so we can historically order DripsSetEvents that occur within the same block

  // Create/update LastDripsSetUserMapping for this receiversHash
  const lastDripsSetUserMappingId = event.params.receiversHash.toHexString();
  let lastDripsSetUserMapping = LastSetDripsUserMapping.load(lastDripsSetUserMappingId);
  if (!lastDripsSetUserMapping) {
    lastDripsSetUserMapping = new LastSetDripsUserMapping(lastDripsSetUserMappingId);
  }
  lastDripsSetUserMapping.dripsSetEventId = dripsSetEventId;
  lastDripsSetUserMapping.userId = event.params.userId.toString();
  lastDripsSetUserMapping.assetId = event.params.assetId;
  lastDripsSetUserMapping.save();
}

export function handleDripsReceiverSeen(event: DripsReceiverSeen): void {
  const receiversHash = event.params.receiversHash;
  const lastSetDripsUserMapping = LastSetDripsUserMapping.load(receiversHash.toHexString());

  // We need to use the LastSetDripsUserMapping to look up the userId and assetId associated with this receiverHash
  if (lastSetDripsUserMapping) {
    const userId = lastSetDripsUserMapping.userId.toString();
    const userAssetConfigId = userId + '-' + lastSetDripsUserMapping.assetId.toString();
    const userAssetConfig = getOrCreateUserAssetConfig(
      userId,
      lastSetDripsUserMapping.assetId,
      event.block.timestamp
    );

    // Now we can create the DripsEntry
    if (!userAssetConfig.dripsEntryIds) userAssetConfig.dripsEntryIds = [];
    const newDripsEntryIds = userAssetConfig.dripsEntryIds;
    const dripsEntryId =
      lastSetDripsUserMapping.userId.toString() +
      '-' +
      event.params.userId.toString() +
      '-' +
      lastSetDripsUserMapping.assetId.toString();
    let dripsEntry = DripsEntry.load(dripsEntryId);
    if (!dripsEntry) {
      dripsEntry = new DripsEntry(dripsEntryId);
    }
    dripsEntry.sender = lastSetDripsUserMapping.userId.toString();
    dripsEntry.senderAssetConfig = userAssetConfigId;
    dripsEntry.userId = event.params.userId.toString();
    dripsEntry.config = event.params.config;
    dripsEntry.save();

    newDripsEntryIds.push(dripsEntryId);
    userAssetConfig.dripsEntryIds = newDripsEntryIds;
    userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
    userAssetConfig.save();
  }

  // Create the DripsReceiverSeenEvent entity
  const dripsReceiverSeenEventId =
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  const dripsReceiverSeenEvent = new DripsReceiverSeenEvent(dripsReceiverSeenEventId);
  if (lastSetDripsUserMapping) {
    dripsReceiverSeenEvent.dripsSetEvent = lastSetDripsUserMapping.dripsSetEventId;
  }
  dripsReceiverSeenEvent.receiversHash = event.params.receiversHash;
  if (lastSetDripsUserMapping) {
    dripsReceiverSeenEvent.senderUserId = lastSetDripsUserMapping.userId;
  }
  dripsReceiverSeenEvent.receiverUserId = event.params.userId.toString();
  dripsReceiverSeenEvent.config = event.params.config;
  dripsReceiverSeenEvent.blockTimestamp = event.block.timestamp;
  dripsReceiverSeenEvent.save();

  // TODO -- we need to add some kind of sequence number so we can historically order DripsSetEvents that occur within the same block
}

export function handleSqueezedDrips(event: SqueezedDrips): void {
  const squeezedDripsEvent = new SqueezedDripsEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  squeezedDripsEvent.userId = event.params.userId.toString();
  squeezedDripsEvent.assetId = event.params.assetId;
  squeezedDripsEvent.senderId = event.params.senderId.toString();
  squeezedDripsEvent.amt = event.params.amt;
  squeezedDripsEvent.dripsHistoryHashes = event.params.dripsHistoryHashes;
  squeezedDripsEvent.blockTimestamp = event.block.timestamp;
  squeezedDripsEvent.save();

  // Note the tokens received on the UserAssetConfig of the receiving user
  const userAssetConfig = getOrCreateUserAssetConfig(
    squeezedDripsEvent.userId,
    squeezedDripsEvent.assetId,
    event.block.timestamp
  );
  userAssetConfig.amountSplittable = userAssetConfig.amountSplittable.plus(event.params.amt);
  userAssetConfig.lastUpdatedBlockTimestamp = event.block.timestamp;
  userAssetConfig.save();
}

export function handleReceivedDrips(event: ReceivedDrips): void {
  // Store the raw event
  const receivedDripsEvent = new ReceivedDripsEvent(
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  );
  receivedDripsEvent.userId = event.params.userId.toString();
  receivedDripsEvent.assetId = event.params.assetId;
  receivedDripsEvent.amt = event.params.amt;
  receivedDripsEvent.receivableCycles = event.params.receivableCycles;
  receivedDripsEvent.blockTimestamp = event.block.timestamp;
  receivedDripsEvent.save();

  // Note the tokens received on the UserAssetConfig of the receiving user
  const userAssetConfig = getOrCreateUserAssetConfig(
    receivedDripsEvent.userId,
    receivedDripsEvent.assetId,
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

  // TODO -- we need to add some kind of sequence number so we can historically order DripsSetEvents that occur within the same block
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

  // TODO -- we need to add some kind of sequence number so we can historically order DripsSetEvents that occur within the same block
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

    user.assetConfigs = [];
    user.splitsEntryIds = [];
    user.splitsEntries = [];
    user.splitsReceiversHash = Bytes.fromUTF8('');
    user.lastUpdatedBlockTimestamp = blockTimestamp;

    user.save();
  }
  return user;
}

export function getOrCreateUserAssetConfig(
  userId: string,
  assetId: BigInt,
  blockTimestamp: BigInt
): UserAssetConfig {
  // First make sure the User exists
  getOrCreateUser(userId, blockTimestamp);

  // Now get or create the UserAssetConfig
  const userAssetConfigId = userId.toString() + '-' + assetId.toString();
  let userAssetConfig = UserAssetConfig.load(userAssetConfigId);
  if (!userAssetConfig) {
    userAssetConfig = new UserAssetConfig(userAssetConfigId);
    userAssetConfig.user = userId;
    userAssetConfig.assetId = assetId;
    userAssetConfig.dripsEntryIds = [];
    userAssetConfig.dripsEntries = [];
    userAssetConfig.balance = BigInt.fromI32(0);
    userAssetConfig.assetConfigHash = Bytes.fromUTF8('');
    userAssetConfig.lastUpdatedBlockTimestamp = BigInt.fromI32(0);
    userAssetConfig.amountSplittable = BigInt.fromI32(0);
    userAssetConfig.amountPostSplitCollectable = BigInt.fromI32(0);
    userAssetConfig.amountCollected = BigInt.fromI32(0);
  }
  userAssetConfig.lastUpdatedBlockTimestamp = blockTimestamp;
  userAssetConfig.save();
  return userAssetConfig;
}
