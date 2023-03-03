/* eslint-disable @typescript-eslint/ban-types */
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as/assembly/index';
import {
  DripsReceiverSeen,
  DripsSet,
  DriverAddressUpdated,
  DriverRegistered,
  Given,
  ReceivedDrips,
  Split,
  SplitsReceiverSeen,
  SplitsSet,
  SqueezedDrips
} from '../../generated/DripsHub/DripsHub';
import { CreatedSplits } from '../../generated/ImmutableSplitsDriver/ImmutableSplitsDriver';
import { Transfer } from '../../generated/NFTDriver/NFTDriver';

export function createDripsSetEvent(
  userId: BigInt,
  assetId: BigInt,
  receiversHash: Bytes,
  dripsHistoryHash: Bytes,
  balance: BigInt,
  maxEnd: BigInt
): DripsSet {
  const dripsSetEvent = changetype<DripsSet>(newMockEvent()) as DripsSet;

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
  const dripsSetEvent = changetype<DripsReceiverSeen>(newMockEvent()) as DripsReceiverSeen;

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
  const createdSplitsEvent = changetype<CreatedSplits>(newMockEvent()) as CreatedSplits;

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

export function createTransfer(from: Address, to: Address, tokenId: BigInt): Transfer {
  const createdSplitsEvent = changetype<Transfer>(newMockEvent()) as Transfer;

  createdSplitsEvent.parameters = [];

  const fromParam = new ethereum.EventParam('from', ethereum.Value.fromAddress(from));
  const toParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(to));
  const tokenIdParam = new ethereum.EventParam(
    'tokenId',
    ethereum.Value.fromUnsignedBigInt(tokenId)
  );

  createdSplitsEvent.parameters.push(fromParam);
  createdSplitsEvent.parameters.push(toParam);
  createdSplitsEvent.parameters.push(tokenIdParam);

  return createdSplitsEvent;
}

export function createDriverAddressUpdated(
  driverId: BigInt,
  oldDriverAddr: Address,
  newDriverAddr: Address
): DriverAddressUpdated {
  const createdSplitsEvent = changetype<DriverAddressUpdated>(
    newMockEvent()
  ) as DriverAddressUpdated;

  createdSplitsEvent.parameters = [];

  const driverIdParam = new ethereum.EventParam(
    'driverId',
    ethereum.Value.fromUnsignedBigInt(driverId)
  );
  const oldDriverAddrParam = new ethereum.EventParam(
    'oldDriverAddr',
    ethereum.Value.fromAddress(oldDriverAddr)
  );
  const newDriverAddrParam = new ethereum.EventParam(
    'newDriverAddrParam',
    ethereum.Value.fromAddress(newDriverAddr)
  );

  createdSplitsEvent.parameters.push(driverIdParam);
  createdSplitsEvent.parameters.push(oldDriverAddrParam);
  createdSplitsEvent.parameters.push(newDriverAddrParam);

  return createdSplitsEvent;
}

export function createDriverRegistered(driverId: BigInt, driverAddr: Address): DriverRegistered {
  const createdSplitsEvent = changetype<DriverRegistered>(newMockEvent()) as DriverRegistered;

  createdSplitsEvent.parameters = [];

  const driverIdParam = new ethereum.EventParam(
    'driverId',
    ethereum.Value.fromUnsignedBigInt(driverId)
  );
  const driverAddrParam = new ethereum.EventParam(
    'driverAddr',
    ethereum.Value.fromAddress(driverAddr)
  );

  createdSplitsEvent.parameters.push(driverIdParam);
  createdSplitsEvent.parameters.push(driverAddrParam);

  return createdSplitsEvent;
}

export function createGiven(userId: BigInt, receiver: BigInt, assetId: BigInt, amt: BigInt): Given {
  const givenEvent = changetype<Given>(newMockEvent()) as Given;

  givenEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const receiverParam = new ethereum.EventParam(
    'receiver',
    ethereum.Value.fromUnsignedBigInt(receiver)
  );
  const assetIdParam = new ethereum.EventParam(
    'assetId',
    ethereum.Value.fromUnsignedBigInt(assetId)
  );
  const amtParam = new ethereum.EventParam('amt', ethereum.Value.fromUnsignedBigInt(amt));

  givenEvent.parameters.push(userIdParam);
  givenEvent.parameters.push(receiverParam);
  givenEvent.parameters.push(assetIdParam);
  givenEvent.parameters.push(amtParam);

  return givenEvent;
}

