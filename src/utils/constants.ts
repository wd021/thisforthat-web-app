export const BLOCKED_USERNAMES = [
  'about',
  'account',
  'api',
  'contact',
  'legal',
  'nft',
  'offer',
  'notifications',
  'search',
]

export const SUPPORTED_CHAINS = [
  'ethereum',
  'base',
  'arbitrum',
  'optimism',
  'polygon',
  'zksync',
]

export const CHAIN_LABELS = {
  ethereum: 'Ethereum',
  base: 'Base',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  polygon: 'Polygon',
  zksync: 'ZkSync',
}

export const CHAIN_SLUGS_TO_CHAIN_IDS = {
  ethereum: 1,
  base: 8453,
  arbitrum: 42161,
  optimism: 10,
  polygon: 137,
  zksync: 324,
}

export const CHAIN_IDS_TO_CHAINS = {
  1: 'Ethereum',
  8453: 'Base',
  42161: 'Arbitrum',
  10: 'Optimism',
  137: 'Polygon',
  324: 'Zksync',
}

export const ALCHEMY_CHAIN_SLUGS = {
  ethereum: 'eth-mainnet',
  base: 'base-mainnet',
  arbitrum: 'arb-mainnet',
  optimism: 'opt-mainnet',
  polygon: 'polygon-mainnet',
  zksync: 'zksync-mainnet',
}

export const ALCHEMY_CHAIN_ID_SLUGS = {
  1: 'eth-mainnet',
  8453: 'base-mainnet',
  42161: 'arb-mainnet',
  10: 'opt-mainnet',
  137: 'polygon-mainnet',
  324: 'zksync-mainnet',
}

export const NFT_VERIFY_LIMIT = 50
export const MAX_NFTS_PER_SWAP = 9
export const GRID_ITEMS_PER_PAGE = 25
export const FEED_ITEMS_PER_PAGE = 10
export const MAX_IMAGE_UPLOAD_SIZE = 3 * 1024 * 1024 // 3mb max upload size
