import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, log, logStore, beforeEach } from 'matchstick-as';
import { ImmutableSplitsCreated } from '../generated/schema';
import { handleImmutableSplitsCreated } from '../src/mapping';
import { createCreatedSplits } from './helpers/eventCreators';

describe('handleImmutableSplitsCreated', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const userId = BigInt.fromI32(1);
    const receiversHash = Bytes.fromUTF8('receiversHash');

    const incomingCreatedSplits = createCreatedSplits(userId, receiversHash.toHexString());

    // Act
    handleImmutableSplitsCreated(incomingCreatedSplits);

    // Assert
    const immutableSplitsCreated = ImmutableSplitsCreated.load(
      `${incomingCreatedSplits.params.userId.toString()}-${incomingCreatedSplits.params.receiversHash.toHexString()}`
    ) as ImmutableSplitsCreated;

    assert.stringEquals(
      immutableSplitsCreated.userId,
      incomingCreatedSplits.params.userId.toString()
    );
    assert.bytesEquals(
      immutableSplitsCreated.receiversHash,
      incomingCreatedSplits.params.receiversHash
    );
  });
});
