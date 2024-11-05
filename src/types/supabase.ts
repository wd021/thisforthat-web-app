export interface Profile {
  id: string
  username: string
  bio: string
  profile_pic_url: string
  social_links: JSON
  created_at: string
  updated_at: string
  wallet: string
  banned: boolean
  notif_last_seen: string | null
  tx_last_seen: string | null
}

export type ProfileMinimal = Pick<Profile, 'id' | 'username' | 'profile_pic_url' | 'wallet'>

export interface UserNFT {
  id: string
  user_id: string
  nft_id: string
  nfts: NFT
}

export interface NFT {
  id: string
  name: string
  image: string
  thumbnail: string
  chain_id: number
  collection_contract: string
  collection_name: string
  token_type: string
  token_id: string
  token_uri: string | null
  created_at: string
  updated_at: string
  wallet_address: string
  offers: number // not being used
  is_verified: boolean
  verified_at: string
  user_id: string
  possible_spam?: boolean
  pins: number // not being used
  user_profile: Profile
}

export type NFTUpload = Omit<
  NFT,
  | 'created_at'
  | 'updated_at'
  | 'offers'
  | 'is_verified'
  | 'verified_at'
  | 'user_id'
  | 'pins'
  | 'user_profile'
>

export interface NFTGridItem {
  nft_chain_id: number
  nft_collection_contract: string
  nft_collection_name: string
  nft_created_at: string
  nft_id: string
  nft_name: string
  nft_pins: number // not being used
  nft_image: string
  nft_thumbnail: string
  nft_token_id: string
  nft_token_type: string
  nft_user_id: string
  nft_user_id_profile_pic_url: string
  nft_user_id_username: string
  nft_user_id_wallet: string
  nft_is_verified: boolean
  nft_verified_at: string | null
}

export interface NFTOffers {
  id: string
  nft_id: string
  offer_id: string
  created_at: string
  updated_at: string
  user_offers: OfferFeedItem
}

export interface NFTOfferMetadata {
  id: string
  name: string
  image: string
  chaind_id: number
  collection_contract: string
  token_id: string
  token_type: string
}

export interface OfferFeedItem {
  id: string
  user_id: string
  user_id_counter: string
  offer_user_id: string
  offer: unknown // JSON
  status: 'pending' | 'accepted' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
  user: Profile
  counter_user: Profile
  chain_id: number
  onchain_trade_id: string | null
  onchain_done: boolean
  onchain_tx: string | null
}

export type SimplifiedOfferItem = Pick<OfferFeedItem, 'id' | 'status'>

export interface Activity {
  id: string
  user_id: string
  activity_type: 'message' | 'offer_start' | 'offer_counter' | 'offer_accepted'
  content: string | null
  metadata: unknown // JSON | null
  username: string
  profile_pic_url: string
  created_at: string
}

export interface NFTAsset {
  offer_nft_id: string
  nft_id: string
  name: string
  image: string
  chain_id: number
  collection_name: string
  collection_contract: string
  token_id: string
  token_type: string
  like_count: number
  is_liked_by_user?: boolean
}

export type SimplifiedNFTAsset = Omit<
  NFTAsset,
  'offer_nft_id' | 'chain_id' | 'collection_name' | 'like_count' | 'is_liked_by_user'
>

export interface OfferData {
  offer_id: string
  child_offer_id: string | null
  creator_id: string
  creator_username: string
  creator_profile_pic_url: string
  creator_wallet: string
  counterparty_id: string
  counterparty_username: string
  counterparty_profile_pic_url: string
  counterparty_wallet: string
  status: string
  chain_id: number
  created_at: string
  updated_at: string
  favorite_count: number
  comment_count: number
  favorited_by_user: boolean
  creator_assets: NFTAsset[]
  counterparty_assets: NFTAsset[]
}

export interface TransactionData {
  offer_id: string
  child_offer_id: string | null
  creator_id: string
  creator_username: string
  creator_profile_pic_url: string
  creator_wallet: string
  counterparty_id: string
  counterparty_username: string
  counterparty_profile_pic_url: string
  counterparty_wallet: string
  status: string
  chain_id: number
  created_at: string
  updated_at: string
  onchain_trade_id: string | null
  onchain_tx: string | null
  onchain_done: boolean
  creator_assets: NFTAsset[]
  counterparty_assets: NFTAsset[]
}

export interface OfferMessage {
  id: string
  type: 'user' | 'alert'
  offer_id: string
  user_id: string
  username: string
  profile_pic_url: string
  message: string
  created_at: string
  updated_at: string
}
