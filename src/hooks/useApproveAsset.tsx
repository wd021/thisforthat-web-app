import { useCallback, useState } from 'react'
import { Address, ContractFunctionExecutionError } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import ERC721_ABI from '@/contracts/erc721Abi.json'
import ERC1155_ABI from '@/contracts/erc1155Abi.json'
import CRYPTOPUNKS_ABI from '@/contracts/punks.json'
import { useToast } from '@/providers/toastProvider'
import { AssetType } from '@/types/main'

const CRYPTOPUNKS_ADDRESS = '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB' as Address

interface Asset {
  tokenAddress: Address
  tokenId: string
  amount: string
  assetType: AssetType
}

export default function useApproveAsset(contractAddress: Address) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { showToast } = useToast()
  const [isChecking, setIsChecking] = useState(false)

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
    hash: txHash as `0x${string}`,
  })

  const checkApproval = useCallback(
    async (asset: Asset): Promise<boolean> => {
      if (!address || !publicClient) return false
      setIsChecking(true)

      try {
        if (asset.assetType === 'CRYPTOPUNK') {
          const punkData = (await publicClient.readContract({
            address: CRYPTOPUNKS_ADDRESS,
            abi: CRYPTOPUNKS_ABI,
            functionName: 'punksOfferedForSale',
            args: [BigInt(asset.tokenId)],
          })) as [boolean, bigint, string, bigint, string]

          const isForSale = punkData[0]
          const onlySellTo = punkData[4]
          const minValue = punkData[3]

          return (
            isForSale &&
            onlySellTo.toLowerCase() === contractAddress.toLowerCase() &&
            minValue === 0n
          )
        } else if (asset.assetType === 'ERC721') {
          const approved = (await publicClient.readContract({
            address: asset.tokenAddress,
            abi: ERC721_ABI,
            functionName: 'getApproved',
            args: [BigInt(asset.tokenId)],
          })) as string
          return approved.toLowerCase() === contractAddress.toLowerCase()
        } else {
          return (await publicClient.readContract({
            address: asset.tokenAddress,
            abi: ERC1155_ABI,
            functionName: 'isApprovedForAll',
            args: [address, contractAddress],
          })) as boolean
        }
      } catch (error) {
        console.error('Error checking approval:', error)
        return false
      } finally {
        setIsChecking(false)
      }
    },
    [address, publicClient, contractAddress],
  )

  const approve = useCallback(
    async (asset: Asset): Promise<boolean> => {
      if (!address || !publicClient) return false

      try {
        setTxHash(null)

        let request
        if (asset.assetType === 'CRYPTOPUNK') {
          request = await publicClient.simulateContract({
            address: CRYPTOPUNKS_ADDRESS,
            abi: CRYPTOPUNKS_ABI,
            functionName: 'offerPunkForSaleToAddress',
            args: [BigInt(asset.tokenId), 0n, contractAddress],
            account: address,
          })
        } else if (asset.assetType === 'ERC721') {
          request = await publicClient.simulateContract({
            address: asset.tokenAddress,
            abi: ERC721_ABI,
            functionName: 'approve',
            args: [contractAddress, BigInt(asset.tokenId)],
            account: address,
          })
        } else {
          request = await publicClient.simulateContract({
            address: asset.tokenAddress,
            abi: ERC1155_ABI,
            functionName: 'setApprovalForAll',
            args: [contractAddress, true],
            account: address,
          })
        }

        const hash = await write(request.request)
        setTxHash(hash)

        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        if (receipt.status === 'success') {
          showToast('NFT approved successfully! Click Deposit to continue', 5000)
          return true
        }
        return false
      } catch (error) {
        console.error('Error approving asset:', error)
        if (error instanceof ContractFunctionExecutionError) {
          showToast(
            `⚠️ Transaction failed. Please check that you are connected to the wallet and network containing the NFT.`,
            4000,
          )
        } else {
          showToast('⚠️ Failed to approve asset', 2500)
        }
        return false
      }
    },
    [address, publicClient, contractAddress, write, showToast],
  )

  return {
    checkApproval,
    approve,
    isChecking,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || confirmError,
  }
}
