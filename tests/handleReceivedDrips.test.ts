import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { ReceivedDripsEvent, UserAssetConfig } from '../generated/schema';
import { handleReceivedDrips } from '../src/mapping';
import { createReceivedDrips } from './helpers/eventCreators';
import { defaultUserAssetConfig } from './helpers/defaultEntityCreators';

describe('handleReceivedDrips', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const userId = BigInt.fromI32(1);
    const assetId = BigInt.fromI32(2);
    const amt = BigInt.fromI32(3);
    const receivableCycles = BigInt.fromI32(4);

    const incomingReceivedDrips = createReceivedDrips(userId, assetId, amt, receivableCycles);

    const userAssetConfigId = userId.toString() + '-' + assetId.toString();
    const userAssetConfigBefore = defaultUserAssetConfig(userAssetConfigId);
    userAssetConfigBefore.amountSplittable = BigInt.fromI32(10);
    userAssetConfigBefore.save();

    // Act
    handleReceivedDrips(incomingReceivedDrips);

    // Assert
    const id =
      incomingReceivedDrips.transaction.hash.toHexString() +
      '-' +
      incomingReceivedDrips.logIndex.toString();
    const receivedDrips = ReceivedDripsEvent.load(id) as ReceivedDripsEvent;
    assert.stringEquals(receivedDrips.userId, incomingReceivedDrips.params.userId.toString());
    assert.bigIntEquals(receivedDrips.assetId, incomingReceivedDrips.params.assetId);
    assert.bigIntEquals(receivedDrips.amt, incomingReceivedDrips.params.amt);
    assert.bigIntEquals(
      receivedDrips.receivableCycles,
      incomingReceivedDrips.params.receivableCycles
    );
    assert.bigIntEquals(receivedDrips.blockTimestamp, incomingReceivedDrips.block.timestamp);

    const userAssetConfigAfter = UserAssetConfig.load(userAssetConfigId) as UserAssetConfig;
    assert.bigIntEquals(
      userAssetConfigAfter.amountSplittable,
      userAssetConfigBefore.amountSplittable.plus(incomingReceivedDrips.params.amt)
    );
    assert.bigIntEquals(
      userAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingReceivedDrips.block.timestamp
    );
  });
});
