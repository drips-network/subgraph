/* eslint-disable @typescript-eslint/ban-types */
import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as/assembly/index';
import { DripsSet } from '../../generated/DripsHub/DripsHub';

export function createDripsSetEvent(
  userId: BigInt,
  assetId: BigInt,
  receiversHash: Bytes,
  dripsHistoryHash: Bytes,
  balance: BigInt,
  maxEnd: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes
): DripsSet {
  const dripsSetEvent = changetype<DripsSet>(newMockEvent());

  dripsSetEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(userId));
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

  dripsSetEvent.block.timestamp = blockTimestamp;
  dripsSetEvent.transaction.hash = transactionHash;

  return dripsSetEvent;
}
