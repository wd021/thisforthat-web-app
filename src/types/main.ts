import { Address } from 'viem'

export type GridTabOption = 'home' | 'followers' | 'offers' | 'pinned'
export type UserTabOption = 'nfts' | 'offers' | 'pinned'

type AssetType = 'ERC20' | 'ERC721' | 'ERC1155' | 'CRYPTOPUNK'

export interface Asset {
  collection_contract: string
  token_id: string
  token_type: AssetType
}

export interface User {
  wallet: string
}

export interface OfferInfo {
  user: User
  counter_user: User
  offer: {
    user: Asset[]
    userCounter: Asset[]
  }
}

export interface PreparedAsset {
  token: Address
  tokenId: bigint
  amount: bigint
  assetType: bigint
  recipient: Address
  isDeposited: boolean
}

export const assetTypeMap: Record<AssetType, bigint> = {
  ERC20: 0n,
  ERC721: 1n,
  ERC1155: 2n,
  CRYPTOPUNK: 3n,
}

export interface DepositAsset {
  id: string
  name: string
  image: string
  uploaded: boolean
  collection_contract: string
  token_id: string
  token_type: string
}
