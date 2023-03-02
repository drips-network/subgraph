/* eslint-disable @typescript-eslint/ban-types */
import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as/assembly/index';
import { DripsReceiverSeen, DripsSet } from '../../generated/DripsHub/DripsHub';
import { CreatedSplits } from '../../generated/ImmutableSplitsDriver/ImmutableSplitsDriver';

export function createDripsSetEvent(
  userId: BigInt,
  assetId: BigInt,
  receiversHash: Bytes,
  dripsHistoryHash: Bytes,
  balance: BigInt,
  maxEnd: BigInt
): DripsSet {
  const dripsSetEvent = changetype<DripsSet>(newMockEvent());

  dripsSetEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const assetIdParam = new ethereum.EventParam(
    'assetId',
    ethereum.Value.fromUnsignedBigInt(assetId)
  );
  const receiversHashParam = new ethereum.EventParam(
    'receiversHash',
    ethereum.Value.fromBytes(receiversHash)
  );
  const dripsHistoryHashParam = new ethereum.EventParam(
    'dripsHistoryHash',
    ethereum.Value.fromBytes(dripsHistoryHash)
  );
  const balanceParam = new ethereum.EventParam(
    'balance',
    ethereum.Value.fromUnsignedBigInt(balance)
  );
  const maxEndParam = new ethereum.EventParam('maxEnd', ethereum.Value.fromUnsignedBigInt(maxEnd));

  dripsSetEvent.parameters.push(userIdParam);
  dripsSetEvent.parameters.push(assetIdParam);
  dripsSetEvent.parameters.push(receiversHashParam);
  dripsSetEvent.parameters.push(dripsHistoryHashParam);
  dripsSetEvent.parameters.push(balanceParam);
  dripsSetEvent.parameters.push(maxEndParam);

  return dripsSetEvent;
}

export function createDripsReceiverSeen(
  receiversHash: Bytes,
  userId: BigInt,
  config: BigInt
): DripsReceiverSeen {
  const dripsSetEvent = changetype<DripsReceiverSeen>(newMockEvent());

  dripsSetEvent.parameters = [];

  const userIdParam = new ethereum.EventParam(
    'userIdParam',
    ethereum.Value.fromUnsignedBigInt(userId)
  );
  const configParam = new ethereum.EventParam('config', ethereum.Value.fromUnsignedBigInt(config));
  const receiversHashParam = new ethereum.EventParam(
    'receiversHash',
    ethereum.Value.fromBytes(receiversHash)
  );

  dripsSetEvent.parameters.push(receiversHashParam);
  dripsSetEvent.parameters.push(userIdParam);
  dripsSetEvent.parameters.push(configParam);

  return dripsSetEvent;
}

export function createCreatedSplits(userId: BigInt, receiversHash: string): CreatedSplits {
  const createdSplitsEvent = changetype<CreatedSplits>(newMockEvent());

  createdSplitsEvent.parameters = [];

  const userIdParam = new ethereum.EventParam(
    'userIdParam',
    ethereum.Value.fromUnsignedBigInt(userId)
  );
  const receiversHashParam = new ethereum.EventParam(
    'receiversHash',
    ethereum.Value.fromBytes(Bytes.fromUTF8(receiversHash))
  );

  createdSplitsEvent.parameters.push(userIdParam);
  createdSplitsEvent.parameters.push(receiversHashParam);

  return createdSplitsEvent;
}
