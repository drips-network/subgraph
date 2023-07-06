import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { SplitEvent, AccountAssetConfig } from '../generated/schema';
import { handleSplit } from '../src/mapping';
import { createSplit } from './helpers/eventCreators';
import { defaultAccountAssetConfig } from './helpers/defaultEntityCreators';
import { erc20TokenToAssetId } from '../src/utils';

describe('handleSplit', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange

    const accountId = BigInt.fromI32(1);
    const receiver = BigInt.fromI32(2);
    const erc20 = Address.fromString('0x20a9273a452268E5a034951ae5381a45E14aC2a3');
    const amt = BigInt.fromI32(4);

    const incomingSplit = createSplit(accountId, receiver, erc20, amt);

    const id =
      incomingSplit.transaction.hash.toHexString() + '-' + incomingSplit.logIndex.toString();

    const splittingAccountAssetConfigBefore = defaultAccountAssetConfig(
      incomingSplit.params.accountId.toString() + '-' + erc20TokenToAssetId(erc20).toString()
    );
    splittingAccountAssetConfigBefore.amountSplittable = BigInt.fromI32(1000);
    splittingAccountAssetConfigBefore.lastUpdatedBlockTimestamp = BigInt.fromI32(200);
    splittingAccountAssetConfigBefore.save();

    const receivingAccountAssetConfigBefore = defaultAccountAssetConfig(
      incomingSplit.params.receiver.toString() + '-' + erc20TokenToAssetId(erc20).toString()
    );
    receivingAccountAssetConfigBefore.amountSplittable = BigInt.fromI32(2000);
    receivingAccountAssetConfigBefore.lastUpdatedBlockTimestamp = BigInt.fromI32(300);
    receivingAccountAssetConfigBefore.save();

    // Act
    handleSplit(incomingSplit);

    // Assert
    const split = SplitEvent.load(id) as SplitEvent;
    assert.stringEquals(split.accountId, incomingSplit.params.accountId.toString());
    assert.stringEquals(split.receiverId, incomingSplit.params.receiver.toString());
    assert.bigIntEquals(split.assetId, erc20TokenToAssetId(incomingSplit.params.erc20));
    assert.bigIntEquals(split.amt, incomingSplit.params.amt);
    assert.bigIntEquals(split.blockTimestamp, incomingSplit.block.timestamp);

    const splittingAccountAssetConfigAfter = AccountAssetConfig.load(
      accountId.toString() + '-' + erc20TokenToAssetId(erc20).toString()
    ) as AccountAssetConfig;
    assert.bigIntEquals(splittingAccountAssetConfigAfter.amountSplittable, BigInt.fromI32(0));
    assert.bigIntEquals(
      splittingAccountAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingSplit.block.timestamp
    );

    const receivingAccountAssetConfigAfter = AccountAssetConfig.load(
      receiver.toString() + '-' + erc20TokenToAssetId(erc20).toString()
    ) as AccountAssetConfig;
    assert.bigIntEquals(
      receivingAccountAssetConfigAfter.amountSplittable,
      receivingAccountAssetConfigBefore.amountSplittable.plus(incomingSplit.params.amt)
    );
    assert.bigIntEquals(
      receivingAccountAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingSplit.block.timestamp
    );
  });
});
