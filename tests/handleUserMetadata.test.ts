import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { UserMetadataByKey, UserMetadataEvent } from '../generated/schema';
import { handleUserMetadata } from '../src/mapping';
import { createUserMetadataEmitted } from './helpers/eventCreators';

describe('handleUserMetadata', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const userId = BigInt.fromI32(1);
    const key = Bytes.fromUTF8('0x000000');
    const value = Bytes.fromUTF8('0x111111');

    const incomingUserMetadataEmitted = createUserMetadataEmitted(userId, key, value);

    // Act
    handleUserMetadata(incomingUserMetadataEmitted);

    // Assert
    const userMetadataByKeyId =
      incomingUserMetadataEmitted.params.userId.toString() +
      '-' +
      incomingUserMetadataEmitted.params.key.toString();
    const userMetadataByKey = UserMetadataByKey.load(userMetadataByKeyId) as UserMetadataByKey;
    assert.stringEquals(
      userMetadataByKey.userId,
      incomingUserMetadataEmitted.params.userId.toString()
    );
    assert.bytesEquals(userMetadataByKey.key, incomingUserMetadataEmitted.params.key);
    assert.bytesEquals(userMetadataByKey.value, incomingUserMetadataEmitted.params.value);
    assert.bigIntEquals(
      userMetadataByKey.lastUpdatedBlockTimestamp,
      incomingUserMetadataEmitted.block.timestamp
    );

    const userMetadataEvent = UserMetadataEvent.load(
      incomingUserMetadataEmitted.transaction.hash.toHexString() +
        '-' +
        incomingUserMetadataEmitted.logIndex.toString()
    ) as UserMetadataEvent;
    assert.stringEquals(
      userMetadataEvent.userId,
      incomingUserMetadataEmitted.params.userId.toString()
    );
    assert.bytesEquals(userMetadataEvent.key, incomingUserMetadataEmitted.params.key);
    assert.bytesEquals(userMetadataEvent.value, incomingUserMetadataEmitted.params.value);
    assert.bigIntEquals(
      userMetadataEvent.lastUpdatedBlockTimestamp,
      incomingUserMetadataEmitted.block.timestamp
    );
  });
});
