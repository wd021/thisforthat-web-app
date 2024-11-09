import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useModal } from 'connectkit'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

import { NFTImage } from '@/components/shared'
import { LoadingIndicator } from '@/components/shared'
import { useApproveAsset, useDepositAsset } from '@/hooks'
import { Checkmark } from '@/icons'
import { AssetType } from '@/types/main'
import { SimplifiedNFTAsset } from '@/types/supabase'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

const DepositCard = ({
  tradeId,
  asset,
  depositedAssets,
  onFinish,
}: {
  tradeId: string
  asset: SimplifiedNFTAsset
  depositedAssets: {
    token: Address
    tokenId: bigint
  }[]
  onFinish: () => void
}) => {
  const { setOpen } = useModal()
  const { isConnected } = useAccount()

  const isDeposited = depositedAssets.some(
    (dAsset) =>
      dAsset.token.toLowerCase() === asset.collection_contract.toLowerCase() &&
      dAsset.tokenId.toString() === asset.token_id,
  )

  const [needsApproval, setNeedsApproval] = useState<boolean | null>(null)

  const {
    checkApproval,
    approve,
    isChecking: isCheckingApproval,
    isWritePending: isApprovalPending,
    isConfirming: isApprovalConfirming,
    isConfirmed: isApprovalConfirmed,
  } = useApproveAsset(CONTRACT_ADDRESSES[31337])

  const {
    deposit,
    isWritePending: isDepositPending,
    isConfirming: isDepositConfirming,
    isConfirmed: isDepositConfirmed,
  } = useDepositAsset(CONTRACT_ADDRESSES[31337], BigInt(tradeId))

  useEffect(() => {
    const checkAssetApproval = async () => {
      const depositAsset = {
        tokenAddress: asset.collection_contract as `0x${string}`,
        tokenId: asset.token_id,
        amount: '1',
        assetType: asset.token_type as AssetType,
      }

      const isApproved = await checkApproval(depositAsset)
      setNeedsApproval(!isApproved)
    }

    if (!isDeposited && needsApproval === null) {
      checkAssetApproval()
    }
  }, [asset, needsApproval, isDeposited, checkApproval])

  useEffect(() => {
    if (isApprovalConfirmed) {
      setNeedsApproval(false)
    }
  }, [isApprovalConfirmed])

  const onClickDeposit = async () => {
    if (!isConnected) {
      setOpen(true)
      return
    }

    const depositAsset = {
      tokenAddress: asset.collection_contract as `0x${string}`,
      tokenId: asset.token_id,
      amount: '1',
      assetType: asset.token_type as AssetType,
    }

    if (needsApproval) {
      await approve(depositAsset)
    } else {
      await deposit(depositAsset)
    }
  }

  const getButtonText = () => {
    if (isCheckingApproval) return 'Checking Approval...'
    if (isApprovalPending) return 'Waiting for Approval...'
    if (isApprovalConfirming) return 'Confirming Approval...'
    if (isDepositPending) return 'Waiting for Deposit...'
    if (isDepositConfirming) return 'Confirming Deposit...'
    return needsApproval ? 'Approve NFT' : 'Deposit NFT'
  }

  const isLoading =
    isCheckingApproval ||
    isApprovalPending ||
    isApprovalConfirming ||
    isDepositPending ||
    isDepositConfirming

  useEffect(() => {
    if (isDepositConfirmed) onFinish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDepositConfirmed])

  return (
    <div className='flex items-center p-6 border-b border-gray-100'>
      <Link href={`/nfts/${asset.nft_id}`} target='_blank' className='w-12 h-12 relative'>
        <NFTImage src={asset?.image} alt={asset?.name} fallback={asset?.name} rounded='all' />
        {isDeposited && (
          <div className='absolute -right-1 -bottom-1 bg-green-500 rounded-full p-1'>
            <Checkmark className='w-3 h-3 text-white' />
          </div>
        )}
      </Link>

      <div className='ml-3 flex-1 flex flex-col gap-y-1'>
        <div className='flex items-center gap-x-2'>
          <p className='text-sm font-medium text-gray-900'>{asset.name}</p>
          {isDeposited && (
            <span className='px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full'>
              Deposited
            </span>
          )}
        </div>
        <p className='text-xs text-gray-500'>Token ID: {asset.token_id}</p>
      </div>

      {isDeposited ? (
        <div className='flex items-center text-green-600 gap-x-1.5'>
          <Checkmark className='w-4 h-4' />
          <span className='text-sm font-medium'>Complete</span>
        </div>
      ) : (
        <button
          onClick={onClickDeposit}
          disabled={isLoading || needsApproval === null}
          className={`
            px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
            flex items-center gap-x-2 min-w-[140px] justify-center
            ${
              isLoading
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : needsApproval
                  ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 active:bg-yellow-200'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200'
            }
          `}
        >
          {isLoading && (
            <LoadingIndicator className='!w-4 !h-4 !border-[2px] !border-gray-500 !border-t-transparent' />
          )}
          <span>{getButtonText()}</span>
        </button>
      )}
    </div>
  )
}

export default DepositCard
