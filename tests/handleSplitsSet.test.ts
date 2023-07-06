import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { LastSetSplitsAccountMapping, SplitsSetEvent, Account } from '../generated/schema';
import { handleSplitsSet } from '../src/mapping';
import { createSplitsSet } from './helpers/eventCreators';

describe('handleSplitsSet', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const receiversHash = Bytes.fromUTF8('receiversHash');
    const accountId = BigInt.fromI32(1);

    const incomingSplitsSet = createSplitsSet(accountId, receiversHash);

    // Act
    handleSplitsSet(incomingSplitsSet);

    // Assert
    const account = Account.load(incomingSplitsSet.params.accountId.toString()) as Account;
    assert.bytesEquals(account.splitsReceiversHash, incomingSplitsSet.params.receiversHash);
    assert.bigIntEquals(account.lastUpdatedBlockTimestamp, incomingSplitsSet.block.timestamp);

    const splitsSetEventId = `${incomingSplitsSet.transaction.hash.toHexString()}-${incomingSplitsSet.logIndex.toString()}`;
    const splitsSetEvent = SplitsSetEvent.load(splitsSetEventId) as SplitsSetEvent;
    assert.stringEquals(splitsSetEvent.accountId, incomingSplitsSet.params.accountId.toString());
    assert.bytesEquals(splitsSetEvent.receiversHash, incomingSplitsSet.params.receiversHash);
    assert.bigIntEquals(splitsSetEvent.blockTimestamp, incomingSplitsSet.block.timestamp);

    const lastSplitsSetAccountMappingId = incomingSplitsSet.params.receiversHash.toHexString();
    const lastSplitsSetAccountMapping = LastSetSplitsAccountMapping.load(
      lastSplitsSetAccountMappingId
    ) as LastSetSplitsAccountMapping;
    assert.stringEquals(
      lastSplitsSetAccountMapping.accountId,
      incomingSplitsSet.params.accountId.toString()
    );
    assert.stringEquals(lastSplitsSetAccountMapping.splitsSetEventId, splitsSetEventId);
  });

  test('should update entities as expected when mapping', () => {
    // Arrange
    const receiversHash = Bytes.fromUTF8('receiversHash');

    const accountId = BigInt.fromI32(1);
    let account = new Account(accountId.toString());
    account.splitsEntries = ['1-2', '1-3'];

    const incomingSplitsSet = createSplitsSet(accountId, receiversHash);

    // Act
    handleSplitsSet(incomingSplitsSet);

    // Assert
    const splitsSetEventId = `${incomingSplitsSet.transaction.hash.toHexString()}-${incomingSplitsSet.logIndex.toString()}`;
    const splitsSetEvent = SplitsSetEvent.load(splitsSetEventId) as SplitsSetEvent;
    assert.stringEquals(splitsSetEvent.accountId, incomingSplitsSet.params.accountId.toString());
    assert.bytesEquals(splitsSetEvent.receiversHash, incomingSplitsSet.params.receiversHash);
    assert.bigIntEquals(splitsSetEvent.blockTimestamp, incomingSplitsSet.block.timestamp);

    const lastSplitsSetAccountMappingId = incomingSplitsSet.params.receiversHash.toHexString();
    const lastSplitsSetAccountMapping = LastSetSplitsAccountMapping.load(
      lastSplitsSetAccountMappingId
    ) as LastSetSplitsAccountMapping;
    assert.stringEquals(
      lastSplitsSetAccountMapping.accountId,
      incomingSplitsSet.params.accountId.toString()
    );
    assert.stringEquals(lastSplitsSetAccountMapping.splitsSetEventId, splitsSetEventId);

    account = Account.load(incomingSplitsSet.params.accountId.toString()) as Account;
    assert.bytesEquals(account.splitsReceiversHash, incomingSplitsSet.params.receiversHash);
    assert.bigIntEquals(account.lastUpdatedBlockTimestamp, incomingSplitsSet.block.timestamp);
    assert.arrayEquals(
      account.splitsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      []
    );
  });
});
