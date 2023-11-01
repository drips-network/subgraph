import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { SplitsEntry, Account } from '../generated/schema';
import { handleSplitsReceiverSeen } from '../src/mapping';
import { createSplitsReceiverSeen } from './helpers/eventCreators';
import { defaultLastSetSplitsAccountMapping } from './helpers/defaultEntityCreators';

describe('handleSplitsReceiverSeen', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const receiversHash = Bytes.fromUTF8('receiversHash');
    const accountId = BigInt.fromI32(1);
    const weight = BigInt.fromI32(2);

    const incomingSplitsReceiverSeen = createSplitsReceiverSeen(receiversHash, accountId, weight);

    const lastSplitsSetAccountMappingId =
      incomingSplitsReceiverSeen.params.receiversHash.toHexString();
    const lastSplitsSetAccountMapping = defaultLastSetSplitsAccountMapping(
      lastSplitsSetAccountMappingId
    );
    lastSplitsSetAccountMapping.save();

    // Act
    handleSplitsReceiverSeen(incomingSplitsReceiverSeen);

    // Assert
    const splitsEntryId = `${lastSplitsSetAccountMapping.accountId.toString()}-${incomingSplitsReceiverSeen.params.accountId.toString()}`;
    const splitsEntry = SplitsEntry.load(splitsEntryId) as SplitsEntry;
    assert.stringEquals(splitsEntry.sender, lastSplitsSetAccountMapping.accountId.toString());
    assert.stringEquals(
      splitsEntry.accountId,
      incomingSplitsReceiverSeen.params.accountId.toString()
    );
    assert.bigIntEquals(splitsEntry.weight, incomingSplitsReceiverSeen.params.weight);

    const account = Account.load(lastSplitsSetAccountMapping.accountId.toString()) as Account;
    assert.arrayEquals(
      account.splitsEntries.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      [ethereum.Value.fromString(splitsEntryId)]
    );
  });
});
