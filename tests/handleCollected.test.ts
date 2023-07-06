import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { CollectedEvent, Account, AccountAssetConfig } from '../generated/schema';
import { handleCollected } from '../src/mapping';
import { createCollected } from './helpers/eventCreators';
import { defaultAccountAssetConfig } from './helpers/defaultEntityCreators';
import { erc20TokenToAssetId } from '../src/utils';

describe('handleCollected', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const accountId = BigInt.fromI32(1);
    const erc20 = Address.fromString('0x20a9273a452268E5a034951ae5381a45E14aC2a3');
    const collected = BigInt.fromI32(2);

    const incomingCollected = createCollected(accountId, erc20, collected);

    const accountAssetConfigId = `${incomingCollected.params.accountId.toString()}-${erc20TokenToAssetId(
      incomingCollected.params.erc20
    )}`;
    const accountAssetConfigBefore = defaultAccountAssetConfig(accountAssetConfigId);
    accountAssetConfigBefore.amountCollected = BigInt.fromI32(10);
    accountAssetConfigBefore.amountPostSplitCollectable = BigInt.fromI32(10);
    accountAssetConfigBefore.save();

    // Act
    handleCollected(incomingCollected);

    // Assert
    const account = Account.load(incomingCollected.params.accountId.toString()) as Account;
    assert.assertNotNull(account);

    const id =
      incomingCollected.transaction.hash.toHexString() +
      '-' +
      incomingCollected.logIndex.toString();
    const collectedEvent = CollectedEvent.load(id) as CollectedEvent;
    assert.stringEquals(collectedEvent.account, incomingCollected.params.accountId.toString());
    assert.bigIntEquals(
      collectedEvent.assetId,
      erc20TokenToAssetId(incomingCollected.params.erc20)
    );
    assert.bigIntEquals(collectedEvent.collected, incomingCollected.params.collected);
    assert.bigIntEquals(collectedEvent.blockTimestamp, incomingCollected.block.timestamp);

    const accountAssetConfigAfter = AccountAssetConfig.load(
      accountAssetConfigId
    ) as AccountAssetConfig;
    assert.bigIntEquals(
      accountAssetConfigAfter.amountCollected,
      accountAssetConfigBefore.amountCollected.plus(incomingCollected.params.collected)
    );
    assert.bigIntEquals(accountAssetConfigAfter.amountPostSplitCollectable, BigInt.fromI32(0));
    assert.bigIntEquals(
      accountAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingCollected.block.timestamp
    );
  });
});
