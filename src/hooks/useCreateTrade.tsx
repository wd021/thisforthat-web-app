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

interface AssetInput {
  collection_contract: string
  token_id: string
  token_type: 'ERC20' | 'ERC721' | 'ERC1155' | 'CRYPTOPUNK'
  amount?: string
}

interface OfferInfo {
  user: {
    wallet: string
  }
  counter_user: {
    wallet: string
  }
  offer: {
    user: AssetInput[]
    userCounter: AssetInput[]
  }
}

const CRYPTOPUNKS_ADDRESS = '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB' as Address

function prepareAsset(asset: AssetInput, depositorAddress: Address, recipientAddress: Address) {
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

  const amount =
    asset.token_type === 'ERC1155' || asset.token_type === 'ERC20' ? asset.amount || '1' : '1'

  try {
    const preparedAsset = {
      token: tokenAddress,
      recipient: recipientAddress,
      depositor: depositorAddress,
      tokenId: BigInt(asset.token_id),
      amount: BigInt(amount),
      assetType: assetTypeMap[asset.token_type],
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

function prepareAllAssets(offerInfo: OfferInfo) {
  const userWallet = offerInfo.user.wallet as Address
  const counterUserWallet = offerInfo.counter_user.wallet as Address

  const userAssets = offerInfo.offer.user.map((asset) =>
    prepareAsset(asset, userWallet, counterUserWallet),
  )

  const counterUserAssets = offerInfo.offer.userCounter.map((asset) =>
    prepareAsset(asset, counterUserWallet, userWallet),
  )

  return [...userAssets, ...counterUserAssets]
}

export default function useCreateTrade(offerInfo: OfferInfo) {
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
        offerInfo.user.wallet as Address,
        offerInfo.counter_user.wallet as Address,
      ]

      const assets = prepareAllAssets(offerInfo)

      console.log('Creating trade with:', {
        participants,
        assets: assets.map((a) => ({
          ...a,
          tokenId: a.tokenId.toString(),
          amount: a.amount.toString(),
        })),
      })

      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES[31337] as Address,
        abi: ABI,
        functionName: 'createTrade',
        args: [participants, assets],
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
  }, [address, offerInfo, publicClient, writeContract, showToast])

  return {
    createTradeOnChain,
    hash,
    transactionStatus,
    txReceipt,
    isConfirming,
    isConfirmed,
  }
}
