import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { beforeEach, assert, clearStore, describe, test } from 'matchstick-as';
import { StreamsEntry, StreamReceiverSeenEvent, AccountAssetConfig } from '../generated/schema';
import { handleStreamReceiverSeen } from '../src/mapping';
import { createStreamsReceiverSeen } from './helpers/eventCreators';
import { defaultLastSetStreamsAccountMapping } from './helpers/defaultEntityCreators';

describe('handleStreamReceiverSeen', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should update entities as expected when mapping', () => {
    // Arrange
    const receiversHash = Bytes.fromUTF8('receiversHash');
    const accountId = BigInt.fromI32(1);
    const lastSetStreamsAccountMapping = defaultLastSetStreamsAccountMapping(
      receiversHash.toHexString()
    );
    lastSetStreamsAccountMapping.accountId = accountId.toString();
    lastSetStreamsAccountMapping.assetId = BigInt.fromI32(2);
    lastSetStreamsAccountMapping.save();

    const accountAssetConfigId =
      accountId.toString() + '-' + lastSetStreamsAccountMapping.assetId.toString();
    let accountAssetConfig = new AccountAssetConfig(accountAssetConfigId);

    const incomingStreamsReceiverSeen = createStreamsReceiverSeen(
      receiversHash,
      accountId,
      BigInt.fromI32(2)
    );

    // Act
    handleStreamReceiverSeen(incomingStreamsReceiverSeen);

    // Assert
    const streamEntryId = `${lastSetStreamsAccountMapping.accountId.toString()}-${incomingStreamsReceiverSeen.params.accountId.toString()}-${lastSetStreamsAccountMapping.assetId.toString()}`;
    const streamEntry = StreamsEntry.load(streamEntryId) as StreamsEntry;
    assert.stringEquals(streamEntry.sender, lastSetStreamsAccountMapping.accountId.toString());
    assert.stringEquals(streamEntry.senderAssetConfig, accountAssetConfigId);
    assert.stringEquals(
      streamEntry.accountId,
      incomingStreamsReceiverSeen.params.accountId.toString()
    );
    assert.bigIntEquals(streamEntry.config, incomingStreamsReceiverSeen.params.config);

    accountAssetConfig = AccountAssetConfig.load(accountAssetConfigId) as AccountAssetConfig;
    assert.arrayEquals(
      accountAssetConfig.streamsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      [ethereum.Value.fromString(streamEntryId)]
    );

    const streamReceiverSeenEventId = `${incomingStreamsReceiverSeen.transaction.hash.toHexString()}-${incomingStreamsReceiverSeen.logIndex.toString()}`;
    const streamReceiverSeenEvent = StreamReceiverSeenEvent.load(
      streamReceiverSeenEventId
    ) as StreamReceiverSeenEvent;
    assert.stringEquals(
      streamReceiverSeenEvent.streamsSetEvent,
      lastSetStreamsAccountMapping.streamsSetEventId
    );
    assert.bytesEquals(
      streamReceiverSeenEvent.receiversHash,
      incomingStreamsReceiverSeen.params.receiversHash
    );
    assert.stringEquals(
      streamReceiverSeenEvent.senderAccountId,
      lastSetStreamsAccountMapping.accountId
    );
    assert.stringEquals(
      streamReceiverSeenEvent.receiverAccountId,
      incomingStreamsReceiverSeen.params.accountId.toString()
    );
    assert.bigIntEquals(streamReceiverSeenEvent.config, incomingStreamsReceiverSeen.params.config);
    assert.bigIntEquals(
      streamReceiverSeenEvent.blockTimestamp,
      incomingStreamsReceiverSeen.block.timestamp
    );
  });
});
