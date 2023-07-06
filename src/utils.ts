import { Address, BigInt, ByteArray } from '@graphprotocol/graph-ts';

// TODO: this is a temporary solution. We should return the real address instead of an assetId.
// eslint-disable-next-line @typescript-eslint/ban-types
export function erc20TokenToAssetId(erc20Token: Address): BigInt {
  // Create a new empty ByteArray
  const byteArray = new ByteArray(20);
  // Fill the byteArray with the reversed erc20Token bytes
  for (let i = 0; i < 20; i++) {
    byteArray[19 - i] = erc20Token[i];
  }
  // Convert reversed ByteArray to BigInt
  const assetId = BigInt.fromUnsignedBytes(byteArray);

  return assetId;
}
