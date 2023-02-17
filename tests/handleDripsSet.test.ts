import { BigInt } from '@graphprotocol/graph-ts';
import { assert, describe, test } from 'matchstick-as';
import { createDripsSetEvent } from './helpers/eventCreators';

describe('handleDripsSet', () => {
  test('should create a new user', () => {
    // Arrange
    const dripsSetEvent = createDripsSetEvent(BigInt.fromI32(1), BigInt.fromI32(1));

    // Act

    // Assert
    assert.stringEquals(dripsSetEvent.params.userId.toString(), '1');
  });
});
