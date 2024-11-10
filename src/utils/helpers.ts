import { arbitrum, base, mainnet, optimism, polygon, zksync } from 'viem/chains'

import { Asset, assetTypeMap, OfferInfo, PreparedAsset } from '@/types/main'

import { chainInfoMap, supportedChains } from './constants'

export async function uploadFile(
  formData: FormData,
  token: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const file = formData.get('file') as File

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ fileType: file.type }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error ${response.status}: ${errorText}`)
    }

    const { url, key } = await response.json()

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file')
    }

    return { key }
  } catch {
    return null
  }
}

export async function verifyNFTs(
  address: string,
  chain: string,
  signature: string,
  nftIds: string[],
  token: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify({ address, chain, signature, nftIds }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()

      if (errorText === 'Verification failed') {
        return {
          error: errorText,
          validVerifications: 0,
        }
      }
    }

    const { validVerifications } = await response.json()

    return { error: null, validVerifications }
  } catch (error) {
    return {
      error,
      validVerifications: 0,
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function completeTradeWithApi(offer_id: string, token: string): Promise<any> {
  try {
    const response = await fetch('/api/complete-trade', {
      method: 'POST',
      body: JSON.stringify({ offer_id: offer_id }),

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error ${response.status}: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    return {
      error,
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTokenIdRecipientMapping(tradeAssets: any[]): Record<string, string> {
  return tradeAssets.reduce(
    (mapping, asset) => {
      const { token, recipient, tokenId } = asset
      const key = `${token}_${tokenId.toString()}`.toLowerCase()
      mapping[key] = recipient
      return mapping
    },
    {} as Record<string, string>,
  )
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

export function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'

  return Math.floor(seconds) + ' seconds ago'
}

export function timeAgoShort(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + 'y'

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + 'mo'

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + 'd'

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + 'h'

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + 'm'

  return Math.floor(seconds) + 's'
}

export const getChainInfo = (
  chainId: string,
): {
  id: string
  name: string
  openSeaSlug: string
  blockExplorerUrl: string
} => {
  const chain = chainInfoMap[chainId]
  if (!chain) {
    console.warn(`Chain ID ${chainId} not found, defaulting to Ethereum`)
    return chainInfoMap['1']
  }
  return chain
}

export const getOpenSeaUrl = (
  chainId: string,
  collectionContract: string,
  tokenId: string,
): string => {
  const chain = getChainInfo(chainId)
  return `https://opensea.io/assets/${chain.openSeaSlug}/${collectionContract}/${tokenId}`
}

export const getBlockExplorerUrl = (
  chainId: string,
  collectionContract: string,
  tokenId: string,
): string => {
  const chain = getChainInfo(chainId)
  return `${chain.blockExplorerUrl}/nft/${collectionContract}/${tokenId}`
}

const prepareAssetData = (asset: Asset, recipient: string): PreparedAsset => ({
  token: asset.collection_contract as `0x${string}`,
  tokenId: BigInt(asset.token_id),
  amount: 1n,
  assetType: assetTypeMap[asset.token_type] ?? 0n,
  recipient: recipient as `0x${string}`,
  isDeposited: false,
})

export const prepareAllAssets = (offerInfo: OfferInfo): PreparedAsset[][] => {
  const userWallet = offerInfo.user.wallet as `0x${string}`
  const counterUserWallet = offerInfo.counter_user.wallet as `0x${string}`

  return [
    offerInfo.offer.user.map((asset) => prepareAssetData(asset, counterUserWallet)),
    offerInfo.offer.userCounter.map((asset) => prepareAssetData(asset, userWallet)),
  ]
}

export const trimAddress = (
  addr: string,
  startLength: number = 4,
  endLength: number = 4,
): string => {
  if (typeof addr !== 'string') {
    throw new Error('Address must be a string')
  }

  if (startLength < 0 || endLength < 0) {
    throw new Error('Start and end lengths must be non-negative')
  }

  if (addr.length <= startLength + endLength) {
    return addr
  }

  return `${addr.slice(0, startLength)}...${addr.slice(-endLength)}`
}

export const getAlchemyRpcUrl = (chain: (typeof supportedChains)[number]) => {
  const alchemyNetworkMap: Record<number, string> = {
    [mainnet.id]: 'eth-mainnet',
    [base.id]: 'base-mainnet',
    [optimism.id]: 'opt-mainnet',
    [polygon.id]: 'polygon-mainnet',
    [arbitrum.id]: 'arb-mainnet',
    [zksync.id]: 'zksync-mainnet',
  }

  const networkName = alchemyNetworkMap[chain.id]
  if (networkName) {
    return `https://${networkName}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  }
  return null
}

export const getInfuraRpcUrl = (chain: (typeof supportedChains)[number]) => {
  const infuraNetworkMap: Record<number, string> = {
    [mainnet.id]: 'mainnet',
    [base.id]: 'base-mainnet',
    [optimism.id]: 'optimism-mainnet',
    [polygon.id]: 'polygon-mainnet',
    [arbitrum.id]: 'arbitrum-mainnet',
    [zksync.id]: 'zksync-mainnet',
  }

  const networkName = infuraNetworkMap[chain.id]
  if (networkName) {
    return `https://${networkName}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
  }
  return null
}
