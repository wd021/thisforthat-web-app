import { useCallback } from 'react'
import { Address } from 'viem'
import { usePublicClient } from 'wagmi'

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

interface TradeStatus {
  info: TradeInfo | null
  error: Error | null
  lastUpdated: number
}

export class TradeStatusManager {
  private cache: Map<string | number, TradeStatus>
  private publicClient: any
  private static BATCH_SIZE = 10

  constructor(publicClient: any) {
    this.cache = new Map()
    this.publicClient = publicClient
  }

  private async fetchBatch(
    tradeIds: (string | number)[],
  ): Promise<Map<string | number, TradeStatus>> {
    const results = new Map<string | number, TradeStatus>()

    try {
      const result = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES[31337],
        abi: ABI,
        functionName: 'getMultipleTradeStatuses',
        args: [tradeIds.map((id) => BigInt(id))],
      })

      const [isActive, depositedAssetCount, totalAssetCount, assets] = result

      tradeIds.forEach((id, index) => {
        const info: TradeInfo = {
          isActive: isActive[index],
          depositedAssetCount: Number(depositedAssetCount[index]),
          totalAssetCount: Number(totalAssetCount[index]),
          assets: assets[index].map((asset) => ({
            token: asset.token,
            tokenId: asset.tokenId,
            amount: asset.amount,
            assetType: asset.assetType,
            recipient: asset.recipient,
          })),
        }

        const status = {
          info,
          error: null,
          lastUpdated: Date.now(),
        }

        this.cache.set(id, status)
        results.set(id, status)
      })
    } catch (error) {
      tradeIds.forEach((id) => {
        const status = {
          info: null,
          error: error as Error,
          lastUpdated: Date.now(),
        }
        this.cache.set(id, status)
        results.set(id, status)
      })
    }

    return results
  }

  async getStatuses(tradeIds: (string | number)[]): Promise<Map<string | number, TradeStatus>> {
    const now = Date.now()
    const results = new Map<string | number, TradeStatus>()
    const idsToFetch: (string | number)[] = []

    tradeIds.forEach((id) => {
      const cached = this.cache.get(id)
      if (cached && now - cached.lastUpdated < 30000) {
        results.set(id, cached)
      } else {
        idsToFetch.push(id)
      }
    })

    if (idsToFetch.length > 0) {
      for (let i = 0; i < idsToFetch.length; i += TradeStatusManager.BATCH_SIZE) {
        const batchIds = idsToFetch.slice(i, i + TradeStatusManager.BATCH_SIZE)
        const batchResults = await this.fetchBatch(batchIds)
        batchResults.forEach((value, key) => results.set(key, value))
      }
    }

    return results
  }

  // Clear a specific trade ID from cache
  clearTradeCache(tradeId: string | number) {
    this.cache.delete(tradeId)
  }

  // Clear multiple trade IDs from cache
  clearTradeCaches(tradeIds: (string | number)[]) {
    tradeIds.forEach((id) => this.cache.delete(id))
  }

  // Clear entire cache
  clearCache() {
    this.cache.clear()
  }

  // Fetch fresh status for a specific trade ID
  async refreshTradeStatus(tradeId: string | number): Promise<TradeStatus | undefined> {
    this.clearTradeCache(tradeId)
    const results = await this.getStatuses([tradeId])
    return results.get(tradeId)
  }
}

// Enhanced hook with refresh capabilities
export default function useTradeStatuses() {
  const publicClient = usePublicClient()

  const managerRef = useCallback(() => {
    return new TradeStatusManager(publicClient)
  }, [publicClient])

  return {
    getStatuses: useCallback(
      async (tradeIds: (string | number)[]) => {
        const statusManager = managerRef()
        return await statusManager.getStatuses(tradeIds)
      },
      [managerRef],
    ),

    // Add refresh capability
    refreshStatus: useCallback(
      async (tradeId: string | number) => {
        const statusManager = managerRef()
        return await statusManager.refreshTradeStatus(tradeId)
      },
      [managerRef],
    ),
  }
}
