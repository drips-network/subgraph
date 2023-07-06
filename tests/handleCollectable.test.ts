import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { CollectableEvent, Account, AccountAssetConfig } from '../generated/schema';
import { handleCollectable } from '../src/mapping';
import { createCollectable } from './helpers/eventCreators';
import { defaultAccountAssetConfig } from './helpers/defaultEntityCreators';
import { erc20TokenToAssetId } from '../src/utils';

describe('handleCollectable', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const accountId = BigInt.fromI32(1);
    const erc20 = Address.fromString('0x20a9273a452268E5a034951ae5381a45E14aC2a3');
    const amt = BigInt.fromI32(2);

    const incomingCollectable = createCollectable(accountId, erc20, amt);

    const accountAssetConfigId = `${incomingCollectable.params.accountId.toString()}-${erc20TokenToAssetId(
      incomingCollectable.params.erc20
    )}`;
    const accountAssetConfigBefore = defaultAccountAssetConfig(accountAssetConfigId);
    accountAssetConfigBefore.amountCollected = BigInt.fromI32(10);
    accountAssetConfigBefore.amountPostSplitCollectable = BigInt.fromI32(10);
    accountAssetConfigBefore.save();

    // Act
    handleCollectable(incomingCollectable);

    // Assert
    const account = Account.load(incomingCollectable.params.accountId.toString()) as Account;
    assert.assertNotNull(account);

    const id =
      incomingCollectable.transaction.hash.toHexString() +
      '-' +
      incomingCollectable.logIndex.toString();
    const collectableEvent = CollectableEvent.load(id) as CollectableEvent;
    assert.stringEquals(collectableEvent.account, incomingCollectable.params.accountId.toString());
    assert.bigIntEquals(
      collectableEvent.assetId,
      erc20TokenToAssetId(incomingCollectable.params.erc20)
    );
    assert.bigIntEquals(collectableEvent.amt, incomingCollectable.params.amt);
    assert.bigIntEquals(collectableEvent.blockTimestamp, incomingCollectable.block.timestamp);

    const accountAssetConfigAfter = AccountAssetConfig.load(
      accountAssetConfigId
    ) as AccountAssetConfig;
    assert.bigIntEquals(
      accountAssetConfigAfter.amountPostSplitCollectable,
      accountAssetConfigBefore.amountPostSplitCollectable.plus(incomingCollectable.params.amt)
    );
    assert.bigIntEquals(
      accountAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingCollectable.block.timestamp
    );
  });
});
