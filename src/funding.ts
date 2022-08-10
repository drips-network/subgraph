import { DripsToken, NewType, NewStreamingToken, NewToken, Transfer, NewContractURI} from "../generated/RadicleRegistry/DripsToken";
import { FundingProject, TokenType, Token } from "../generated/schema";
import { Address, store, crypto } from "@graphprotocol/graph-ts";
import { BigInt } from "@graphprotocol/graph-ts"
import { concat } from "@graphprotocol/graph-ts/helper-functions";

export function handleNewType(event: NewType): void {
  let tokenType = new TokenType(event.address.toHex() + "-" + event.params.nftType.toString())

  tokenType.tokenRegistryAddress = event.address
  tokenType.tokenTypeId = event.params.nftType
  tokenType.limit = event.params.limit
  tokenType.minAmtPerSec = event.params.minAmt
  tokenType.streaming = event.params.streaming
  tokenType.fundingProject = event.address.toHex()
  tokenType.ipfsHash = event.params.ipfsHash
  tokenType.currentTotalAmtPerSec = new BigInt(0)
  tokenType.currentTotalGiven = new BigInt(0)

  tokenType.save()
}

export function handleNewStreamingToken(event: NewStreamingToken): void {
  let token = new Token(event.params.tokenId.toHex() + event.address.toHex())

  token.tokenId = event.params.tokenId
  token.tokenRegistryAddress = event.address
  token.tokenType = event.address.toHex() + "-" + event.params.typeId.toString()
  token.tokenReceiver = event.params.receiver
  token.amtPerSec = event.params.amtPerSec
  token.fundingProject = event.address.toHex()

  token.save()

  // Now we need to add the amtPerSec to the currentTotalAmtPerSec on the TokenType
  let tokenType = TokenType.load(token.tokenType)
  if (!tokenType) {
    return
  }
  tokenType.currentTotalAmtPerSec = tokenType.currentTotalAmtPerSec.plus(token.amtPerSec)
  tokenType.save()
}

export function handleNewToken(event: NewToken): void {
  let token = new Token(event.params.tokenId.toHex() + event.address.toHex())

  token.tokenId = event.params.tokenId
  token.tokenRegistryAddress = event.address
  token.tokenType = event.address.toHex() + "-" + event.params.typeId.toString()
  token.tokenReceiver = event.params.receiver
  token.giveAmt = event.params.giveAmt
  token.fundingProject = event.address.toHex()

  token.save()

  // Now we need to add the amtPerSec to the currentTotalAmtPerSec on the TokenType
  let tokenType = TokenType.load(token.tokenType)
  if (!tokenType) {
    return
  }
  tokenType.currentTotalGiven = tokenType.currentTotalGiven.plus(token.giveAmt)
  tokenType.save()
}

export function handleTransfer(event: Transfer): void {
  let token = Token.load(event.params.tokenId.toHex() + event.address.toHex())

  if (!token) {
    return
  }

  token.tokenReceiver = event.params.to
  
  token.save()
}

export function handleNewContractURI(event: NewContractURI): void {

  let fundingProject = FundingProject.load(event.address.toHex())

  if (!fundingProject) {
    return
  }

  fundingProject.ipfsHash = event.params.contractURI

  fundingProject.save()
}
