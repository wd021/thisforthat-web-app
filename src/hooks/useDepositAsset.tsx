// useDepositAsset.ts
import { useCallback, useState } from 'react'
import { Address, ContractFunctionExecutionError } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { useToast } from '@/providers/toastProvider'
import { AssetType } from '@/types/main'
import ABI from '@/contracts/abi.json'

interface Asset {
  tokenAddress: Address
  tokenId: string
  amount: string
  assetType: AssetType
}

export function useDepositAsset(contractAddress: Address, tradeId: bigint) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { showToast } = useToast()

  const {
    writeContractAsync: write,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract()

  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const deposit = useCallback(
    async (asset: Asset): Promise<boolean> => {
      if (!address || !publicClient) return false

      try {
        setTxHash(null)

        const { request } = await publicClient.simulateContract({
          address: contractAddress,
          abi: ABI,
          functionName: 'depositAsset',
          args: [
            tradeId,
            asset.tokenAddress,
            BigInt(asset.tokenId),
            BigInt(asset.assetType === 'ERC1155' ? asset.amount : '1'),
            asset.assetType === 'ERC20'
              ? 0
              : asset.assetType === 'ERC721'
                ? 1
                : asset.assetType === 'ERC1155'
                  ? 2
                  : 3,
          ],
          account: address,
        })

        const hash = await write(request)
        setTxHash(hash)

        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        if (receipt.status === 'success') {
          showToast('Asset deposited successfully!', 2500)
          return true
        }
        return false
      } catch (error) {
        console.error('Error depositing asset:', error)
        if (error instanceof ContractFunctionExecutionError) {
          showToast('Transaction rejected', 2500)
        } else {
          showToast('Failed to deposit asset', 2500)
        }
        return false
      }
    },
    [address, publicClient, contractAddress, tradeId, write, showToast],
  )

  return {
    deposit,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || confirmError,
  }
}
