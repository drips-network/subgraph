import { BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { RepoAccount } from '../generated/schema';
import { handleRepoOwnerUpdateRequested } from '../src/repoDriverHandlers';
import { createRepoOwnerUpdateRequested } from './helpers/eventCreators';

describe('handleRepoOwnerUpdateRequested', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange

    const repoId = BigInt.fromI32(1);
    const forge = BigInt.fromI32(0);
    const name = 'test';

    const incomingRepoOwnerUpdateRequested = createRepoOwnerUpdateRequested(repoId, forge, name);

    // Act
    handleRepoOwnerUpdateRequested(incomingRepoOwnerUpdateRequested);

    // Assert
    const repoAccountId = incomingRepoOwnerUpdateRequested.params.repoId.toString();
    const repoAccount = RepoAccount.load(repoAccountId) as RepoAccount;

    assert.stringEquals(repoAccount.ownerAddress, '');
    assert.stringEquals(repoAccount.name, incomingRepoOwnerUpdateRequested.params.name.toString());
    assert.stringEquals(repoAccount.status, 'OWNER_UPDATE_REQUESTED');
    assert.bigIntEquals(
      repoAccount.lastUpdatedBlockTimestamp,
      incomingRepoOwnerUpdateRequested.block.timestamp
    );
    assert.bigIntEquals(
      repoAccount.forge,
      BigInt.fromI32(incomingRepoOwnerUpdateRequested.params.forge)
    );
  });
});
