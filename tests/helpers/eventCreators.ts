/* eslint-disable @typescript-eslint/ban-types */
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as/assembly/index';
import {
  Collectable,
  Collected,
  StreamReceiverSeen,
  StreamsSet,
  DriverAddressUpdated,
  DriverRegistered,
  Given,
  ReceivedStreams,
  Split,
  SplitsReceiverSeen,
  SplitsSet,
  SqueezedStreams,
  UserMetadataEmitted
} from '../../generated/Drips/Drips';
import { CreatedSplits } from '../../generated/ImmutableSplitsDriver/ImmutableSplitsDriver';
import { Transfer } from '../../generated/NFTDriver/NFTDriver';
import { OwnerUpdateRequested } from '../../generated/RepoDriver/RepoDriver';
import { OwnerUpdated } from '../../generated/RepoDriver/RepoDriver';

export function createStreamSetEvent(
  userId: BigInt,
  assetId: BigInt,
  receiversHash: Bytes,
  streamHistoryHash: Bytes,
  balance: BigInt,
  maxEnd: BigInt
): StreamsSet {
  const streamSetEvent = changetype<StreamsSet>(newMockEvent()) as StreamsSet;

  streamSetEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const assetIdParam = new ethereum.EventParam(
    'assetId',
    ethereum.Value.fromUnsignedBigInt(assetId)
  );
  const receiversHashParam = new ethereum.EventParam(
    'receiversHash',
    ethereum.Value.fromBytes(receiversHash)
  );
  const streamHistoryHashParam = new ethereum.EventParam(
    'streamHistoryHash',
    ethereum.Value.fromBytes(streamHistoryHash)
  );
  const balanceParam = new ethereum.EventParam(
    'balance',
    ethereum.Value.fromUnsignedBigInt(balance)
  );
  const maxEndParam = new ethereum.EventParam('maxEnd', ethereum.Value.fromUnsignedBigInt(maxEnd));

  streamSetEvent.parameters.push(userIdParam);
  streamSetEvent.parameters.push(assetIdParam);
  streamSetEvent.parameters.push(receiversHashParam);
  streamSetEvent.parameters.push(streamHistoryHashParam);
  streamSetEvent.parameters.push(balanceParam);
  streamSetEvent.parameters.push(maxEndParam);

  return streamSetEvent;
}

