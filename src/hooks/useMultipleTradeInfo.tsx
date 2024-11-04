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

interface BatchTradeInfo {
  trades: TradeInfo[]
  isLoading: boolean
  isError: boolean
  refetch: () => Promise<any>
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

const MAX_BATCH_SIZE = 10

export default function useMultipleTradeInfo(
  tradeIds: (string | number)[] | null,
): BatchTradeInfo {
  const {
    data: tradeData,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES[31337],
    abi: ABI,
    functionName: 'getMultipleTradeStatuses',
    args: tradeIds ? [tradeIds.map((id) => BigInt(id))] : undefined,
    query: {
      enabled: Boolean(tradeIds?.length) && tradeIds!.length <= MAX_BATCH_SIZE,
    },
  }) as {
    data: [boolean[], bigint[], bigint[], Asset[][]] | undefined
    isError: boolean
    isLoading: boolean
    refetch: () => Promise<any>
  }

  const decodeAsset = useCallback((asset: Asset): Asset => {
    if (typeof asset === 'object' && 'token' in asset) {
      return asset as Asset
    }
    const { token, tokenId, amount, assetType, recipient } = asset
    return { token, tokenId, amount, assetType, recipient }
  }, [])

  const formatBatchTradeInfo = useCallback(
    (
      isActive: boolean[],
      depositedAssetCount: bigint[],
      totalAssetCount: bigint[],
      assets: Asset[][],
    ): TradeInfo[] => {
      return isActive.map((active, index) => {
        const decodedAssets = assets[index].map(decodeAsset)
        return formatTradeInfo(
          active,
          depositedAssetCount[index],
          totalAssetCount[index],
          decodedAssets,
        )
      })
    },
    [decodeAsset],
  )

  let trades: TradeInfo[] = []

  if (tradeData) {
    const [isActive, depositedAssetCount, totalAssetCount, encodedAssets] = tradeData
    trades = formatBatchTradeInfo(isActive, depositedAssetCount, totalAssetCount, encodedAssets)
  }

  return {
    trades,
    isLoading,
    isError,
    refetch,
  }
}
