import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { RepoAccount } from '../generated/schema';
import { handleRepoOwnerUpdated } from '../src/repoDriverHandlers';
import { createRepoOwnerUpdated } from './helpers/eventCreators';

describe('handleRepoOwnerUpdated', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange

    const repoId = BigInt.fromI32(1);
    const owner = Address.fromString('0x0000000000000000000000000000000000000420');

    const incomingRepoOwnerUpdated = createRepoOwnerUpdated(repoId, owner);

    const repoAccountId = incomingRepoOwnerUpdated.params.repoId.toString();
    const repoAccountBefore = new RepoAccount(repoAccountId);
    repoAccountBefore.name = 'test';
    repoAccountBefore.ownerAddress = '';
    repoAccountBefore.forge = BigInt.fromI32(0);
    repoAccountBefore.status = 'OWNER_UPDATE_REQUESTED';
    repoAccountBefore.lastUpdatedBlockTimestamp = BigInt.fromI32(0);

    repoAccountBefore.save();

    // Act
    handleRepoOwnerUpdated(incomingRepoOwnerUpdated);

    // Assert
    const repoAccountAfter = RepoAccount.load(repoAccountId) as RepoAccount;

    assert.stringEquals(repoAccountAfter.ownerAddress, owner.toHexString());
    assert.stringEquals(repoAccountAfter.status, 'CLAIMED');
    assert.bigIntEquals(
      repoAccountAfter.lastUpdatedBlockTimestamp,
      incomingRepoOwnerUpdated.block.timestamp
    );
    assert.stringEquals(repoAccountAfter.name, repoAccountBefore.name);
    assert.bigIntEquals(repoAccountAfter.forge, repoAccountBefore.forge);
  });
});
