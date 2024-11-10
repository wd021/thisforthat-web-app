import { useCallback } from 'react'
import { useReadContract } from 'wagmi'

import ABI from '@/contracts/abi.json'
import { OnchainTradeInfo, OnchainTradeInfoAsset } from '@/types/main'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

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

export default function useTradeInfo(
  chainId: string | number | null,
  tradeId: string | number | null,
  done: boolean,
) {
  const {
    data: tradeData,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: chainId ? CONTRACT_ADDRESSES[Number(chainId)] : '0x...',
    abi: ABI,
    functionName: 'getTradeInfo',
    args: tradeId ? [BigInt(tradeId)] : undefined,
    query: {
      enabled: Boolean(tradeId) && !done,
    },
  }) as {
    data: [boolean, bigint, bigint, OnchainTradeInfoAsset[]] | undefined
    isError: boolean
    isLoading: boolean
    refetch: () => Promise<unknown>
  }

  const decodeAsset = useCallback((asset: OnchainTradeInfoAsset): OnchainTradeInfoAsset => {
    if (typeof asset === 'object' && 'token' in asset) {
      return asset as OnchainTradeInfoAsset
    }

    const { token, tokenId, amount, assetType, recipient, isDeposited } = asset
    return { token, tokenId, amount, assetType, recipient, isDeposited }
  }, [])

  let tradeInfo: OnchainTradeInfo | undefined

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
