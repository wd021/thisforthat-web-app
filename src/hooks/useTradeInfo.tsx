import { useCallback } from 'react'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

import ABI from '@/contracts/abi.json'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

interface Asset {
  token: Address
  tokenId: bigint
  amount: bigint
  assetType: number
  recipient: Address
}

interface TradeInfo {
  isActive: boolean
  depositedAssetCount: number
  totalAssetCount: number
  assets: Asset[]
}

const formatTradeInfo = (
  isActive: boolean,
  depositedAssetCount: bigint,
  totalAssetCount: bigint,
  assets: Asset[],
): TradeInfo => {
  return {
    isActive,
    depositedAssetCount: Number(depositedAssetCount),
    totalAssetCount: Number(totalAssetCount),
    assets,
  }
}

export default function useTradeInfo(tradeId: string | number) {
  const {
    data: tradeData,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES[31337],
    abi: ABI,
    functionName: 'getTradeInfo',
    args: [BigInt(tradeId)],
  }) as {
    data: [boolean, bigint, bigint, Asset[]] | undefined
    isError: boolean
    isLoading: boolean
    refetch: () => Promise<any>
  }

  const decodeAsset = useCallback((asset: Asset): Asset => {
    if (typeof asset === 'object' && 'token' in asset) {
      // If the asset is already in the correct format, return it as is
      return asset as Asset
    }
    // If it's not, assume it's a tuple and decode it
    const { token, tokenId, amount, assetType, recipient } = asset
    return { token, tokenId, amount, assetType, recipient }
  }, [])

  let tradeInfo: TradeInfo | undefined

  if (tradeData) {
    const [isActive, depositedAssetCount, totalAssetCount, encodedAssets] = tradeData
    const decodedAssets = encodedAssets.map(decodeAsset)
    tradeInfo = formatTradeInfo(isActive, depositedAssetCount, totalAssetCount, decodedAssets)
  }

  return {
    tradeInfo,
    isLoading,
    isError,
    refetch,
  }
}
