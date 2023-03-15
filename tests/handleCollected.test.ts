import { BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { CollectedEvent, User, UserAssetConfig } from '../generated/schema';
import { handleCollected } from '../src/mapping';
import { defaultUserAssetConfig } from './helpers/defaultEntityCreators';
import { createCollected } from './helpers/eventCreators';

describe('handleCollected', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const userId = BigInt.fromI32(1);
    const assetId = BigInt.fromI32(2);
    const collected = BigInt.fromI32(2);

    const incomingCollected = createCollected(userId, assetId, collected);

    const userAssetConfigId = `${incomingCollected.params.userId.toString()}-${incomingCollected.params.assetId.toString()}`;
    const userAssetConfigBefore = defaultUserAssetConfig(userAssetConfigId);
    userAssetConfigBefore.amountCollected = BigInt.fromI32(10);
    userAssetConfigBefore.amountPostSplitCollectable = BigInt.fromI32(10);
    userAssetConfigBefore.save();

    // Act
    handleCollected(incomingCollected);

    // Assert
    const user = User.load(incomingCollected.params.userId.toString()) as User;
    assert.assertNotNull(user);

    const id =
      incomingCollected.transaction.hash.toHexString() +
      '-' +
      incomingCollected.logIndex.toString();
    const collectedEvent = CollectedEvent.load(id) as CollectedEvent;
    assert.stringEquals(collectedEvent.user, incomingCollected.params.userId.toString());
    assert.bigIntEquals(collectedEvent.assetId, incomingCollected.params.assetId);
    assert.bigIntEquals(collectedEvent.collected, incomingCollected.params.collected);
    assert.bigIntEquals(collectedEvent.blockTimestamp, incomingCollected.block.timestamp);

    const userAssetConfigAfter = UserAssetConfig.load(userAssetConfigId) as UserAssetConfig;
    assert.bigIntEquals(
      userAssetConfigAfter.amountCollected,
      userAssetConfigBefore.amountCollected.plus(incomingCollected.params.collected)
    );
    assert.bigIntEquals(userAssetConfigAfter.amountPostSplitCollectable, BigInt.fromI32(0));
    assert.bigIntEquals(
      userAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingCollected.block.timestamp
    );
  });
});
