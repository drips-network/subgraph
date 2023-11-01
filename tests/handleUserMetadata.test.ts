import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { AccountMetadataByKey, AccountMetadataEvent } from '../generated/schema';
import { handleAccountMetadata } from '../src/mapping';
import { createAccountMetadataEmitted } from './helpers/eventCreators';

describe('handleAccountMetadata', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const accountId = BigInt.fromI32(1);
    const key = Bytes.fromUTF8('0x000000');
    const value = Bytes.fromUTF8('0x111111');

    const incomingAccountMetadataEmitted = createAccountMetadataEmitted(accountId, key, value);

    // Act
    handleAccountMetadata(incomingAccountMetadataEmitted);

    // Assert
    const accountMetadataByKeyId =
      incomingAccountMetadataEmitted.params.accountId.toString() +
      '-' +
      incomingAccountMetadataEmitted.params.key.toString();
    const accountMetadataByKey = AccountMetadataByKey.load(
      accountMetadataByKeyId
    ) as AccountMetadataByKey;
    assert.stringEquals(
      accountMetadataByKey.accountId,
      incomingAccountMetadataEmitted.params.accountId.toString()
    );
    assert.bytesEquals(accountMetadataByKey.key, incomingAccountMetadataEmitted.params.key);
    assert.bytesEquals(accountMetadataByKey.value, incomingAccountMetadataEmitted.params.value);
    assert.bigIntEquals(
      accountMetadataByKey.lastUpdatedBlockTimestamp,
      incomingAccountMetadataEmitted.block.timestamp
    );

    const accountMetadataEvent = AccountMetadataEvent.load(
      incomingAccountMetadataEmitted.transaction.hash.toHexString() +
        '-' +
        incomingAccountMetadataEmitted.logIndex.toString()
    ) as AccountMetadataEvent;
    assert.stringEquals(
      accountMetadataEvent.accountId,
      incomingAccountMetadataEmitted.params.accountId.toString()
    );
    assert.bytesEquals(accountMetadataEvent.key, incomingAccountMetadataEmitted.params.key);
    assert.bytesEquals(accountMetadataEvent.value, incomingAccountMetadataEmitted.params.value);
    assert.bigIntEquals(
      accountMetadataEvent.lastUpdatedBlockTimestamp,
      incomingAccountMetadataEmitted.block.timestamp
    );
  });
});
