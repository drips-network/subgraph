import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, log, logStore, beforeEach } from 'matchstick-as';
import { GivenEvent, UserAssetConfig } from '../generated/schema';
import { handleGiven } from '../src/mapping';
import { createGiven } from './helpers/eventCreators';

describe('handleGiven', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange

    const userId = BigInt.fromI32(1);
    const receiver = BigInt.fromI32(2);
    const assetId = BigInt.fromI32(3);
    const amt = BigInt.fromI32(4);

    const incomingGiven = createGiven(userId, receiver, assetId, amt);

    const id =
      incomingGiven.transaction.hash.toHexString() + '-' + incomingGiven.logIndex.toString();

    const userAssetConfigBefore = new UserAssetConfig(userId.toString() + '-' + assetId.toString());
    userAssetConfigBefore.save();

    // Act
    handleGiven(incomingGiven);

    // Assert
    const given = GivenEvent.load(id) as GivenEvent;
    assert.stringEquals(given.userId, incomingGiven.params.userId.toString());
    assert.stringEquals(given.receiverUserId, incomingGiven.params.receiver.toString());
    assert.bigIntEquals(given.assetId, incomingGiven.params.assetId);
    assert.bigIntEquals(given.amt, incomingGiven.params.amt);
    assert.bigIntEquals(given.blockTimestamp, incomingGiven.block.timestamp);

    const userAssetConfigAfter = UserAssetConfig.load(
      userId.toString() + '-' + assetId.toString()
    ) as UserAssetConfig;
    assert.bigIntEquals(
      userAssetConfigAfter.amountSplittable,
      userAssetConfigBefore.amountSplittable.plus(incomingGiven.params.amt)
    );
  });
});
