import React, { useCallback, useState } from 'react'
import { Address, ContractFunctionExecutionError } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import ABI from '@/contracts/abi.json'
import ERC721_ABI from '@/contracts/erc721Abi.json'
import ERC1155_ABI from '@/contracts/erc1155Abi.json'
import CRYPTOPUNKS_ABI from '@/contracts/punks.json'
import { useToast } from '@/providers/toastProvider'
import { DepositAsset } from '@/types/main'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

const CRYPTOPUNKS_ADDRESS = '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB' as Address

function useDepositAsset(tradeId: bigint) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { showToast } = useToast()

  // Transaction states
  const [isProcessingApproval, setIsProcessingApproval] = useState(false)
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false)

  const {
    writeContract,
    data: hash,
    status: transactionStatus,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash })

  const resetStates = useCallback(() => {
    setIsProcessingApproval(false)
    setIsProcessingDeposit(false)
    resetWrite()
  }, [resetWrite])

  const checkAndApproveAssets = useCallback(
    async (assets: DepositAsset[]) => {
      if (!address || !publicClient) return false

      console.log('check assets', assets)

      try {
        setIsProcessingApproval(true)

        const grouped = assets.reduce(
          (acc, asset) => {
            const key =
              asset.token_type === 'CRYPTOPUNK'
                ? 'cryptoPunks'
                : `${asset.collection_contract}-${asset.token_type}`
            if (!acc[key]) {
              acc[key] = []
            }
            acc[key].push(asset)
            return acc
          },
          {} as Record<string, DepositAsset[]>,
        )

        console.log('grouped', grouped)

        for (const [key, groupAssets] of Object.entries(grouped)) {
          const firstAsset = groupAssets[0]

          if (firstAsset.token_type === 'CRYPTOPUNK') {
            for (const punk of groupAssets) {
              const punkData = await publicClient.readContract({
                address: CRYPTOPUNKS_ADDRESS,
                abi: CRYPTOPUNKS_ABI,
                functionName: 'punksOfferedForSale',
                args: [BigInt(punk.token_id)],
              })

              console.log('punkData', punkData)

              const isApproved =
                punkData.isForSale &&
                punkData.onlySellTo.toLowerCase() === CONTRACT_ADDRESSES[31337].toLowerCase() &&
                punkData.minValue === 0n

              if (!isApproved) {
                console.log('approve the punks!!!!')
                const { request } = await publicClient.simulateContract({
                  address: CRYPTOPUNKS_ADDRESS,
                  abi: CRYPTOPUNKS_ABI,
                  functionName: 'offerPunkForSaleToAddress',
                  args: [BigInt(punk.token_id), 0n, CONTRACT_ADDRESSES[31337] as Address],
                  account: address,
                })
                await writeContract(request)
                console.log('punkky')
                // Wait for transaction confirmation
                if (hash) {
                  await publicClient.waitForTransactionReceipt({ hash })
                  console.log('punkky done')
                }
              }
            }
          } else {
            const tokenAddress = firstAsset.collection_contract as Address
            const abi = firstAsset.token_type === 'ERC721' ? ERC721_ABI : ERC1155_ABI

            const isApproved = await publicClient.readContract({
              address: tokenAddress,
              abi,
              functionName: 'isApprovedForAll',
              args: [address, CONTRACT_ADDRESSES[31337]],
            })

            console.log('are tokens approved', isApproved)

            if (!isApproved) {
              const { request } = await publicClient.simulateContract({
                address: tokenAddress,
                abi,
                functionName: 'setApprovalForAll',
                args: [CONTRACT_ADDRESSES[31337], true],
                account: address,
              })
              await writeContract(request)
              // Wait for transaction confirmation
              if (hash) {
                await publicClient.waitForTransactionReceipt({ hash })
              }
            }
          }
        }

        console.log('Approvals successful')

        return true
      } catch (error) {
        console.log('error', error)
        if (error instanceof ContractFunctionExecutionError) {
          showToast('Transaction rejected', 2500)
        } else {
          showToast('Failed to process approvals', 2500)
        }
        throw error
      } finally {
        setIsProcessingApproval(false)
      }
    },
    [address, publicClient, writeContract, hash, showToast],
  )

  const depositAssets = useCallback(
    async (assets: DepositAsset[]) => {
      console.log('depositing assets', assets, isConfirmed)
      if (!address || !publicClient) return

      try {
        setIsProcessingDeposit(true)

        const internalAssets = assets.map((asset) => ({
          token:
            asset.token_type === 'CRYPTOPUNK'
              ? CRYPTOPUNKS_ADDRESS
              : (asset.collection_contract as Address),
          tokenId: BigInt(asset.token_id),
          amount: BigInt(
            asset.token_type === 'ERC1155' || asset.token_type === 'ERC20'
              ? asset.token_id
              : '1',
          ),
          assetType:
            asset.token_type === 'ERC20'
              ? 0
              : asset.token_type === 'ERC721'
                ? 1
                : asset.token_type === 'ERC1155'
                  ? 2
                  : 3,
        }))

        const { request } = await publicClient.simulateContract({
          address: CONTRACT_ADDRESSES[31337] as Address,
          abi: ABI,
          functionName: 'batchDepositAssets',
          args: [
            tradeId,
            internalAssets.map((a) => a.token),
            internalAssets.map((a) => a.tokenId),
            internalAssets.map((a) => a.amount),
            internalAssets.map((a) => a.assetType),
          ],
          account: address,
        })

        await writeContract(request)
      } catch (error) {
        console.log('error', error)
        if (error instanceof ContractFunctionExecutionError) {
          showToast('Transaction rejected', 2500)
        } else {
          showToast('Failed to deposit assets', 2500)
        }
        throw error
      } finally {
        setIsProcessingDeposit(false)
      }
    },
    [address, publicClient, tradeId, writeContract, isConfirmed, showToast],
  )

  return {
    checkAndApproveAssets,
    depositAssets,
    isProcessingApproval,
    isProcessingDeposit,
    isConfirming,
    isConfirmed,
    transactionStatus,
    writeError,
    confirmError,
    resetStates,
    hash,
  }
}

export default useDepositAsset
