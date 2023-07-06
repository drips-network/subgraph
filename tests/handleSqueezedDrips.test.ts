import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { SqueezedStreamsEvent } from '../generated/schema';
import { handleSqueezedStreams } from '../src/mapping';
import { createSqueezedStreams } from './helpers/eventCreators';
import { erc20TokenToAssetId } from '../src/utils';

describe('handleSqueezedStreams', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const accountId = BigInt.fromI32(1);
    const erc20 = Address.fromString('0x20a9273a452268E5a034951ae5381a45E14aC2a3');
    const senderId = BigInt.fromI32(3);
    const amt = BigInt.fromI32(4);
    const streamsHistoryHashes = [Bytes.fromUTF8('streamsHistoryHashes')];

    const incomingSqueezedStreams = createSqueezedStreams(
      accountId,
      erc20,
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
    assert.stringEquals(
      squeezedStreams.accountId,
      incomingSqueezedStreams.params.accountId.toString()
    );
    assert.bigIntEquals(
      squeezedStreams.assetId,
      erc20TokenToAssetId(incomingSqueezedStreams.params.erc20)
    );
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
