import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { LastSetSplitsUserMapping, SplitsEntry, SplitsSetEvent, User } from '../generated/schema';
import { handleSplitsSet } from '../src/mapping';
import { createSplitsSet } from './helpers/eventCreators';

describe('handleSplitsSet', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const receiversHash = Bytes.fromUTF8('receiversHash');
    const userId = BigInt.fromI32(1);

    const incomingSplitsSet = createSplitsSet(userId, receiversHash);

    // Act
    handleSplitsSet(incomingSplitsSet);

    // Assert
    const user = User.load(incomingSplitsSet.params.userId.toString()) as User;
    assert.bytesEquals(user.splitsReceiversHash, incomingSplitsSet.params.receiversHash);
    assert.bigIntEquals(user.lastUpdatedBlockTimestamp, incomingSplitsSet.block.timestamp);

    const splitsSetEventId = `${incomingSplitsSet.transaction.hash.toHexString()}-${incomingSplitsSet.logIndex.toString()}`;
    const splitsSetEvent = SplitsSetEvent.load(splitsSetEventId) as SplitsSetEvent;
    assert.stringEquals(splitsSetEvent.userId, incomingSplitsSet.params.userId.toString());
    assert.bytesEquals(splitsSetEvent.receiversHash, incomingSplitsSet.params.receiversHash);
    assert.bigIntEquals(splitsSetEvent.blockTimestamp, incomingSplitsSet.block.timestamp);

    const lastSplitsSetUserMappingId = incomingSplitsSet.params.receiversHash.toHexString();
    const lastSplitsSetUserMapping = LastSetSplitsUserMapping.load(
      lastSplitsSetUserMappingId
    ) as LastSetSplitsUserMapping;
    assert.stringEquals(
      lastSplitsSetUserMapping.userId,
      incomingSplitsSet.params.userId.toString()
    );
    assert.stringEquals(lastSplitsSetUserMapping.splitsSetEventId, splitsSetEventId);
  });

  test('should update entities as expected when mapping', () => {
    // Arrange
    const receiversHash = Bytes.fromUTF8('receiversHash');

    const userId = BigInt.fromI32(1);
    let user = new User(userId.toString());
    user.splitsEntries = ['1-2', '1-3'];

    const incomingSplitsSet = createSplitsSet(userId, receiversHash);

    // Act
    handleSplitsSet(incomingSplitsSet);

    // Assert
    const splitsSetEventId = `${incomingSplitsSet.transaction.hash.toHexString()}-${incomingSplitsSet.logIndex.toString()}`;
    const splitsSetEvent = SplitsSetEvent.load(splitsSetEventId) as SplitsSetEvent;
    assert.stringEquals(splitsSetEvent.userId, incomingSplitsSet.params.userId.toString());
    assert.bytesEquals(splitsSetEvent.receiversHash, incomingSplitsSet.params.receiversHash);
    assert.bigIntEquals(splitsSetEvent.blockTimestamp, incomingSplitsSet.block.timestamp);

    const lastSplitsSetUserMappingId = incomingSplitsSet.params.receiversHash.toHexString();
    const lastSplitsSetUserMapping = LastSetSplitsUserMapping.load(
      lastSplitsSetUserMappingId
    ) as LastSetSplitsUserMapping;
    assert.stringEquals(
      lastSplitsSetUserMapping.userId,
      incomingSplitsSet.params.userId.toString()
    );
    assert.stringEquals(lastSplitsSetUserMapping.splitsSetEventId, splitsSetEventId);

    user = User.load(incomingSplitsSet.params.userId.toString()) as User;
    assert.bytesEquals(user.splitsReceiversHash, incomingSplitsSet.params.receiversHash);
    assert.bigIntEquals(user.lastUpdatedBlockTimestamp, incomingSplitsSet.block.timestamp);
    assert.arrayEquals(
      user.splitsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      []
    );
  });
});
