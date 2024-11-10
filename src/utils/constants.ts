import { anvil, arbitrum, base, mainnet, optimism, polygon } from 'wagmi/chains'

export const supportedChains: readonly [
  typeof mainnet,
  typeof base,
  typeof arbitrum,
  typeof optimism,
  typeof polygon,
  typeof anvil,
] = [mainnet, base, arbitrum, optimism, polygon, anvil]

export const chainInfoMap: {
  [key: string]: {
    id: string
    name: string
    openSeaSlug: string
    blockExplorerUrl: string
  }
} = {
  '1': {
    id: '1',
    name: 'Ethereum',
    openSeaSlug: 'ethereum',
    blockExplorerUrl: 'https://etherscan.io',
  },
  '8453': {
    id: '8453',
    name: 'Base',
    openSeaSlug: 'base',
    blockExplorerUrl: 'https://basescan.org',
  },
  '42161': {
    id: '42161',
    name: 'Arbitrum',
    openSeaSlug: 'arbitrum',
    blockExplorerUrl: 'https://arbiscan.io',
  },
  '10': {
    id: '10',
    name: 'Optimism',
    openSeaSlug: 'optimism',
    blockExplorerUrl: 'https://optimistic.etherscan.io',
  },
  '137': {
    id: '137',
    name: 'Polygon',
    openSeaSlug: 'matic',
    blockExplorerUrl: 'https://polygonscan.com',
  },
}

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

export const SUPPORTED_CHAINS = ['ethereum', 'base', 'arbitrum', 'optimism', 'polygon']

export const CHAIN_LABELS = {
  ethereum: 'Ethereum',
  base: 'Base',
  polygon: 'Polygon',
  optimism: 'Optimism',
  arbitrum: 'Arbitrum',
}

export const CHAIN_SLUGS_TO_CHAIN_IDS = {
  ethereum: 1,
  eth: 1,
  base: 8453,
  arbitrum: 42161,
  optimism: 10,
  polygon: 137,
  matic: 137,
}

export const CHAIN_IDS_TO_CHAINS = {
  1: 'Ethereum',
  8453: 'Base',
  42161: 'Arbitrum',
  10: 'Optimism',
  137: 'Polygon',
}

export const ALCHEMY_CHAIN_SLUGS = {
  ethereum: 'eth-mainnet',
  eth: 'eth-mainnet',
  base: 'base-mainnet',
  arbitrum: 'arb-mainnet',
  optimism: 'opt-mainnet',
  polygon: 'polygon-mainnet',
  matic: 'polygon-mainnet',
}

export const ALCHEMY_CHAIN_ID_SLUGS = {
  1: 'eth-mainnet',
  8453: 'base-mainnet',
  42161: 'arb-mainnet',
  10: 'opt-mainnet',
  137: 'polygon-mainnet',
}

export const NFT_VERIFY_LIMIT = 40
export const PUNK_VERIFY_LIMIT = 10
export const MAX_NFTS_PER_SWAP = 9
export const GRID_ITEMS_PER_PAGE = 25
export const FEED_ITEMS_PER_PAGE = 10
export const MAX_IMAGE_UPLOAD_SIZE = 3 * 1024 * 1024 // 3mb max upload size

export const DISCORD_LINK = 'https://discord.gg/qg6TeBuHeT'
export const GITHUB_LINK = 'https://github.com/thisforthatapp/contracts'
