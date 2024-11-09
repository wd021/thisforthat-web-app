import { createPublicClient, http } from 'viem'
import { anvil } from 'viem/chains'

import ABI from '@/contracts/abi.json'
import { Asset, assetTypeMap, OfferInfo, PreparedAsset } from '@/types/main'
import { OnchainTradeInfo, OnchainTradeInfoAsset } from '@/types/main'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

interface ChainInfo {
  id: string
  name: string
  openSeaSlug: string
  blockExplorerUrl: string
}

export const chainInfoMap: { [key: string]: ChainInfo } = {
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
  '324': {
    id: '324',
    name: 'ZkSync',
    openSeaSlug: 'zksync',
    blockExplorerUrl: 'https://explorer.zksync.io',
  },
}

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

    console.log('validVerifications', validVerifications)

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

    console.log('complete trade response', response)

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

export function createTokenIdRecipientMapping(tradeAssets: any[]): Record<string, string> {
  return tradeAssets.reduce(
    (mapping, asset) => {
      const { token, recipient, tokenId } = asset
      const key = `${token}_${tokenId.toString()}`
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

export const getChainInfo = (chainId: string): ChainInfo => {
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

const formatTradeInfo = (
  isActive: boolean,
  depositedAssetCount: bigint,
  totalAssetCount: bigint,
  assets: OnchainTradeInfoAsset[],
): OnchainTradeInfo => {
  return {
    isActive,
    depositedAssetCount: Number(depositedAssetCount),
    totalAssetCount: Number(totalAssetCount),
    assets,
  }
}

const decodeAsset = (asset: OnchainTradeInfoAsset): OnchainTradeInfoAsset => {
  if (typeof asset === 'object' && 'token' in asset) {
    return asset as OnchainTradeInfoAsset
  }
  const { token, tokenId, amount, assetType, recipient, isDeposited } = asset
  return { token, tokenId, amount, assetType, recipient, isDeposited }
}

export async function getTradeInfo(tradeId: string | number): Promise<{
  tradeInfo: OnchainTradeInfo | undefined
  isError: boolean
}> {
  try {
    const publicClient = createPublicClient({
      chain: anvil,
      transport: http(),
    })

    const [isActive, depositedAssetCount, totalAssetCount, encodedAssets] =
      (await publicClient.readContract({
        address: CONTRACT_ADDRESSES[31337],
        abi: ABI,
        functionName: 'getTradeInfo',
        args: [BigInt(tradeId)],
      })) as [boolean, bigint, bigint, OnchainTradeInfoAsset[]]

    const decodedAssets = encodedAssets.map(decodeAsset)

    const tradeInfo = formatTradeInfo(
      isActive,
      depositedAssetCount,
      totalAssetCount,
      decodedAssets,
    )

    return {
      tradeInfo,
      isError: false,
    }
  } catch (error) {
    console.error('Error fetching trade info:', error)
    return {
      tradeInfo: undefined,
      isError: true,
    }
  }
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
