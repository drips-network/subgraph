import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { beforeEach, assert, clearStore, describe, test } from 'matchstick-as';
import {
  DripsEntry,
  DripsReceiverSeenEvent,
  LastSetDripsUserMapping,
  UserAssetConfig
} from '../generated/schema';
import { handleDripsReceiverSeen } from '../src/mapping';
import { createDripsReceiverSeen } from './helpers/eventCreators';

describe('handleDripsReceiverSeen', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should update entities as expected when mapping', () => {
    // Arrange
    const receiversHash = Bytes.fromUTF8('receiversHash');
    const userId = BigInt.fromI32(1);
    const lastSetDripsUserMapping = new LastSetDripsUserMapping(receiversHash.toHexString());
    lastSetDripsUserMapping.userId = userId.toString();
    lastSetDripsUserMapping.assetId = BigInt.fromI32(2);
    lastSetDripsUserMapping.save();

    const userAssetConfigId = userId.toString() + '-' + lastSetDripsUserMapping.assetId.toString();
    let userAssetConfig = new UserAssetConfig(userAssetConfigId);

    const incomingDripsReceiverSeen = createDripsReceiverSeen(
      receiversHash,
      userId,
      BigInt.fromI32(2)
    );

    // Act
    handleDripsReceiverSeen(incomingDripsReceiverSeen);

    // Assert
    const dripsEntryId = `${lastSetDripsUserMapping.userId.toString()}-${incomingDripsReceiverSeen.params.userId.toString()}-${lastSetDripsUserMapping.assetId.toString()}`;
    const dripsEntry = DripsEntry.load(dripsEntryId) as DripsEntry;
    assert.stringEquals(dripsEntry.sender, lastSetDripsUserMapping.userId.toString());
    assert.stringEquals(dripsEntry.senderAssetConfig, userAssetConfigId);
    assert.stringEquals(dripsEntry.userId, incomingDripsReceiverSeen.params.userId.toString());
    assert.bigIntEquals(dripsEntry.config, incomingDripsReceiverSeen.params.config);

    userAssetConfig = UserAssetConfig.load(userAssetConfigId) as UserAssetConfig;
    assert.arrayEquals(
      userAssetConfig.dripsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      [ethereum.Value.fromString(dripsEntryId)]
    );

    const dripsReceiverSeenEventId = `${incomingDripsReceiverSeen.transaction.hash.toHexString()}-${incomingDripsReceiverSeen.logIndex.toString()}`;
    const dripsReceiverSeenEvent = DripsReceiverSeenEvent.load(
      dripsReceiverSeenEventId
    ) as DripsReceiverSeenEvent;
    assert.stringEquals(
      dripsReceiverSeenEvent.dripsSetEvent,
      lastSetDripsUserMapping.dripsSetEventId
    );
    assert.bytesEquals(
      dripsReceiverSeenEvent.receiversHash,
      incomingDripsReceiverSeen.params.receiversHash
    );
    assert.stringEquals(dripsReceiverSeenEvent.senderUserId, lastSetDripsUserMapping.userId);
    assert.stringEquals(
      dripsReceiverSeenEvent.receiverUserId,
      incomingDripsReceiverSeen.params.userId.toString()
    );
    assert.bigIntEquals(dripsReceiverSeenEvent.config, incomingDripsReceiverSeen.params.config);
    assert.bigIntEquals(
      dripsReceiverSeenEvent.blockTimestamp,
      incomingDripsReceiverSeen.block.timestamp
    );
  });
});
