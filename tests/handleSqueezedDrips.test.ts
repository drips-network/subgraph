import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { SqueezedDripsEvent } from '../generated/schema';
import { handleSqueezedDrips } from '../src/mapping';
import { createSqueezedDrips } from './helpers/eventCreators';

describe('handleSqueezedDrips', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const userId = BigInt.fromI32(1);
    const assetId = BigInt.fromI32(2);
    const senderId = BigInt.fromI32(3);
    const amt = BigInt.fromI32(4);
    const dripsHistoryHashes = [Bytes.fromUTF8('dripsHistoryHashes')];

    const incomingSqueezedDrips = createSqueezedDrips(
      userId,
      assetId,
      senderId,
      amt,
      dripsHistoryHashes
    );

    // Act
    handleSqueezedDrips(incomingSqueezedDrips);

    // Assert
    const id =
      incomingSqueezedDrips.transaction.hash.toHexString() +
      '-' +
      incomingSqueezedDrips.logIndex.toString();
    const squeezedDrips = SqueezedDripsEvent.load(id) as SqueezedDripsEvent;
    assert.stringEquals(squeezedDrips.userId, incomingSqueezedDrips.params.userId.toString());
    assert.bigIntEquals(squeezedDrips.assetId, incomingSqueezedDrips.params.assetId);
    assert.stringEquals(squeezedDrips.senderId, incomingSqueezedDrips.params.senderId.toString());
    assert.bigIntEquals(squeezedDrips.amt, incomingSqueezedDrips.params.amt);
    assert.bigIntEquals(squeezedDrips.blockTimestamp, incomingSqueezedDrips.block.timestamp);
    assert.arrayEquals(
      squeezedDrips.dripsHistoryHashes.map<ethereum.Value>((s) => ethereum.Value.fromBytes(s)),
      [ethereum.Value.fromBytes(Bytes.fromUTF8('dripsHistoryHashes'))]
    );
  });
});
