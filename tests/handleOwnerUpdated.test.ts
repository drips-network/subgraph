import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { RepoAccount } from '../generated/schema';
import { handleOwnerUpdated } from '../src/repoDriverHandlers';
import { createOwnerUpdated } from './helpers/eventCreators';

describe('handleOwnerUpdated', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange

    const repoId = BigInt.fromI32(1);
    const owner = Address.fromString('0x0000000000000000000000000000000000000420');

    const incomingOwnerUpdated = createOwnerUpdated(repoId, owner);

    const id = incomingOwnerUpdated.params.accountId.toString();
    const repoAccountBefore = new RepoAccount(id);
    repoAccountBefore.name = 'test';
    repoAccountBefore.forge = BigInt.fromI32(0);
    repoAccountBefore.status = 'OWNER_UPDATE_REQUESTED';
    repoAccountBefore.lastUpdatedBlockTimestamp = BigInt.fromI32(0);

    repoAccountBefore.save();

    // Act
    handleOwnerUpdated(incomingOwnerUpdated);

    // Assert
    const repoAccountAfter = RepoAccount.load(id) as RepoAccount;

    assert.stringEquals(repoAccountAfter.ownerAddress as string, owner.toHexString());
    assert.stringEquals(repoAccountAfter.status as string, 'CLAIMED');
    assert.bigIntEquals(
      repoAccountAfter.lastUpdatedBlockTimestamp,
      incomingOwnerUpdated.block.timestamp
    );
    assert.stringEquals(repoAccountAfter.name, repoAccountBefore.name);
    assert.bigIntEquals(repoAccountAfter.forge, repoAccountBefore.forge);
  });
});