export function createSplit(userId: BigInt, receiver: BigInt, assetId: BigInt, amt: BigInt): Split {
  const givenEvent = changetype<Split>(newMockEvent()) as Split;

  givenEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const receiverParam = new ethereum.EventParam(
    'receiver',
    ethereum.Value.fromUnsignedBigInt(receiver)
  );
  const assetIdParam = new ethereum.EventParam(
    'assetId',
    ethereum.Value.fromUnsignedBigInt(assetId)
  );
  const amtParam = new ethereum.EventParam('amt', ethereum.Value.fromUnsignedBigInt(amt));

  givenEvent.parameters.push(userIdParam);
  givenEvent.parameters.push(receiverParam);
  givenEvent.parameters.push(assetIdParam);
  givenEvent.parameters.push(amtParam);

  return givenEvent;
}

export function createSplitsReceiverSeen(
  receiversHash: Bytes,
  userId: BigInt,
  weight: BigInt
): SplitsReceiverSeen {
  const givenEvent = changetype<SplitsReceiverSeen>(newMockEvent()) as SplitsReceiverSeen;

  givenEvent.parameters = [];

  const receiversHashParam = new ethereum.EventParam(
    'receiversHash',
    ethereum.Value.fromBytes(receiversHash)
  );
  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const weightParam = new ethereum.EventParam('weight', ethereum.Value.fromUnsignedBigInt(weight));

  givenEvent.parameters.push(receiversHashParam);
  givenEvent.parameters.push(userIdParam);
  givenEvent.parameters.push(weightParam);

  return givenEvent;
}

export function createSplitsSet(userId: BigInt, receiversHash: Bytes): SplitsSet {
  const givenEvent = changetype<SplitsSet>(newMockEvent()) as SplitsSet;

  givenEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const receiversHashParam = new ethereum.EventParam(
    'receiversHash',
    ethereum.Value.fromBytes(receiversHash)
  );

  givenEvent.parameters.push(userIdParam);
  givenEvent.parameters.push(receiversHashParam);

  return givenEvent;
}

export function createReceivedDrips(
  userId: BigInt,
  assetId: BigInt,
  amt: BigInt,
  receivableCycles: BigInt
): ReceivedDrips {
  const givenEvent = changetype<ReceivedDrips>(newMockEvent()) as ReceivedDrips;

  givenEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const assetIdParam = new ethereum.EventParam(
    'assetId',
    ethereum.Value.fromUnsignedBigInt(assetId)
  );
  const amtParam = new ethereum.EventParam('amt', ethereum.Value.fromUnsignedBigInt(amt));
  const receivableCyclesParam = new ethereum.EventParam(
    'receivableCycles',
    ethereum.Value.fromUnsignedBigInt(receivableCycles)
  );

  givenEvent.parameters.push(userIdParam);
  givenEvent.parameters.push(assetIdParam);
  givenEvent.parameters.push(amtParam);
  givenEvent.parameters.push(receivableCyclesParam);

  return givenEvent;
}

export function createSqueezedDrips(
  userId: BigInt,
  assetId: BigInt,
  senderId: BigInt,
  amt: BigInt,
  dripsHistoryHashes: Array<Bytes>
): SqueezedDrips {
  const givenEvent = changetype<SqueezedDrips>(newMockEvent()) as SqueezedDrips;

  givenEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const assetIdParam = new ethereum.EventParam(
    'assetId',
    ethereum.Value.fromUnsignedBigInt(assetId)
  );
  const senderIdParam = new ethereum.EventParam(
    'senderId',
    ethereum.Value.fromUnsignedBigInt(senderId)
  );
  const amtParam = new ethereum.EventParam('amt', ethereum.Value.fromUnsignedBigInt(amt));
  const dripsHistoryHashesParam = new ethereum.EventParam(
    'dripsHistoryHashes',
    ethereum.Value.fromBytesArray(dripsHistoryHashes)
  );

  givenEvent.parameters.push(userIdParam);
  givenEvent.parameters.push(assetIdParam);
  givenEvent.parameters.push(senderIdParam);
  givenEvent.parameters.push(amtParam);
  givenEvent.parameters.push(dripsHistoryHashesParam);

  return givenEvent;
}
