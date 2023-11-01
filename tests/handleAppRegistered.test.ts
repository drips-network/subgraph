import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { App } from '../generated/schema';
import { handleAppRegistered } from '../src/mapping';
import { createDriverRegistered } from './helpers/eventCreators';

describe('handleAppRegistered', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange

    const driverId = BigInt.fromI32(1);
    const driverAddr = Address.fromString('0x0000000000000000000000000000000000000420');

    const incomingDriverRegistered = createDriverRegistered(driverId, driverAddr);

    // Act
    handleAppRegistered(incomingDriverRegistered);

    // Assert
    const appId = incomingDriverRegistered.params.driverId.toString();
    const app = App.load(appId) as App;
    assert.bytesEquals(app.appAddress, incomingDriverRegistered.params.driverAddr);
    assert.bigIntEquals(app.lastUpdatedBlockTimestamp, incomingDriverRegistered.block.timestamp);
  });
});
