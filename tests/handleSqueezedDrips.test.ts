import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { SqueezedStreamsEvent } from '../generated/schema';
import { handleSqueezedStreams } from '../src/mapping';
import { createSqueezedStreams } from './helpers/eventCreators';

describe('handleSqueezedStreams', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const userId = BigInt.fromI32(1);
    const assetId = BigInt.fromI32(2);
    const senderId = BigInt.fromI32(3);
    const amt = BigInt.fromI32(4);
    const streamsHistoryHashes = [Bytes.fromUTF8('streamsHistoryHashes')];

    const incomingSqueezedStreams = createSqueezedStreams(
      userId,
      assetId,
      senderId,
      amt,
      streamsHistoryHashes
    );

    // Act
    handleSqueezedStreams(incomingSqueezedStreams);

    // Assert
    const id =
      incomingSqueezedStreams.transaction.hash.toHexString() +
      '-' +
      incomingSqueezedStreams.logIndex.toString();
    const squeezedStreams = SqueezedStreamsEvent.load(id) as SqueezedStreamsEvent;
    assert.stringEquals(squeezedStreams.userId, incomingSqueezedStreams.params.userId.toString());
    assert.bigIntEquals(squeezedStreams.assetId, incomingSqueezedStreams.params.assetId);
    assert.stringEquals(
      squeezedStreams.senderId,
      incomingSqueezedStreams.params.senderId.toString()
    );
    assert.bigIntEquals(squeezedStreams.amt, incomingSqueezedStreams.params.amt);
    assert.bigIntEquals(squeezedStreams.blockTimestamp, incomingSqueezedStreams.block.timestamp);
    assert.arrayEquals(
      squeezedStreams.streamsHistoryHashes.map<ethereum.Value>((s) => ethereum.Value.fromBytes(s)),
      [ethereum.Value.fromBytes(Bytes.fromUTF8('streamsHistoryHashes'))]
    );
  });
});
