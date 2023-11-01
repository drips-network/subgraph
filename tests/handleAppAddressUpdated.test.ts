import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { App } from '../generated/schema';
import { handleAppAddressUpdated } from '../src/mapping';
import { createDriverAddressUpdated } from './helpers/eventCreators';
import { defaultApp } from './helpers/defaultEntityCreators';

describe('handleAppAddressUpdated', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange

    const driverId = BigInt.fromI32(1);
    const oldDriverAddr = Address.fromString('0x0000000000000000000000000000000000000420');
    const newDriverAddr = Address.fromString('0x0000000000000000000000000000000000000421');

    const incomingDriverAddressUpdated = createDriverAddressUpdated(
      driverId,
      oldDriverAddr,
      newDriverAddr
    );

    const appId = incomingDriverAddressUpdated.params.driverId.toString();

    let app = defaultApp(appId);
    app.save();

    // Act
    handleAppAddressUpdated(incomingDriverAddressUpdated);

    // Assert
    app = App.load(appId) as App;
    assert.bytesEquals(app.appAddress, incomingDriverAddressUpdated.params.newDriverAddr);
    assert.bigIntEquals(
      app.lastUpdatedBlockTimestamp,
      incomingDriverAddressUpdated.block.timestamp
    );
  });
});
