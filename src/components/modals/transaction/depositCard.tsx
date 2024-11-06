import { NFTImage } from '@/components/shared'
import { useDepositSingleAsset } from '@/hooks/useDepositSingleAsset'
import { SimplifiedNFTAsset } from '@/types/supabase'
import { Address } from 'viem'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'
import { AssetType } from '@/types/main'
import { useEffect, useState } from 'react'
import { useApproveAsset } from '@/hooks/useApproveAsset'
import { useDepositAsset } from '@/hooks/useDepositAsset'

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

  // Reset approval state when approval is confirmed
  useEffect(() => {
    if (isApprovalConfirmed) {
      setNeedsApproval(false)
    }
  }, [isApprovalConfirmed])

  const onClickDeposit = async () => {
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
    if (isApprovalPending || isApprovalConfirming) return 'Approving...'
    if (isDepositPending || isDepositConfirming) return 'Depositing...'
    return needsApproval ? 'Approve Asset' : 'Deposit Asset'
  }

  useEffect(() => {
    if (isDepositConfirmed) onFinish()
  }, [isDepositConfirmed])

  return (
    <div key={asset.nft_id} className='flex items-center p-6'>
      <div className='w-12 h-12'>
        <NFTImage src={asset?.image} alt={asset?.name} fallback={asset?.name} rounded='all' />
      </div>
      <div className='ml-2 flex-1 flex flex-col gap-y-1 truncate'>
        <p className='text-sm font-medium text-gray-900'>{asset.name}</p>
        <p className='text-xs text-gray-500 truncate'>Token ID: {asset.token_id}</p>
      </div>
      {isDeposited ? (
        <div>deposited</div>
      ) : (
        <button
          onClick={onClickDeposit}
          disabled={
            isCheckingApproval ||
            isApprovalPending ||
            isApprovalConfirming ||
            isDepositPending ||
            isDepositConfirming ||
            needsApproval === null
          }
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
            ${
              isCheckingApproval ||
              isApprovalPending ||
              isApprovalConfirming ||
              isDepositPending ||
              isDepositConfirming
                ? 'bg-gray-100 text-gray-500'
                : needsApproval
                  ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
        >
          {getButtonText()}
        </button>
      )}
    </div>
  )
}

export default DepositCard
