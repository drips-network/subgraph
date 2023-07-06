import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { GivenEvent, AccountAssetConfig } from '../generated/schema';
import { handleGiven } from '../src/mapping';
import { createGiven } from './helpers/eventCreators';
import { defaultAccountAssetConfig } from './helpers/defaultEntityCreators';
import { erc20TokenToAssetId } from '../src/utils';

describe('handleGiven', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange

    const accountId = BigInt.fromI32(1);
    const receiver = BigInt.fromI32(2);
    const erc20 = Address.fromString('0x20a9273a452268E5a034951ae5381a45E14aC2a3');
    const amt = BigInt.fromI32(4);

    const incomingGiven = createGiven(accountId, receiver, erc20, amt);

    const id =
      incomingGiven.transaction.hash.toHexString() + '-' + incomingGiven.logIndex.toString();

    const accountAssetConfigBefore = defaultAccountAssetConfig(
      accountId.toString() + '-' + erc20TokenToAssetId(erc20).toString()
    );
    accountAssetConfigBefore.lastUpdatedBlockTimestamp = BigInt.fromI32(200);
    accountAssetConfigBefore.save();

    // Act
    handleGiven(incomingGiven);

    // Assert
    const given = GivenEvent.load(id) as GivenEvent;
    assert.stringEquals(given.accountId, incomingGiven.params.accountId.toString());
    assert.stringEquals(given.receiverAccountId, incomingGiven.params.receiver.toString());
    assert.bigIntEquals(given.assetId, erc20TokenToAssetId(incomingGiven.params.erc20));
    assert.bigIntEquals(given.amt, incomingGiven.params.amt);
    assert.bigIntEquals(given.blockTimestamp, incomingGiven.block.timestamp);

    const accountAssetConfigAfter = AccountAssetConfig.load(
      incomingGiven.params.accountId.toString() + '-' + erc20TokenToAssetId(erc20).toString()
    ) as AccountAssetConfig;
    assert.bigIntEquals(
      accountAssetConfigAfter.amountSplittable,
      accountAssetConfigBefore.amountSplittable.plus(incomingGiven.params.amt)
    );
    assert.bigIntEquals(
      accountAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingGiven.block.timestamp
    );
  });
});
