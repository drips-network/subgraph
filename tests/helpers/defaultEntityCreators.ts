import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  App,
  DripsEntry,
  LastSetDripsUserMapping,
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

export function defaultDripsEntry(id: string): DripsEntry {
  const dripsEntry = new DripsEntry(id);

  dripsEntry.userId = 'userId';
  dripsEntry.sender = 'sender';
  dripsEntry.senderAssetConfig = 'senderAssetConfig';
  dripsEntry.config = BigInt.fromI32(0);

  return dripsEntry;
}

export function defaultUserAssetConfig(id: string): UserAssetConfig {
  const userAssetConfig = new UserAssetConfig(id);

  userAssetConfig.user = 'userId';
  userAssetConfig.assetId = BigInt.fromI32(0);
  userAssetConfig.dripsEntryIds = [];
  userAssetConfig.dripsEntries = [];
  userAssetConfig.balance = BigInt.fromI32(0);
  userAssetConfig.assetConfigHash = Bytes.fromUTF8('assetConfigHash');
  userAssetConfig.lastUpdatedBlockTimestamp = BigInt.fromI32(0);
  userAssetConfig.amountSplittable = BigInt.fromI32(0);
  userAssetConfig.amountPostSplitCollectable = BigInt.fromI32(0);
  userAssetConfig.amountCollected = BigInt.fromI32(0);

  return userAssetConfig;
}

export function defaultLastSetDripsUserMapping(id: string): LastSetDripsUserMapping {
  const lastSetDripsUserMapping = new LastSetDripsUserMapping(id);

  lastSetDripsUserMapping.dripsSetEventId = 'dripsSetEventId';
  lastSetDripsUserMapping.userId = 'userId';
  lastSetDripsUserMapping.assetId = BigInt.fromI32(0);

  return lastSetDripsUserMapping;
}

export function defaultLastSetSplitsUserMapping(id: string): LastSetSplitsUserMapping {
  const lastSetSplitsUserMapping = new LastSetSplitsUserMapping(id);

  lastSetSplitsUserMapping.splitsSetEventId = 'dripsSetEventId';
  lastSetSplitsUserMapping.userId = 'userId';

  return lastSetSplitsUserMapping;
}
