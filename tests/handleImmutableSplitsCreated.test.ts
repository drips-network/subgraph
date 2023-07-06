import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { ImmutableSplitsCreated } from '../generated/schema';
import { handleImmutableSplitsCreated } from '../src/mapping';
import { createCreatedSplits } from './helpers/eventCreators';

describe('handleImmutableSplitsCreated', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const accountId = BigInt.fromI32(1);
    const receiversHash = Bytes.fromUTF8('receiversHash');

    const incomingCreatedSplits = createCreatedSplits(accountId, receiversHash.toHexString());

    // Act
    handleImmutableSplitsCreated(incomingCreatedSplits);

    // Assert
    const immutableSplitsCreated = ImmutableSplitsCreated.load(
      `${incomingCreatedSplits.params.accountId.toString()}-${incomingCreatedSplits.params.receiversHash.toHexString()}`
    ) as ImmutableSplitsCreated;

    assert.stringEquals(
      immutableSplitsCreated.accountId,
      incomingCreatedSplits.params.accountId.toString()
    );
    assert.bytesEquals(
      immutableSplitsCreated.receiversHash,
      incomingCreatedSplits.params.receiversHash
    );
  });
});
