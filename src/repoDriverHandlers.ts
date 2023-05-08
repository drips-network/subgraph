import { BigInt } from '@graphprotocol/graph-ts';
import { RepoOwnerUpdateRequested, RepoOwnerUpdated } from '../generated/RepoDriver/RepoDriver';
import { RepoAccount } from '../generated/schema';

export function handleRepoOwnerUpdateRequested(event: RepoOwnerUpdateRequested): void {
  const forge = event.params.forge;
  const name = event.params.name.toString();
  const repoId = event.params.repoId.toString();

  let repoAccount = RepoAccount.load(repoId);
  if (!repoAccount) {
    repoAccount = new RepoAccount(repoId);
  }

  // ownerAddress is not updated in this event. It will be set in the related upcoming `RepoOwnerUpdated` event.
  repoAccount.ownerAddress = '';

  repoAccount.name = name;
  repoAccount.forge = BigInt.fromI32(forge);
  repoAccount.status = 'OWNER_UPDATE_REQUESTED';
  repoAccount.lastUpdatedBlockTimestamp = event.block.timestamp;

  repoAccount.save();
}

export function handleRepoOwnerUpdated(event: RepoOwnerUpdated): void {
  const owner = event.params.owner.toHexString();
  const repoId = event.params.repoId.toString();

  const repoAccount = RepoAccount.load(repoId);
  if (!repoAccount) {
    throw new Error(
      `RepoAccount with id ${repoId} does not exist. This should never happen, as a 'RepoOwnerUpdateRequested' event should always be emitted first.`
    );
  }

  // `name` and `forge` are not updated in this event. They are set in the preceding `RepoOwnerUpdateRequested` event.
  repoAccount.ownerAddress = owner;
  repoAccount.status = 'CLAIMED';
  repoAccount.lastUpdatedBlockTimestamp = event.block.timestamp;

  repoAccount.save();
}
