import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as';
import {
  StreamsEntry,
  StreamsSetEvent,
  LastSetStreamAccountMapping,
  Account,
  AccountAssetConfig
} from '../generated/schema';
import { handleStreamsSet } from '../src/mapping';
import { createStreamSetEvent } from './helpers/eventCreators';
import {
  defaultStreamsEntry,
  defaultAccount,
  defaultAccountAssetConfig
} from './helpers/defaultEntityCreators';
import { erc20TokenToAssetId } from '../src/utils';

describe('handleStreamsSet', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const incomingStreamSetEvent = createStreamSetEvent(
      BigInt.fromI32(1),
      Address.fromString('0x20a9273a452268E5a034951ae5381a45E14aC2a3'),
      Bytes.fromUTF8('receiversHash'),
      Bytes.fromUTF8('streamHistoryHash'),
      BigInt.fromI32(3),
      BigInt.fromI32(4)
    );

    // Act
    handleStreamsSet(incomingStreamSetEvent);

    // Assert
    const account = Account.load(incomingStreamSetEvent.params.accountId.toString());
    assert.assertNotNull(account);

    const accountAssetConfigId = `${incomingStreamSetEvent.params.accountId.toString()}-${erc20TokenToAssetId(
      incomingStreamSetEvent.params.erc20
    )}`;
    const accountAssetConfig = AccountAssetConfig.load(accountAssetConfigId) as AccountAssetConfig;
    assert.bigIntEquals(accountAssetConfig.balance, incomingStreamSetEvent.params.balance);
    assert.bytesEquals(
      accountAssetConfig.assetConfigHash,
      incomingStreamSetEvent.params.receiversHash
    );
    assert.bigIntEquals(
      accountAssetConfig.lastUpdatedBlockTimestamp,
      incomingStreamSetEvent.block.timestamp
    );
    assert.arrayEquals(
      accountAssetConfig.streamsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      []
    );

    const streamSetEventId = `${incomingStreamSetEvent.transaction.hash.toHexString()}-${incomingStreamSetEvent.logIndex.toString()}`;
    const streamSetEventEntity = StreamsSetEvent.load(streamSetEventId) as StreamsSetEvent;
    assert.stringEquals(
      streamSetEventEntity.accountId,
      incomingStreamSetEvent.params.accountId.toString()
    );
    assert.bigIntEquals(
      streamSetEventEntity.assetId,
      erc20TokenToAssetId(incomingStreamSetEvent.params.erc20)
    );
    assert.bytesEquals(
      streamSetEventEntity.receiversHash,
      incomingStreamSetEvent.params.receiversHash
    );
    assert.bytesEquals(
      streamSetEventEntity.streamsHistoryHash,
      incomingStreamSetEvent.params.streamsHistoryHash
    );
    assert.bigIntEquals(streamSetEventEntity.balance, incomingStreamSetEvent.params.balance);
    assert.bigIntEquals(streamSetEventEntity.maxEnd, incomingStreamSetEvent.params.maxEnd);
    assert.bigIntEquals(
      streamSetEventEntity.blockTimestamp,
      incomingStreamSetEvent.block.timestamp
    );

    const laststreamSetAccountMappingId = incomingStreamSetEvent.params.receiversHash.toHexString();
    const laststreamSetAccountMapping = LastSetStreamAccountMapping.load(
      laststreamSetAccountMappingId
    ) as LastSetStreamAccountMapping;
    assert.stringEquals(laststreamSetAccountMapping.streamsSetEventId, streamSetEventId);
    assert.stringEquals(
      laststreamSetAccountMapping.accountId,
      incomingStreamSetEvent.params.accountId.toString()
    );
    assert.bigIntEquals(
      laststreamSetAccountMapping.assetId,
      erc20TokenToAssetId(incomingStreamSetEvent.params.erc20)
    );
  });

  test('should update entities as expected when mapping', () => {
    // Arrange
    const accountId = BigInt.fromI32(1);
    const account = defaultAccount(accountId.toString());
    account.save();

    const incomingStreamSetEvent = createStreamSetEvent(
      accountId,
      Address.fromString('0x20a9273a452268E5a034951ae5381a45E14aC2a3'),
      Bytes.fromUTF8('receiversHash'),
      Bytes.fromUTF8('streamHistoryHash'),
      BigInt.fromI32(3),
      BigInt.fromI32(4)
    );

    const streamEntryId = '1';
    const streamEntry = defaultStreamsEntry(streamEntryId);
    streamEntry.save();

    const accountAssetConfigId = `${incomingStreamSetEvent.params.accountId.toString()}-${erc20TokenToAssetId(
      incomingStreamSetEvent.params.erc20
    )}`;
    let accountAssetConfig = defaultAccountAssetConfig(accountAssetConfigId);
    accountAssetConfig.streamsEntryIds = [streamEntryId];
    accountAssetConfig.save();

    // Act
    handleStreamsSet(incomingStreamSetEvent);

    // Assert
    assert.assertNull(StreamsEntry.load(streamEntryId));

    accountAssetConfig = AccountAssetConfig.load(accountAssetConfigId) as AccountAssetConfig;
    assert.bigIntEquals(accountAssetConfig.balance, incomingStreamSetEvent.params.balance);
    assert.bytesEquals(
      accountAssetConfig.assetConfigHash,
      incomingStreamSetEvent.params.receiversHash
    );
    assert.bigIntEquals(
      accountAssetConfig.lastUpdatedBlockTimestamp,
      incomingStreamSetEvent.block.timestamp
    );
    assert.arrayEquals(
      accountAssetConfig.streamsEntryIds.map<ethereum.Value>((s) => ethereum.Value.fromString(s)),
      []
    );

    const streamSetEventId = `${incomingStreamSetEvent.transaction.hash.toHexString()}-${incomingStreamSetEvent.logIndex.toString()}`;
    const streamSetEventEntity = StreamsSetEvent.load(streamSetEventId) as StreamsSetEvent;
    assert.stringEquals(
      streamSetEventEntity.accountId,
      incomingStreamSetEvent.params.accountId.toString()
    );
    assert.bigIntEquals(
      streamSetEventEntity.assetId,
      erc20TokenToAssetId(incomingStreamSetEvent.params.erc20)
    );
    assert.bytesEquals(
      streamSetEventEntity.receiversHash,
      incomingStreamSetEvent.params.receiversHash
    );
    assert.bytesEquals(
      streamSetEventEntity.streamsHistoryHash,
      incomingStreamSetEvent.params.streamsHistoryHash
    );
    assert.bigIntEquals(streamSetEventEntity.balance, incomingStreamSetEvent.params.balance);
    assert.bigIntEquals(streamSetEventEntity.maxEnd, incomingStreamSetEvent.params.maxEnd);
    assert.bigIntEquals(
      streamSetEventEntity.blockTimestamp,
      incomingStreamSetEvent.block.timestamp
    );

    const laststreamSetAccountMappingId = incomingStreamSetEvent.params.receiversHash.toHexString();
    const laststreamSetAccountMapping = LastSetStreamAccountMapping.load(
      laststreamSetAccountMappingId
    ) as LastSetStreamAccountMapping;
    assert.stringEquals(laststreamSetAccountMapping.streamsSetEventId, streamSetEventId);
    assert.stringEquals(
      laststreamSetAccountMapping.accountId,
      incomingStreamSetEvent.params.accountId.toString()
    );
    assert.bigIntEquals(
      laststreamSetAccountMapping.assetId,
      erc20TokenToAssetId(incomingStreamSetEvent.params.erc20)
    );
  });
});
