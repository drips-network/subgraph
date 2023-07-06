import { BigInt } from '@graphprotocol/graph-ts';
import { OwnerUpdateRequested, OwnerUpdated } from '../generated/RepoDriver/RepoDriver';
import { RepoAccount } from '../generated/schema';

export function handleOwnerUpdateRequested(event: OwnerUpdateRequested): void {
  const forge = event.params.forge;
  const name = event.params.name.toString();
  const id = event.params.accountId.toString();

  let repoAccount = RepoAccount.load(id);
  if (!repoAccount) {
    repoAccount = new RepoAccount(id);
  }

  // ownerAddress is not updated in this event. It will be set in the related upcoming `OwnerUpdated` event.

  repoAccount.name = name;
  repoAccount.forge = BigInt.fromI32(forge);
  repoAccount.status = 'OWNER_UPDATE_REQUESTED';
  repoAccount.lastUpdatedBlockTimestamp = event.block.timestamp;

  repoAccount.save();
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
  const owner = event.params.owner.toHexString();
  const id = event.params.accountId.toString();

  const repoAccount = RepoAccount.load(id);
  if (!repoAccount) {
    throw new Error(
      `RepoAccount with id ${id} does not exist. This should never happen, as a 'OwnerUpdateRequested' event should always be emitted first.`
    );
  }

  // `name` and `forge` are not updated in this event. They are set in the preceding `OwnerUpdateRequested` event.

  repoAccount.ownerAddress = owner;
  repoAccount.status = 'CLAIMED';
  repoAccount.lastUpdatedBlockTimestamp = event.block.timestamp;

  repoAccount.save();
}
