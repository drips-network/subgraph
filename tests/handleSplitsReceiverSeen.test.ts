import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { LastSetSplitsUserMapping, SplitsEntry, User } from '../generated/schema';
import { handleSplitsReceiverSeen } from '../src/mapping';
import { createSplitsReceiverSeen } from './helpers/eventCreators';

describe('handleSplitsReceiverSeen', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const receiversHash = Bytes.fromUTF8('receiversHash');
    const userId = BigInt.fromI32(1);
    const weight = BigInt.fromI32(2);

    const incomingSplitsReceiverSeen = createSplitsReceiverSeen(receiversHash, userId, weight);

    const lastSplitsSetUserMappingId =
      incomingSplitsReceiverSeen.params.receiversHash.toHexString();
    const lastSplitsSetUserMapping = new LastSetSplitsUserMapping(lastSplitsSetUserMappingId);
    lastSplitsSetUserMapping.save();

    // Act
    handleSplitsReceiverSeen(incomingSplitsReceiverSeen);

    // Assert
    const splitsEntryId = `${lastSplitsSetUserMapping.userId.toString()}-${incomingSplitsReceiverSeen.params.userId.toString()}`;
    const splitsEntry = SplitsEntry.load(splitsEntryId) as SplitsEntry;
    assert.stringEquals(splitsEntry.sender, lastSplitsSetUserMapping.userId.toString());
    assert.stringEquals(splitsEntry.userId, incomingSplitsReceiverSeen.params.userId.toString());
    assert.bigIntEquals(splitsEntry.weight, incomingSplitsReceiverSeen.params.weight);

    const user = User.load(lastSplitsSetUserMapping.userId.toString()) as User;
    assert.arrayEquals(
      user.splitsEntries.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      [ethereum.Value.fromString(splitsEntryId)]
    );
  });
});
