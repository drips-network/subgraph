import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { beforeEach, assert, clearStore, describe, test } from 'matchstick-as';
import { StreamsEntry, StreamReceiverSeenEvent, UserAssetConfig } from '../generated/schema';
import { handleStreamReceiverSeen } from '../src/mapping';
import { createStreamsReceiverSeen } from './helpers/eventCreators';
import { defaultLastSetStreamsUserMapping } from './helpers/defaultEntityCreators';

describe('handleStreamReceiverSeen', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should update entities as expected when mapping', () => {
    // Arrange
    const receiversHash = Bytes.fromUTF8('receiversHash');
    const userId = BigInt.fromI32(1);
    const lastSetStreamsUserMapping = defaultLastSetStreamsUserMapping(receiversHash.toHexString());
    lastSetStreamsUserMapping.userId = userId.toString();
    lastSetStreamsUserMapping.assetId = BigInt.fromI32(2);
    lastSetStreamsUserMapping.save();

    const userAssetConfigId =
      userId.toString() + '-' + lastSetStreamsUserMapping.assetId.toString();
    let userAssetConfig = new UserAssetConfig(userAssetConfigId);

    const incomingStreamsReceiverSeen = createStreamsReceiverSeen(
      receiversHash,
      userId,
      BigInt.fromI32(2)
    );

    // Act
    handleStreamReceiverSeen(incomingStreamsReceiverSeen);

    // Assert
    const streamEntryId = `${lastSetStreamsUserMapping.userId.toString()}-${incomingStreamsReceiverSeen.params.userId.toString()}-${lastSetStreamsUserMapping.assetId.toString()}`;
    const streamEntry = StreamsEntry.load(streamEntryId) as StreamsEntry;
    assert.stringEquals(streamEntry.sender, lastSetStreamsUserMapping.userId.toString());
    assert.stringEquals(streamEntry.senderAssetConfig, userAssetConfigId);
    assert.stringEquals(streamEntry.userId, incomingStreamsReceiverSeen.params.userId.toString());
    assert.bigIntEquals(streamEntry.config, incomingStreamsReceiverSeen.params.config);

    userAssetConfig = UserAssetConfig.load(userAssetConfigId) as UserAssetConfig;
    assert.arrayEquals(
      userAssetConfig.streamsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      [ethereum.Value.fromString(streamEntryId)]
    );

    const streamReceiverSeenEventId = `${incomingStreamsReceiverSeen.transaction.hash.toHexString()}-${incomingStreamsReceiverSeen.logIndex.toString()}`;
    const streamReceiverSeenEvent = StreamReceiverSeenEvent.load(
      streamReceiverSeenEventId
    ) as StreamReceiverSeenEvent;
    assert.stringEquals(
      streamReceiverSeenEvent.streamsSetEvent,
      lastSetStreamsUserMapping.streamsSetEventId
    );
    assert.bytesEquals(
      streamReceiverSeenEvent.receiversHash,
      incomingStreamsReceiverSeen.params.receiversHash
    );
    assert.stringEquals(streamReceiverSeenEvent.senderUserId, lastSetStreamsUserMapping.userId);
    assert.stringEquals(
      streamReceiverSeenEvent.receiverUserId,
      incomingStreamsReceiverSeen.params.userId.toString()
    );
    assert.bigIntEquals(streamReceiverSeenEvent.config, incomingStreamsReceiverSeen.params.config);
    assert.bigIntEquals(
      streamReceiverSeenEvent.blockTimestamp,
      incomingStreamsReceiverSeen.block.timestamp
    );
  });
});
