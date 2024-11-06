import { useCallback } from 'react'
import { useReadContract } from 'wagmi'

import ABI from '@/contracts/abi.json'
import { TradeInfo, TradeInfoAsset } from '@/types/main'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

const formatTradeInfo = (
  isActive: boolean,
  depositedAssetCount: bigint,
  totalAssetCount: bigint,
  assets: TradeInfoAsset[],
): TradeInfo => {
  return {
    isActive,
    depositedAssetCount: Number(depositedAssetCount),
    totalAssetCount: Number(totalAssetCount),
    assets,
  }
}

export default function useTradeInfo(tradeId: string | number | null, done: boolean) {
  const {
    data: tradeData,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES[31337],
    abi: ABI,
    functionName: 'getTradeInfo',
    args: tradeId ? [BigInt(tradeId)] : undefined,
    query: {
      enabled: Boolean(tradeId) && !done,
    },
  }) as {
    data: [boolean, bigint, bigint, TradeInfoAsset[]] | undefined
    isError: boolean
    isLoading: boolean
    refetch: () => Promise<any>
  }

  const decodeAsset = useCallback((asset: TradeInfoAsset): TradeInfoAsset => {
    if (typeof asset === 'object' && 'token' in asset) {
      // If the asset is already in the correct format, return it as is
      return asset as TradeInfoAsset
    }
    // If it's not, assume it's a tuple and decode it
    const { token, tokenId, amount, assetType, recipient, isDeposited } = asset
    return { token, tokenId, amount, assetType, recipient, isDeposited }
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
