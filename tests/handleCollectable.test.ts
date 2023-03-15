import { BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { CollectableEvent, User, UserAssetConfig } from '../generated/schema';
import { handleCollectable } from '../src/mapping';
import { defaultUserAssetConfig } from './helpers/defaultEntityCreators';
import { createCollectable } from './helpers/eventCreators';

describe('handleCollectable', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const userId = BigInt.fromI32(1);
    const assetId = BigInt.fromI32(2);
    const amt = BigInt.fromI32(2);

    const incomingCollectable = createCollectable(userId, assetId, amt);

    const userAssetConfigId = `${incomingCollectable.params.userId.toString()}-${incomingCollectable.params.assetId.toString()}`;
    const userAssetConfigBefore = defaultUserAssetConfig(userAssetConfigId);
    userAssetConfigBefore.amountCollected = BigInt.fromI32(10);
    userAssetConfigBefore.amountPostSplitCollectable = BigInt.fromI32(10);
    userAssetConfigBefore.save();

    // Act
    handleCollectable(incomingCollectable);

    // Assert
    const user = User.load(incomingCollectable.params.userId.toString()) as User;
    assert.assertNotNull(user);

    const id =
      incomingCollectable.transaction.hash.toHexString() +
      '-' +
      incomingCollectable.logIndex.toString();
    const collectableEvent = CollectableEvent.load(id) as CollectableEvent;
    assert.stringEquals(collectableEvent.user, incomingCollectable.params.userId.toString());
    assert.bigIntEquals(collectableEvent.assetId, incomingCollectable.params.assetId);
    assert.bigIntEquals(collectableEvent.amt, incomingCollectable.params.amt);
    assert.bigIntEquals(collectableEvent.blockTimestamp, incomingCollectable.block.timestamp);

    const userAssetConfigAfter = UserAssetConfig.load(userAssetConfigId) as UserAssetConfig;
    assert.bigIntEquals(
      userAssetConfigAfter.amountPostSplitCollectable,
      userAssetConfigBefore.amountPostSplitCollectable.plus(incomingCollectable.params.amt)
    );
    assert.bigIntEquals(
      userAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingCollectable.block.timestamp
    );
  });
});