export function createStreamsReceiverSeen(
  receiversHash: Bytes,
  userId: BigInt,
  config: BigInt
): StreamReceiverSeen {
  const streamSetEvent = changetype<StreamReceiverSeen>(newMockEvent()) as StreamReceiverSeen;

  streamSetEvent.parameters = [];

  const userIdParam = new ethereum.EventParam(
    'userIdParam',
    ethereum.Value.fromUnsignedBigInt(userId)
  );
  const configParam = new ethereum.EventParam('config', ethereum.Value.fromUnsignedBigInt(config));
  const receiversHashParam = new ethereum.EventParam(
    'receiversHash',
    ethereum.Value.fromBytes(receiversHash)
  );

  streamSetEvent.parameters.push(receiversHashParam);
  streamSetEvent.parameters.push(userIdParam);
  streamSetEvent.parameters.push(configParam);

  return streamSetEvent;
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

export function createOwnerUpdateRequested(
  repoId: BigInt,
  forge: BigInt,
  name: string
): OwnerUpdateRequested {
  const OwnerUpdateRequestedEvent = changetype<OwnerUpdateRequested>(
    newMockEvent()
  ) as OwnerUpdateRequested;

  OwnerUpdateRequestedEvent.parameters = [];

  const repoIdParam = new ethereum.EventParam('repoId', ethereum.Value.fromUnsignedBigInt(repoId));
  const forgeParam = new ethereum.EventParam('forge', ethereum.Value.fromUnsignedBigInt(forge));
  const nameParam = new ethereum.EventParam(
    'forge',
    ethereum.Value.fromBytes(Bytes.fromUTF8(name))
  );

  OwnerUpdateRequestedEvent.parameters.push(repoIdParam);
  OwnerUpdateRequestedEvent.parameters.push(forgeParam);
  OwnerUpdateRequestedEvent.parameters.push(nameParam);

  return OwnerUpdateRequestedEvent;
}

export function createOwnerUpdated(repoId: BigInt, owner: Address): OwnerUpdated {
  const OwnerUpdatedEvent = changetype<OwnerUpdated>(newMockEvent()) as OwnerUpdated;

  OwnerUpdatedEvent.parameters = [];

  const ownerParam = new ethereum.EventParam('repoId', ethereum.Value.fromUnsignedBigInt(repoId));
  const nameParam = new ethereum.EventParam('forge', ethereum.Value.fromAddress(owner));

  OwnerUpdatedEvent.parameters.push(ownerParam);
  OwnerUpdatedEvent.parameters.push(nameParam);

  return OwnerUpdatedEvent;
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

export function createReceivedStreams(
  userId: BigInt,
  assetId: BigInt,
  amt: BigInt,
  receivableCycles: BigInt
): ReceivedStreams {
  const givenEvent = changetype<ReceivedStreams>(newMockEvent()) as ReceivedStreams;

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

export function createSqueezedStreams(
  userId: BigInt,
  assetId: BigInt,
  senderId: BigInt,
  amt: BigInt,
  streamsHistoryHashes: Array<Bytes>
): SqueezedStreams {
  const givenEvent = changetype<SqueezedStreams>(newMockEvent()) as SqueezedStreams;

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
  const streamsHistoryHashesParam = new ethereum.EventParam(
    'streamsHistoryHashes',
    ethereum.Value.fromBytesArray(streamsHistoryHashes)
  );

  givenEvent.parameters.push(userIdParam);
  givenEvent.parameters.push(assetIdParam);
  givenEvent.parameters.push(senderIdParam);
  givenEvent.parameters.push(amtParam);
  givenEvent.parameters.push(streamsHistoryHashesParam);

  return givenEvent;
}

export function createCollected(userId: BigInt, assetId: BigInt, collected: BigInt): Collected {
  const givenEvent = changetype<Collected>(newMockEvent()) as Collected;

  givenEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const assetIdParam = new ethereum.EventParam(
    'assetId',
    ethereum.Value.fromUnsignedBigInt(assetId)
  );
  const collectedParam = new ethereum.EventParam(
    'collected',
    ethereum.Value.fromUnsignedBigInt(collected)
  );

  givenEvent.parameters.push(userIdParam);
  givenEvent.parameters.push(assetIdParam);
  givenEvent.parameters.push(collectedParam);

  return givenEvent;
}

export function createCollectable(userId: BigInt, assetId: BigInt, amt: BigInt): Collectable {
  const givenEvent = changetype<Collectable>(newMockEvent()) as Collectable;

  givenEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const assetIdParam = new ethereum.EventParam(
    'assetId',
    ethereum.Value.fromUnsignedBigInt(assetId)
  );
  const amtParam = new ethereum.EventParam('amt', ethereum.Value.fromUnsignedBigInt(amt));

  givenEvent.parameters.push(userIdParam);
  givenEvent.parameters.push(assetIdParam);
  givenEvent.parameters.push(amtParam);

  return givenEvent;
}

export function createUserMetadataEmitted(
  userId: BigInt,
  key: Bytes,
  value: Bytes
): UserMetadataEmitted {
  const givenEvent = changetype<UserMetadataEmitted>(newMockEvent()) as UserMetadataEmitted;

  givenEvent.parameters = [];

  const userIdParam = new ethereum.EventParam('userId', ethereum.Value.fromUnsignedBigInt(userId));
  const keyParam = new ethereum.EventParam('key', ethereum.Value.fromBytes(key));
  const valueParam = new ethereum.EventParam('value', ethereum.Value.fromBytes(value));

  givenEvent.parameters.push(userIdParam);
  givenEvent.parameters.push(keyParam);
  givenEvent.parameters.push(valueParam);

  return givenEvent;
}
