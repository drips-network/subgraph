import { BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { ReceivedStreamsEvent, UserAssetConfig } from '../generated/schema';
import { handleReceivedStreams } from '../src/mapping';
import { createReceivedStreams } from './helpers/eventCreators';
import { defaultUserAssetConfig } from './helpers/defaultEntityCreators';

describe('handleReceivedStreams', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const userId = BigInt.fromI32(1);
    const assetId = BigInt.fromI32(2);
    const amt = BigInt.fromI32(3);
    const receivableCycles = BigInt.fromI32(4);

    const incomingReceivedStreams = createReceivedStreams(userId, assetId, amt, receivableCycles);

    const userAssetConfigId = userId.toString() + '-' + assetId.toString();
    const userAssetConfigBefore = defaultUserAssetConfig(userAssetConfigId);
    userAssetConfigBefore.amountSplittable = BigInt.fromI32(10);
    userAssetConfigBefore.save();

    // Act
    handleReceivedStreams(incomingReceivedStreams);

    // Assert
    const id =
      incomingReceivedStreams.transaction.hash.toHexString() +
      '-' +
      incomingReceivedStreams.logIndex.toString();
    const receivedStreams = ReceivedStreamsEvent.load(id) as ReceivedStreamsEvent;
    assert.stringEquals(receivedStreams.userId, incomingReceivedStreams.params.userId.toString());
    assert.bigIntEquals(receivedStreams.assetId, incomingReceivedStreams.params.assetId);
    assert.bigIntEquals(receivedStreams.amt, incomingReceivedStreams.params.amt);
    assert.bigIntEquals(
      receivedStreams.receivableCycles,
      incomingReceivedStreams.params.receivableCycles
    );
    assert.bigIntEquals(receivedStreams.blockTimestamp, incomingReceivedStreams.block.timestamp);

    const userAssetConfigAfter = UserAssetConfig.load(userAssetConfigId) as UserAssetConfig;
    assert.bigIntEquals(
      userAssetConfigAfter.amountSplittable,
      userAssetConfigBefore.amountSplittable.plus(incomingReceivedStreams.params.amt)
    );
    assert.bigIntEquals(
      userAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingReceivedStreams.block.timestamp
    );
  });
});
