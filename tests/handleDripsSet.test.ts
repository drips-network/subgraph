import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as';
import {
  DripsEntry,
  DripsSetEvent,
  LastSetDripsUserMapping,
  User,
  UserAssetConfig
} from '../generated/schema';
import { handleDripsSet } from '../src/mapping';
import { createDripsSetEvent } from './helpers/eventCreators';
import {
  defaultDripsEntry,
  defaultUser,
  defaultUserAssetConfig
} from './helpers/defaultEntityCreators';

describe('handleDripsSet', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const incomingDripsSetEvent = createDripsSetEvent(
      BigInt.fromI32(1),
      BigInt.fromI32(2),
      Bytes.fromUTF8('receiversHash'),
      Bytes.fromUTF8('dripsHistoryHash'),
      BigInt.fromI32(3),
      BigInt.fromI32(4)
    );

    // Act
    handleDripsSet(incomingDripsSetEvent);

    // Assert
    const user = User.load(incomingDripsSetEvent.params.userId.toString());
    assert.assertNotNull(user);

    const userAssetConfigId = `${incomingDripsSetEvent.params.userId.toString()}-${incomingDripsSetEvent.params.assetId.toString()}`;
    const userAssetConfig = UserAssetConfig.load(userAssetConfigId) as UserAssetConfig;
    assert.bigIntEquals(userAssetConfig.balance, incomingDripsSetEvent.params.balance);
    assert.bytesEquals(userAssetConfig.assetConfigHash, incomingDripsSetEvent.params.receiversHash);
    assert.bigIntEquals(
      userAssetConfig.lastUpdatedBlockTimestamp,
      incomingDripsSetEvent.block.timestamp
    );
    assert.arrayEquals(
      userAssetConfig.dripsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      []
    );

    const dripsSetEventId = `${incomingDripsSetEvent.transaction.hash.toHexString()}-${incomingDripsSetEvent.logIndex.toString()}`;
    const dripsSetEventEntity = DripsSetEvent.load(dripsSetEventId) as DripsSetEvent;
    assert.stringEquals(dripsSetEventEntity.userId, incomingDripsSetEvent.params.userId.toString());
    assert.bigIntEquals(dripsSetEventEntity.assetId, incomingDripsSetEvent.params.assetId);
    assert.bytesEquals(
      dripsSetEventEntity.receiversHash,
      incomingDripsSetEvent.params.receiversHash
    );
    assert.bytesEquals(
      dripsSetEventEntity.dripsHistoryHash,
      incomingDripsSetEvent.params.dripsHistoryHash
    );
    assert.bigIntEquals(dripsSetEventEntity.balance, incomingDripsSetEvent.params.balance);
    assert.bigIntEquals(dripsSetEventEntity.maxEnd, incomingDripsSetEvent.params.maxEnd);
    assert.bigIntEquals(dripsSetEventEntity.blockTimestamp, incomingDripsSetEvent.block.timestamp);

    const lastDripsSetUserMappingId = incomingDripsSetEvent.params.receiversHash.toHexString();
    const lastDripsSetUserMapping = LastSetDripsUserMapping.load(
      lastDripsSetUserMappingId
    ) as LastSetDripsUserMapping;
    assert.stringEquals(lastDripsSetUserMapping.dripsSetEventId, dripsSetEventId);
    assert.stringEquals(
      lastDripsSetUserMapping.userId,
      incomingDripsSetEvent.params.userId.toString()
    );
    assert.bigIntEquals(lastDripsSetUserMapping.assetId, incomingDripsSetEvent.params.assetId);
  });

  test('should update entities as expected when mapping', () => {
    // Arrange
    const userId = BigInt.fromI32(1);
    const user = defaultUser(userId.toString());
    user.save();

    const incomingDripsSetEvent = createDripsSetEvent(
      userId,
      BigInt.fromI32(2),
      Bytes.fromUTF8('receiversHash'),
      Bytes.fromUTF8('dripsHistoryHash'),
      BigInt.fromI32(3),
      BigInt.fromI32(4)
    );

    const dripsEntryId = '1';
    const dripEntry = defaultDripsEntry(dripsEntryId);
    dripEntry.save();

    const userAssetConfigId = `${incomingDripsSetEvent.params.userId.toString()}-${incomingDripsSetEvent.params.assetId.toString()}`;
    let userAssetConfig = defaultUserAssetConfig(userAssetConfigId);
    userAssetConfig.dripsEntryIds = [dripsEntryId];
    userAssetConfig.save();

    // Act
    handleDripsSet(incomingDripsSetEvent);

    // Assert
    assert.assertNull(DripsEntry.load(dripsEntryId));

    userAssetConfig = UserAssetConfig.load(userAssetConfigId) as UserAssetConfig;
    assert.bigIntEquals(userAssetConfig.balance, incomingDripsSetEvent.params.balance);
    assert.bytesEquals(userAssetConfig.assetConfigHash, incomingDripsSetEvent.params.receiversHash);
    assert.bigIntEquals(
      userAssetConfig.lastUpdatedBlockTimestamp,
      incomingDripsSetEvent.block.timestamp
    );
    assert.arrayEquals(
      userAssetConfig.dripsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      []
    );

    const dripsSetEventId = `${incomingDripsSetEvent.transaction.hash.toHexString()}-${incomingDripsSetEvent.logIndex.toString()}`;
    const dripsSetEventEntity = DripsSetEvent.load(dripsSetEventId) as DripsSetEvent;
    assert.stringEquals(dripsSetEventEntity.userId, incomingDripsSetEvent.params.userId.toString());
    assert.bigIntEquals(dripsSetEventEntity.assetId, incomingDripsSetEvent.params.assetId);
    assert.bytesEquals(
      dripsSetEventEntity.receiversHash,
      incomingDripsSetEvent.params.receiversHash
    );
    assert.bytesEquals(
      dripsSetEventEntity.dripsHistoryHash,
      incomingDripsSetEvent.params.dripsHistoryHash
    );
    assert.bigIntEquals(dripsSetEventEntity.balance, incomingDripsSetEvent.params.balance);
    assert.bigIntEquals(dripsSetEventEntity.maxEnd, incomingDripsSetEvent.params.maxEnd);
    assert.bigIntEquals(dripsSetEventEntity.blockTimestamp, incomingDripsSetEvent.block.timestamp);

    const lastDripsSetUserMappingId = incomingDripsSetEvent.params.receiversHash.toHexString();
    const lastDripsSetUserMapping = LastSetDripsUserMapping.load(
      lastDripsSetUserMappingId
    ) as LastSetDripsUserMapping;
    assert.stringEquals(lastDripsSetUserMapping.dripsSetEventId, dripsSetEventId);
    assert.stringEquals(
      lastDripsSetUserMapping.userId,
      incomingDripsSetEvent.params.userId.toString()
    );
    assert.bigIntEquals(lastDripsSetUserMapping.assetId, incomingDripsSetEvent.params.assetId);
  });
});
