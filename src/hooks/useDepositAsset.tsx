import { useCallback, useState } from 'react'
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

interface InternalAsset {
  token: Address
  tokenId: bigint
  amount: bigint
  assetType: number
}

const CRYPTOPUNKS_ADDRESS = '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB' as Address

export default function useDepositAsset(tradeId: bigint) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { showToast } = useToast()
  const [errorReason, setErrorReason] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  const { writeContract, data: hash, status: transactionStatus } = useWriteContract()

  const {
    data: txReceipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash })

  const convertToInternalAsset = useCallback((asset: DepositAsset): InternalAsset => {
    const assetTypeMap = {
      ERC20: 0,
      ERC721: 1,
      ERC1155: 2,
      CRYPTOPUNK: 3,
    } as const

    // Ensure we have a valid address format
    const tokenAddress =
      asset.token_type === 'CRYPTOPUNK'
        ? CRYPTOPUNKS_ADDRESS
        : (asset.collection_contract as Address)

    return {
      token: tokenAddress,
      tokenId: BigInt(asset.token_id),
      amount: BigInt(
        asset.token_type === 'ERC1155' || asset.token_type === 'ERC20' ? asset.token_id : '1',
      ),
      assetType: assetTypeMap[asset.token_type],
    }
  }, [])

  const getAssetAbi = useCallback((tokenType: DepositAsset['token_type']) => {
    switch (tokenType) {
      case 'ERC721':
        return ERC721_ABI
      case 'ERC1155':
        return ERC1155_ABI
      case 'ERC20':
        return ERC721_ABI
      case 'CRYPTOPUNK':
        return CRYPTOPUNKS_ABI
      default:
        throw new Error('Unsupported token type')
    }
  }, [])

  const checkApproval = useCallback(
    async (asset: DepositAsset) => {
      if (!address || !publicClient) return false

      try {
        if (asset.token_type === 'CRYPTOPUNK') {
          const punkData = await publicClient.readContract({
            address: CRYPTOPUNKS_ADDRESS,
            abi: CRYPTOPUNKS_ABI,
            functionName: 'punksOfferedForSale',
            args: [BigInt(asset.token_id)],
          })

          return (
            punkData.isForSale &&
            punkData.onlySellTo.toLowerCase() === CONTRACT_ADDRESSES[31337].toLowerCase() &&
            punkData.minValue === 0n
          )
        }

        const abi = getAssetAbi(asset.token_type)
        const tokenAddress = asset.collection_contract as Address

        const isApproved = await publicClient.readContract({
          address: tokenAddress,
          abi,
          functionName: 'isApprovedForAll',
          args: [address, CONTRACT_ADDRESSES[31337]],
        })

        return isApproved
      } catch (error) {
        console.error('Error checking approval:', error)
        return false
      }
    },
    [address, publicClient, getAssetAbi],
  )

  const approveAsset = useCallback(
    async (asset: DepositAsset) => {
      if (!address || !publicClient) return

      try {
        setIsApproving(true)

        if (asset.token_type === 'CRYPTOPUNK') {
          const { request } = await publicClient.simulateContract({
            address: CRYPTOPUNKS_ADDRESS,
            abi: CRYPTOPUNKS_ABI,
            functionName: 'offerPunkForSaleToAddress',
            args: [BigInt(asset.token_id), 0n, CONTRACT_ADDRESSES[31337] as Address],
            account: address,
          })
          await writeContract(request)
          return
        }

        const abi = getAssetAbi(asset.token_type)
        const tokenAddress = asset.collection_contract as Address

        const { request } = await publicClient.simulateContract({
          address: tokenAddress,
          abi,
          functionName: 'setApprovalForAll',
          args: [CONTRACT_ADDRESSES[31337], true],
          account: address,
        })
        await writeContract(request)
      } catch (error) {
        console.error('Error approving asset:', error)
        if (error instanceof ContractFunctionExecutionError) {
          setErrorReason(error.cause?.message || error.message)
        } else {
          setErrorReason('Unknown error occurred during approval')
        }
        throw error
      } finally {
        setIsApproving(false)
      }
    },
    [address, publicClient, writeContract, getAssetAbi],
  )

  const approveBatchAssets = useCallback(
    async (assets: DepositAsset[]) => {
      if (!address || !publicClient) return

      // Group assets by collection contract and token type, handling CryptoPunks separately
      const groups = assets.reduce(
        (acc, asset) => {
          if (asset.token_type === 'CRYPTOPUNK') {
            if (!acc.cryptoPunks) acc.cryptoPunks = []
            acc.cryptoPunks.push(asset)
          } else {
            const key = `${asset.collection_contract}-${asset.token_type}`
            if (!acc.tokens[key]) {
              acc.tokens[key] = {
                contract: asset.collection_contract as Address,
                tokenType: asset.token_type,
                assets: [],
              }
            }
            acc.tokens[key].assets.push(asset)
          }
          return acc
        },
        { tokens: {}, cryptoPunks: [] } as {
          tokens: Record<
            string,
            {
              contract: Address
              tokenType: DepositAsset['token_type']
              assets: DepositAsset[]
            }
          >
          cryptoPunks: DepositAsset[]
        },
      )

      try {
        setIsApproving(true)

        // Handle CryptoPunks first
        if (groups.cryptoPunks?.length) {
          for (const punk of groups.cryptoPunks) {
            const { request } = await publicClient.simulateContract({
              address: CRYPTOPUNKS_ADDRESS,
              abi: CRYPTOPUNKS_ABI,
              functionName: 'offerPunkForSaleToAddress',
              args: [BigInt(punk.token_id), 0n, CONTRACT_ADDRESSES[31337] as Address],
              account: address,
            })
            await writeContract(request)
          }
        }

        // Handle other token types
        for (const { contract, tokenType } of Object.values(groups.tokens)) {
          const abi = getAssetAbi(tokenType)
          const { request } = await publicClient.simulateContract({
            address: contract,
            abi,
            functionName: 'setApprovalForAll',
            args: [CONTRACT_ADDRESSES[31337] as Address, true],
            account: address,
          })
          await writeContract(request)
        }
      } catch (error) {
        console.error('Error approving batch assets:', error)
        if (error instanceof ContractFunctionExecutionError) {
          setErrorReason(error.cause?.message || error.message)
        } else {
          setErrorReason('Unknown error occurred during batch approval')
        }
        throw error
      } finally {
        setIsApproving(false)
      }
    },
    [address, publicClient, writeContract, getAssetAbi],
  )

  const depositAsset = useCallback(
    async (asset: DepositAsset) => {
      if (!address || !publicClient) return

      try {
        const isApproved = await checkApproval(asset)
        console.log('isApproved', isApproved)

        if (!isApproved) {
          await approveAsset(asset)
        }

        const internalAsset = convertToInternalAsset(asset)

        // Ensure we're passing the escrow contract address correctly
        const escrowAddress = CONTRACT_ADDRESSES[31337] as Address

        const { request } = await publicClient.simulateContract({
          address: escrowAddress,
          abi: ABI,
          functionName: 'depositAsset',
          args: [
            tradeId,
            internalAsset.token,
            internalAsset.tokenId,
            internalAsset.amount,
            internalAsset.assetType,
          ],
          account: address,
        })
        await writeContract(request)
        setErrorReason(null)
      } catch (err) {
        console.error('Error in depositAsset:', err)
        if (err instanceof ContractFunctionExecutionError) {
          const revertReason = err.cause?.message || err.message
          setErrorReason(revertReason)
          showToast(`⚠️ ${revertReason}`, 2500)
        } else {
          setErrorReason('Unknown error occurred')
          showToast('⚠️ Failed to deposit asset. Please try again.', 2500)
        }
      }
    },
    [
      address,
      publicClient,
      tradeId,
      writeContract,
      showToast,
      checkApproval,
      approveAsset,
      convertToInternalAsset,
    ],
  )

  const batchDepositAssets = useCallback(
    async (assets: DepositAsset[]) => {
      if (!address || !publicClient) return

      try {
        const approvalStatuses = await Promise.all(assets.map((asset) => checkApproval(asset)))

        const unapprovedAssets = assets.filter((_, index) => !approvalStatuses[index])

        for (const asset of unapprovedAssets) {
          await approveAsset(asset)
        }

        const internalAssets = assets.map(convertToInternalAsset)
        const escrowAddress = CONTRACT_ADDRESSES[31337] as Address

        const { request } = await publicClient.simulateContract({
          address: escrowAddress,
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
        setErrorReason(null)
      } catch (err) {
        console.error('Error in batchDepositAssets:', err)
        if (err instanceof ContractFunctionExecutionError) {
          const revertReason = err.cause?.message || err.message
          setErrorReason(revertReason)
          showToast(`⚠️ ${revertReason}`, 2500)
        } else {
          setErrorReason('Unknown error occurred')
          showToast('⚠️ Failed to deposit assets. Please try again.', 2500)
        }
      }
    },
    [
      address,
      publicClient,
      tradeId,
      writeContract,
      showToast,
      checkApproval,
      approveAsset,
      convertToInternalAsset,
    ],
  )

  return {
    depositAsset,
    batchDepositAssets,
    checkApproval,
    approveAsset,
    approveBatchAssets,
    checkBatchApprovals: useCallback(
      async (assets: DepositAsset[]) => {
        const approvalChecks = await Promise.all(
          assets.map(async (asset) => ({
            asset,
            isApproved: await checkApproval(asset),
          })),
        )
        return approvalChecks
      },
      [checkApproval],
    ),
    hash,
    transactionStatus,
    txReceipt,
    isConfirming,
    isConfirmed,
    errorReason,
    isApproving,
  }
}
