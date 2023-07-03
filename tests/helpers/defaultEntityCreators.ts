import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  App,
  StreamsEntry,
  LastSetStreamUserMapping,
  LastSetSplitsUserMapping,
  User,
  UserAssetConfig
} from '../../generated/schema';

export function defaultUser(id: string): User {
  const user = new User(id);

  user.assetConfigs = [];
  user.splitsEntryIds = [];
  user.splitsEntries = [];
  user.splitsReceiversHash = Bytes.fromUTF8('splitsReceiversHash');
  user.lastUpdatedBlockTimestamp = BigInt.fromI32(0);

  return user;
}

export function defaultApp(id: string): App {
  const app = new App(id);

  app.appAddress = Bytes.fromUTF8('0x0000000000000000000000000000000000000000');
  app.lastUpdatedBlockTimestamp = BigInt.fromI32(0);

  return app;
}

export function defaultStreamsEntry(id: string): StreamsEntry {
  const streamsEntry = new StreamsEntry(id);

  streamsEntry.userId = 'userId';
  streamsEntry.sender = 'sender';
  streamsEntry.senderAssetConfig = 'senderAssetConfig';
  streamsEntry.config = BigInt.fromI32(0);

  return streamsEntry;
}

export function defaultUserAssetConfig(id: string): UserAssetConfig {
  const userAssetConfig = new UserAssetConfig(id);

  userAssetConfig.user = 'userId';
  userAssetConfig.assetId = BigInt.fromI32(0);
  userAssetConfig.streamsEntryIds = [];
  userAssetConfig.streamsEntries = [];
  userAssetConfig.balance = BigInt.fromI32(0);
  userAssetConfig.assetConfigHash = Bytes.fromUTF8('assetConfigHash');
  userAssetConfig.lastUpdatedBlockTimestamp = BigInt.fromI32(0);
  userAssetConfig.amountSplittable = BigInt.fromI32(0);
  userAssetConfig.amountPostSplitCollectable = BigInt.fromI32(0);
  userAssetConfig.amountCollected = BigInt.fromI32(0);

  return userAssetConfig;
}

export function defaultLastSetStreamsUserMapping(id: string): LastSetStreamUserMapping {
  const lastSetStreamUserMapping = new LastSetStreamUserMapping(id);

  lastSetStreamUserMapping.streamsSetEventId = 'streamsSetEventId';
  lastSetStreamUserMapping.userId = 'userId';
  lastSetStreamUserMapping.assetId = BigInt.fromI32(0);

  return lastSetStreamUserMapping;
}

export function defaultLastSetSplitsUserMapping(id: string): LastSetSplitsUserMapping {
  const lastSetSplitsUserMapping = new LastSetSplitsUserMapping(id);

  lastSetSplitsUserMapping.splitsSetEventId = 'streamHistoryHashSetEventId';
  lastSetSplitsUserMapping.userId = 'userId';

  return lastSetSplitsUserMapping;
}
