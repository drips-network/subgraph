import { BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { SplitEvent, UserAssetConfig } from '../generated/schema';
import { handleSplit } from '../src/mapping';
import { defaultUserAssetConfig } from './helpers/defaultEntityCreators';
import { createSplit } from './helpers/eventCreators';

describe('handleSplit', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange

    const userId = BigInt.fromI32(1);
    const receiver = BigInt.fromI32(2);
    const assetId = BigInt.fromI32(3);
    const amt = BigInt.fromI32(4);

    const incomingSplit = createSplit(userId, receiver, assetId, amt);

    const id =
      incomingSplit.transaction.hash.toHexString() + '-' + incomingSplit.logIndex.toString();

    const splittingUserAssetConfigBefore = defaultUserAssetConfig(
      incomingSplit.params.userId.toString() + '-' + assetId.toString()
    );
    splittingUserAssetConfigBefore.amountSplittable = BigInt.fromI32(1000);
    splittingUserAssetConfigBefore.lastUpdatedBlockTimestamp = BigInt.fromI32(200);
    splittingUserAssetConfigBefore.save();

    const receivingUserAssetConfigBefore = defaultUserAssetConfig(
      incomingSplit.params.receiver.toString() + '-' + assetId.toString()
    );
    receivingUserAssetConfigBefore.amountSplittable = BigInt.fromI32(2000);
    receivingUserAssetConfigBefore.lastUpdatedBlockTimestamp = BigInt.fromI32(300);
    receivingUserAssetConfigBefore.save();

    // Act
    handleSplit(incomingSplit);

    // Assert
    const split = SplitEvent.load(id) as SplitEvent;
    assert.stringEquals(split.userId, incomingSplit.params.userId.toString());
    assert.stringEquals(split.receiverId, incomingSplit.params.receiver.toString());
    assert.bigIntEquals(split.assetId, incomingSplit.params.assetId);
    assert.bigIntEquals(split.amt, incomingSplit.params.amt);
    assert.bigIntEquals(split.blockTimestamp, incomingSplit.block.timestamp);

    const splittingUserAssetConfigAfter = UserAssetConfig.load(
      userId.toString() + '-' + assetId.toString()
    ) as UserAssetConfig;
    assert.bigIntEquals(splittingUserAssetConfigAfter.amountSplittable, BigInt.fromI32(0));
    assert.bigIntEquals(
      splittingUserAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingSplit.block.timestamp
    );

    const receivingUserAssetConfigAfter = UserAssetConfig.load(
      receiver.toString() + '-' + assetId.toString()
    ) as UserAssetConfig;
    assert.bigIntEquals(
      receivingUserAssetConfigAfter.amountSplittable,
      receivingUserAssetConfigBefore.amountSplittable.plus(incomingSplit.params.amt)
    );
    assert.bigIntEquals(
      receivingUserAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingSplit.block.timestamp
    );
  });
});
