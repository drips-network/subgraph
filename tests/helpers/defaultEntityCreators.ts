import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  App,
  StreamsEntry,
  LastSetStreamAccountMapping,
  LastSetSplitsAccountMapping,
  Account,
  AccountAssetConfig
} from '../../generated/schema';

export function defaultAccount(id: string): Account {
  const account = new Account(id);

  account.assetConfigs = [];
  account.splitsEntryIds = [];
  account.splitsEntries = [];
  account.splitsReceiversHash = Bytes.fromUTF8('splitsReceiversHash');
  account.lastUpdatedBlockTimestamp = BigInt.fromI32(0);

  return account;
}

export function defaultApp(id: string): App {
  const app = new App(id);

  app.appAddress = Bytes.fromUTF8('0x0000000000000000000000000000000000000000');
  app.lastUpdatedBlockTimestamp = BigInt.fromI32(0);

  return app;
}

export function defaultStreamsEntry(id: string): StreamsEntry {
  const streamsEntry = new StreamsEntry(id);

  streamsEntry.accountId = 'accountId';
  streamsEntry.sender = 'sender';
  streamsEntry.senderAssetConfig = 'senderAssetConfig';
  streamsEntry.config = BigInt.fromI32(0);

  return streamsEntry;
}

export function defaultAccountAssetConfig(id: string): AccountAssetConfig {
  const accountAssetConfig = new AccountAssetConfig(id);

  accountAssetConfig.account = 'accountId';
  accountAssetConfig.assetId = BigInt.fromI32(0);
  accountAssetConfig.streamsEntryIds = [];
  accountAssetConfig.streamsEntries = [];
  accountAssetConfig.balance = BigInt.fromI32(0);
  accountAssetConfig.assetConfigHash = Bytes.fromUTF8('assetConfigHash');
  accountAssetConfig.lastUpdatedBlockTimestamp = BigInt.fromI32(0);
  accountAssetConfig.amountSplittable = BigInt.fromI32(0);
  accountAssetConfig.amountPostSplitCollectable = BigInt.fromI32(0);
  accountAssetConfig.amountCollected = BigInt.fromI32(0);

  return accountAssetConfig;
}

export function defaultLastSetStreamsAccountMapping(id: string): LastSetStreamAccountMapping {
  const lastSetStreamAccountMapping = new LastSetStreamAccountMapping(id);

  lastSetStreamAccountMapping.streamsSetEventId = 'streamsSetEventId';
  lastSetStreamAccountMapping.accountId = 'accountId';
  lastSetStreamAccountMapping.assetId = BigInt.fromI32(0);

  return lastSetStreamAccountMapping;
}

export function defaultLastSetSplitsAccountMapping(id: string): LastSetSplitsAccountMapping {
  const lastSetSplitsAccountMapping = new LastSetSplitsAccountMapping(id);

  lastSetSplitsAccountMapping.splitsSetEventId = 'streamHistoryHashSetEventId';
  lastSetSplitsAccountMapping.accountId = 'accountId';

  return lastSetSplitsAccountMapping;
}
