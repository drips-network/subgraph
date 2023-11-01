import { BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { RepoAccount } from '../generated/schema';
import { handleOwnerUpdateRequested } from '../src/repoDriverHandlers';
import { createOwnerUpdateRequested } from './helpers/eventCreators';

describe('handleOwnerUpdateRequested', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange

    const repoId = BigInt.fromI32(1);
    const forge = BigInt.fromI32(0);
    const name = 'test';

    const incomingOwnerUpdateRequested = createOwnerUpdateRequested(repoId, forge, name);

    // Act
    handleOwnerUpdateRequested(incomingOwnerUpdateRequested);

    // Assert
    const id = incomingOwnerUpdateRequested.params.accountId.toString();
    const repoAccount = RepoAccount.load(id) as RepoAccount;

    assert.assertNull(repoAccount.ownerAddress);
    assert.stringEquals(repoAccount.name, incomingOwnerUpdateRequested.params.name.toString());
    assert.stringEquals(repoAccount.status as string, 'OWNER_UPDATE_REQUESTED');
    assert.bigIntEquals(
      repoAccount.lastUpdatedBlockTimestamp,
      incomingOwnerUpdateRequested.block.timestamp
    );
    assert.bigIntEquals(
      repoAccount.forge,
      BigInt.fromI32(incomingOwnerUpdateRequested.params.forge)
    );
  });
});
