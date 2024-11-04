import React, { useEffect, useState } from 'react'

import { useDepositAsset } from '@/hooks'
import { SimplifiedNFTAsset } from '@/types/supabase'

const DepositTx = ({
  assets,
  currentUser,
  counterpartyUser,
  tradeId,
}: {
  assets: SimplifiedNFTAsset[]
  currentUser: { name: string }
  counterpartyUser: { name: string }
  tradeId: bigint
}) => {
  const [selectedAssets, setSelectedAssets] = useState<SimplifiedNFTAsset[]>([])
  const [needsApproval, setNeedsApproval] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)

  const {
    depositAsset,
    batchDepositAssets,
    isApproving,
    isConfirming: isDepositConfirming,
    errorReason,
    checkBatchApprovals,
    approveAsset,
    approveBatchAssets,
  } = useDepositAsset(tradeId)

  // Check if selected assets need approval
  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (selectedAssets.length === 0) return
      const approvalStatuses = await checkBatchApprovals(selectedAssets)
      setNeedsApproval(approvalStatuses.some(({ isApproved }) => !isApproved))
    }
    checkApprovalStatus()
  }, [selectedAssets, checkBatchApprovals])

  const handleApprove = async () => {
    try {
      if (selectedAssets.length > 1) {
        await approveBatchAssets(selectedAssets)
      } else {
        await approveAsset(selectedAssets[0])
      }
      setNeedsApproval(false)
    } catch (error) {
      console.error('Approval error:', error)
    }
  }

  const handleDeposit = async () => {
    try {
      if (selectedAssets.length > 1) {
        await batchDepositAssets(selectedAssets)
      } else {
        await depositAsset(selectedAssets[0])
      }
      setSelectedAssets([])
    } catch (error) {
      console.error('Deposit error:', error)
    }
  }

  const toggleAssetSelection = (asset: SimplifiedNFTAsset) => {
    setSelectedAssets((prev) =>
      prev.some((a) => a.nft_id === asset.nft_id)
        ? prev.filter((a) => a.nft_id !== asset.nft_id)
        : [...prev, asset],
    )
  }

  return (
    <div className='w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden'>
      {/* Header */}
      <div className='p-4 border-b border-gray-200'>
        <h2 className='text-lg font-semibold'>Complete Your Swap</h2>
        <p className='text-sm text-gray-600 mt-1'>
          Follow these steps to complete the swap safely
        </p>
      </div>

      {/* Content */}
      <div className='p-4'>
        {/* Deposit Section */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
          <div className='p-4'>
            <h3 className='font-medium mb-2'>Deposit Assets</h3>
            <p className='text-sm text-gray-600 mb-4'>
              Both parties need to deposit their assets to complete the swap
            </p>

            {/* Asset Selection Grid */}
            <div className='space-y-2 mb-4'>
              {assets.map((asset) => (
                <div
                  key={asset.nft_id}
                  onClick={() => !asset.deposited && toggleAssetSelection(asset)}
                  className={`flex items-center p-3 rounded-lg border ${
                    asset.deposited
                      ? 'bg-gray-50 border-gray-200'
                      : selectedAssets.some((a) => a.nft_id === asset.nft_id)
                        ? 'bg-blue-50 border-blue-500'
                        : 'border-gray-200 hover:border-blue-500 cursor-pointer'
                  }`}
                >
                  <input
                    type='checkbox'
                    checked={
                      selectedAssets.some((a) => a.nft_id === asset.nft_id) || asset.deposited
                    }
                    onChange={() => {}}
                    disabled={asset.deposited}
                    className='h-4 w-4 text-blue-500 rounded border-gray-300 mr-3'
                  />
                  <div className='w-12 h-12 bg-gray-200 rounded-lg mr-3' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>{asset.name}</p>
                    <p className='text-xs text-gray-500'>Token ID: {asset.tokenId}</p>
                  </div>
                  {asset.deposited && (
                    <span className='text-green-500 text-sm flex items-center'>
                      <svg className='w-4 h-4 mr-1' viewBox='0 0 20 20' fill='currentColor'>
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Deposited
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {selectedAssets.length > 0 && (
              <div className='mt-4'>
                {needsApproval ? (
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                      isApproving
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isApproving ? 'Approving...' : 'Approve Selected Assets'}
                  </button>
                ) : (
                  <button
                    onClick={handleDeposit}
                    disabled={isDepositConfirming}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                      isDepositConfirming
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isDepositConfirming
                      ? 'Depositing...'
                      : `Deposit Selected (${selectedAssets.length})`}
                  </button>
                )}
              </div>
            )}

            {/* Counterparty Status */}
            <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 bg-gray-200 rounded-full' />
                  <div>
                    <p className='font-medium'>{counterpartyUser.name}</p>
                    <p className='text-sm text-gray-500'>Waiting for deposit</p>
                  </div>
                </div>
                <div className='flex items-center text-gray-500'>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                    />
                  </svg>
                  Waiting
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className='bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6'>
          <div className='flex items-center text-sm text-blue-700'>
            <svg className='h-5 w-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z'
                clipRule='evenodd'
              />
            </svg>
            NFTs will be held securely until both parties complete their deposits
          </div>
        </div>

        {/* Footer Text */}
        <p className='text-sm text-gray-600'>
          This swap is secured by a smart contract. Assets will be exchanged automatically once
          both deposits are complete.
        </p>
      </div>
    </div>
  )
}

export default DepositTx
