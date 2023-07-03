import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as';
import {
  StreamsEntry,
  StreamsSetEvent,
  LastSetStreamUserMapping,
  User,
  UserAssetConfig
} from '../generated/schema';
import { handleStreamsSet } from '../src/mapping';
import { createStreamSetEvent } from './helpers/eventCreators';
import {
  defaultStreamsEntry,
  defaultUser,
  defaultUserAssetConfig
} from './helpers/defaultEntityCreators';

describe('handleStreamsSet', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const incomingStreamSetEvent = createStreamSetEvent(
      BigInt.fromI32(1),
      BigInt.fromI32(2),
      Bytes.fromUTF8('receiversHash'),
      Bytes.fromUTF8('streamHistoryHash'),
      BigInt.fromI32(3),
      BigInt.fromI32(4)
    );

    // Act
    handleStreamsSet(incomingStreamSetEvent);

    // Assert
    const user = User.load(incomingStreamSetEvent.params.userId.toString());
    assert.assertNotNull(user);

    const userAssetConfigId = `${incomingStreamSetEvent.params.userId.toString()}-${incomingStreamSetEvent.params.assetId.toString()}`;
    const userAssetConfig = UserAssetConfig.load(userAssetConfigId) as UserAssetConfig;
    assert.bigIntEquals(userAssetConfig.balance, incomingStreamSetEvent.params.balance);
    assert.bytesEquals(
      userAssetConfig.assetConfigHash,
      incomingStreamSetEvent.params.receiversHash
    );
    assert.bigIntEquals(
      userAssetConfig.lastUpdatedBlockTimestamp,
      incomingStreamSetEvent.block.timestamp
    );
    assert.arrayEquals(
      userAssetConfig.streamsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      []
    );

    const streamSetEventId = `${incomingStreamSetEvent.transaction.hash.toHexString()}-${incomingStreamSetEvent.logIndex.toString()}`;
    const streamSetEventEntity = StreamsSetEvent.load(streamSetEventId) as StreamsSetEvent;
    assert.stringEquals(
      streamSetEventEntity.userId,
      incomingStreamSetEvent.params.userId.toString()
    );
    assert.bigIntEquals(streamSetEventEntity.assetId, incomingStreamSetEvent.params.assetId);
    assert.bytesEquals(
      streamSetEventEntity.receiversHash,
      incomingStreamSetEvent.params.receiversHash
    );
    assert.bytesEquals(
      streamSetEventEntity.streamsHistoryHash,
      incomingStreamSetEvent.params.streamsHistoryHash
    );
    assert.bigIntEquals(streamSetEventEntity.balance, incomingStreamSetEvent.params.balance);
    assert.bigIntEquals(streamSetEventEntity.maxEnd, incomingStreamSetEvent.params.maxEnd);
    assert.bigIntEquals(
      streamSetEventEntity.blockTimestamp,
      incomingStreamSetEvent.block.timestamp
    );

    const laststreamSetUserMappingId = incomingStreamSetEvent.params.receiversHash.toHexString();
    const laststreamSetUserMapping = LastSetStreamUserMapping.load(
      laststreamSetUserMappingId
    ) as LastSetStreamUserMapping;
    assert.stringEquals(laststreamSetUserMapping.streamsSetEventId, streamSetEventId);
    assert.stringEquals(
      laststreamSetUserMapping.userId,
      incomingStreamSetEvent.params.userId.toString()
    );
    assert.bigIntEquals(laststreamSetUserMapping.assetId, incomingStreamSetEvent.params.assetId);
  });

  test('should update entities as expected when mapping', () => {
    // Arrange
    const userId = BigInt.fromI32(1);
    const user = defaultUser(userId.toString());
    user.save();

    const incomingStreamSetEvent = createStreamSetEvent(
      userId,
      BigInt.fromI32(2),
      Bytes.fromUTF8('receiversHash'),
      Bytes.fromUTF8('streamHistoryHash'),
      BigInt.fromI32(3),
      BigInt.fromI32(4)
    );

    const streamEntryId = '1';
    const streamEntry = defaultStreamsEntry(streamEntryId);
    streamEntry.save();

    const userAssetConfigId = `${incomingStreamSetEvent.params.userId.toString()}-${incomingStreamSetEvent.params.assetId.toString()}`;
    let userAssetConfig = defaultUserAssetConfig(userAssetConfigId);
    userAssetConfig.streamsEntryIds = [streamEntryId];
    userAssetConfig.save();

    // Act
    handleStreamsSet(incomingStreamSetEvent);

    // Assert
    assert.assertNull(StreamsEntry.load(streamEntryId));

    userAssetConfig = UserAssetConfig.load(userAssetConfigId) as UserAssetConfig;
    assert.bigIntEquals(userAssetConfig.balance, incomingStreamSetEvent.params.balance);
    assert.bytesEquals(
      userAssetConfig.assetConfigHash,
      incomingStreamSetEvent.params.receiversHash
    );
    assert.bigIntEquals(
      userAssetConfig.lastUpdatedBlockTimestamp,
      incomingStreamSetEvent.block.timestamp
    );
    assert.arrayEquals(
      userAssetConfig.streamsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      []
    );

    const streamSetEventId = `${incomingStreamSetEvent.transaction.hash.toHexString()}-${incomingStreamSetEvent.logIndex.toString()}`;
    const streamSetEventEntity = StreamsSetEvent.load(streamSetEventId) as StreamsSetEvent;
    assert.stringEquals(
      streamSetEventEntity.userId,
      incomingStreamSetEvent.params.userId.toString()
    );
    assert.bigIntEquals(streamSetEventEntity.assetId, incomingStreamSetEvent.params.assetId);
    assert.bytesEquals(
      streamSetEventEntity.receiversHash,
      incomingStreamSetEvent.params.receiversHash
    );
    assert.bytesEquals(
      streamSetEventEntity.streamsHistoryHash,
      incomingStreamSetEvent.params.streamsHistoryHash
    );
    assert.bigIntEquals(streamSetEventEntity.balance, incomingStreamSetEvent.params.balance);
    assert.bigIntEquals(streamSetEventEntity.maxEnd, incomingStreamSetEvent.params.maxEnd);
    assert.bigIntEquals(
      streamSetEventEntity.blockTimestamp,
      incomingStreamSetEvent.block.timestamp
    );

    const laststreamSetUserMappingId = incomingStreamSetEvent.params.receiversHash.toHexString();
    const laststreamSetUserMapping = LastSetStreamUserMapping.load(
      laststreamSetUserMappingId
    ) as LastSetStreamUserMapping;
    assert.stringEquals(laststreamSetUserMapping.streamsSetEventId, streamSetEventId);
    assert.stringEquals(
      laststreamSetUserMapping.userId,
      incomingStreamSetEvent.params.userId.toString()
    );
    assert.bigIntEquals(laststreamSetUserMapping.assetId, incomingStreamSetEvent.params.assetId);
  });
});
