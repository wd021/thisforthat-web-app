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
import { ProfileMinimal, SimplifiedNFTAsset } from '@/types/supabase'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

const CRYPTOPUNKS_ADDRESS = '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB' as Address

function prepareAsset(
  asset: SimplifiedNFTAsset,
  depositorAddress: Address,
  recipientAddress: Address,
) {
  const assetTypeMap = {
    ERC20: 0,
    ERC721: 1,
    ERC1155: 2,
    CRYPTOPUNK: 3,
  } as const

  const tokenAddress =
    asset.token_type === 'CRYPTOPUNK'
      ? CRYPTOPUNKS_ADDRESS
      : (asset.collection_contract as Address)

  const amount = '1' // TODO: support multiple amounts

  try {
    const preparedAsset = {
      token: tokenAddress,
      recipient: recipientAddress,
      depositor: depositorAddress,
      tokenId: BigInt(asset.token_id),
      amount: BigInt(amount),
      assetType: assetTypeMap[asset.token_type as keyof typeof assetTypeMap],
      isDeposited: false,
    }

    console.log('Prepared asset:', {
      ...preparedAsset,
      tokenId: preparedAsset.tokenId.toString(),
      amount: preparedAsset.amount.toString(),
    })

    return preparedAsset
  } catch (error) {
    console.error('Error preparing asset:', asset, error)
    throw error
  }
}

function prepareAllAssets({
  creator,
  creator_assets,
  counterparty,
  counterparty_assets,
}: {
  creator: ProfileMinimal
  creator_assets: SimplifiedNFTAsset[]
  counterparty: ProfileMinimal
  counterparty_assets: SimplifiedNFTAsset[]
}) {
  const creatorAssets = creator_assets.map((asset) =>
    prepareAsset(asset, creator.wallet as Address, counterparty.wallet as Address),
  )

  const counterpartyAssets = counterparty_assets.map((asset) =>
    prepareAsset(asset, counterparty.wallet as Address, creator.wallet as Address),
  )

  return [...creatorAssets, ...counterpartyAssets]
}

export default function useCreateTrade({
  chainId,
  users,
  assets,
}: {
  chainId: number
  users: {
    creator: ProfileMinimal
    counterparty: ProfileMinimal
  }
  assets: {
    creator: SimplifiedNFTAsset[]
    counterparty: SimplifiedNFTAsset[]
  }
}) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { showToast } = useToast()

  const { writeContract, data: hash, status: transactionStatus } = useWriteContract()

  const {
    data: txReceipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash })

  const createTradeOnChain = useCallback(async () => {
    if (!address || !publicClient) return

    try {
      const participants = [
        users.creator.wallet as Address,
        users.counterparty.wallet as Address,
      ]

      const assetsArg = prepareAllAssets({
        creator: users.creator,
        creator_assets: assets.creator,
        counterparty: users.counterparty,
        counterparty_assets: assets.counterparty,
      })

      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES[31337] as Address,
        abi: ABI,
        functionName: 'createTrade',
        args: [participants, assetsArg],
        account: address,
      })

      await writeContract(request)
    } catch (err) {
      console.error('Error creating trade:', err)
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
  }, [chainId, users, assets, address, publicClient, writeContract, showToast])

  return {
    createTradeOnChain,
    hash,
    transactionStatus,
    txReceipt,
    isConfirming,
    isConfirmed,
  }
}
