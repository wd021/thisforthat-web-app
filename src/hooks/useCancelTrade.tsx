import { useCallback } from 'react'
import { Address, ContractFunctionExecutionError } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import ABI from '@/contracts/abi.json'
import { useToast } from '@/providers/toastProvider'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

export default function useCancelTrade({ tradeId }: { tradeId: string | bigint }) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { showToast } = useToast()

  // Consolidate write contract states
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    isError: isWriteError,
    reset: resetWrite,
  } = useWriteContract()

  // Consolidate transaction receipt states
  const {
    data: txReceipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
    isError: isConfirmError,
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Combined loading state
  const isLoading = isWritePending || isConfirming

  const cancelTrade = useCallback(async () => {
    if (!address || !publicClient || !tradeId) return

    try {
      // Convert tradeId to BigInt if it's a string
      const tradeBigInt = typeof tradeId === 'string' ? BigInt(tradeId) : tradeId

      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES[31337] as Address,
        abi: ABI,
        functionName: 'cancelTrade',
        args: [tradeBigInt],
        account: address,
      })

      await writeContract(request)
    } catch (err) {
      console.error('Error cancelling trade:', err)
      if (err instanceof ContractFunctionExecutionError) {
        const errorMessage = err.cause?.message || err.message
        showToast(`⚠️ ${errorMessage}`, 2500)
      } else if (err instanceof Error) {
        showToast(`⚠️ ${err.message}`, 2500)
      } else {
        showToast('⚠️ Transaction failed. Please try again', 2500)
      }
      throw err
    }
  }, [tradeId, address, publicClient, writeContract, showToast])

  // Reset the transaction states
  const reset = useCallback(() => {
    resetWrite()
  }, [resetWrite])

  return {
    cancelTrade,
    isLoading,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    hash,
    txReceipt,
    error: writeError || confirmError,
    isError: isWriteError || isConfirmError,
    reset,
  }
}
