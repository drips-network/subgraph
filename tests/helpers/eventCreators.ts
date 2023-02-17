/* eslint-disable @typescript-eslint/ban-types */
import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as/assembly/index';
import { DripsSet } from '../../generated/DripsHub/DripsHub';

export function createDripsSetEvent(id: BigInt, assetId: BigInt): DripsSet {
  const dripsSetEvent = changetype<DripsSet>(newMockEvent());

  dripsSetEvent.parameters = [];

  const idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id));
  const assetIdParam = new ethereum.EventParam(
    'assetId',
    ethereum.Value.fromUnsignedBigInt(assetId)
  );

  dripsSetEvent.parameters.push(idParam);
  dripsSetEvent.parameters.push(assetIdParam);

  return dripsSetEvent;
}
