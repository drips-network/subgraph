import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { ReceivedStreamsEvent, AccountAssetConfig } from '../generated/schema';
import { handleReceivedStreams } from '../src/mapping';
import { createReceivedStreams } from './helpers/eventCreators';
import { defaultAccountAssetConfig } from './helpers/defaultEntityCreators';
import { erc20TokenToAssetId } from '../src/utils';

describe('handleReceivedStreams', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const accountId = BigInt.fromI32(1);
    const erc20 = Address.fromString('0x20a9273a452268E5a034951ae5381a45E14aC2a3');
    const amt = BigInt.fromI32(3);
    const receivableCycles = BigInt.fromI32(4);

    const incomingReceivedStreams = createReceivedStreams(accountId, erc20, amt, receivableCycles);

    const accountAssetConfigId = accountId.toString() + '-' + erc20TokenToAssetId(erc20).toString();
    const accountAssetConfigBefore = defaultAccountAssetConfig(accountAssetConfigId);
    accountAssetConfigBefore.amountSplittable = BigInt.fromI32(10);
    accountAssetConfigBefore.save();

    // Act
    handleReceivedStreams(incomingReceivedStreams);

    // Assert
    const id =
      incomingReceivedStreams.transaction.hash.toHexString() +
      '-' +
      incomingReceivedStreams.logIndex.toString();
    const receivedStreams = ReceivedStreamsEvent.load(id) as ReceivedStreamsEvent;
    assert.stringEquals(
      receivedStreams.accountId,
      incomingReceivedStreams.params.accountId.toString()
    );
    assert.bigIntEquals(
      receivedStreams.assetId,
      erc20TokenToAssetId(incomingReceivedStreams.params.erc20)
    );
    assert.bigIntEquals(receivedStreams.amt, incomingReceivedStreams.params.amt);
    assert.bigIntEquals(
      receivedStreams.receivableCycles,
      incomingReceivedStreams.params.receivableCycles
    );
    assert.bigIntEquals(receivedStreams.blockTimestamp, incomingReceivedStreams.block.timestamp);

    const accountAssetConfigAfter = AccountAssetConfig.load(
      accountAssetConfigId
    ) as AccountAssetConfig;
    assert.bigIntEquals(
      accountAssetConfigAfter.amountSplittable,
      accountAssetConfigBefore.amountSplittable.plus(incomingReceivedStreams.params.amt)
    );
    assert.bigIntEquals(
      accountAssetConfigAfter.lastUpdatedBlockTimestamp,
      incomingReceivedStreams.block.timestamp
    );
  });
});
