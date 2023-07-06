import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts';
import { assert, clearStore, describe, test, beforeEach } from 'matchstick-as';
import { AccountMetadataByKey, AccountMetadataEvent } from '../generated/schema';
import { handleAccountMetadata } from '../src/mapping';
import { createAccountMetadataEmitted } from './helpers/eventCreators';
import { erc20TokenToAssetId } from '../src/utils';

describe('utils', () => {
  beforeEach(() => {
    clearStore();
  });

  test('should create entities as expected when mapping', () => {
    // Arrange
    const accountId = BigInt.fromI32(1);
    const key = Bytes.fromUTF8('0x000000');
    const value = Bytes.fromUTF8('0x111111');

    // Act
    const assetId = erc20TokenToAssetId(
      Address.fromString('0xaFF4481D10270F50f203E0763e2597776068CBc5')
    );
    log.info('assetId: {}', [assetId.toString()]);
  });
});
