import { Address, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { NFTSubAccount } from '../generated/schema';
import { handleNFTSubAccountTransfer } from '../src/mapping';
import { createTransfer } from './helpers/eventCreators';

describe('handleNFTSubAccountTransfer', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const from = Address.fromString('0x0000000000000000000000000000000000000420');
    const to = Address.fromString('0x0000000000000000000000000000000000000421');
    const tokenId = BigInt.fromI32(1);

    const incomingTransfer = createTransfer(from, to, tokenId);

    // Act
    handleNFTSubAccountTransfer(incomingTransfer);

    // Assert
    const id = incomingTransfer.params.tokenId.toString();
    const nftSubAccount = NFTSubAccount.load(id) as NFTSubAccount;
    assert.bytesEquals(nftSubAccount.ownerAddress, incomingTransfer.params.to);
  });
});
