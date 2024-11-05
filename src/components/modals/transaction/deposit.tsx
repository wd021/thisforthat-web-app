import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useDepositAsset } from '@/hooks'
import { SimplifiedNFTAsset } from '@/types/supabase'
import { NFTImage } from '@/components/shared'
import { DepositAsset } from '@/types/main'

const DepositTx = ({
  assets,
  tradeId,
  onFinish,
}: {
  assets: SimplifiedNFTAsset[]
  tradeId: bigint
  onFinish?: () => void
}) => {
  const [selectedAssets, setSelectedAssets] = useState<SimplifiedNFTAsset[]>([])
  const [remainingAssets, setRemainingAssets] = useState<SimplifiedNFTAsset[]>(assets)
  const [isDepositing, setIsDepositing] = useState(false)

  useEffect(() => {
    setRemainingAssets(assets)
  }, [assets])

  const {
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
  } = useDepositAsset(tradeId)

  const toggleAssetSelection = (asset: SimplifiedNFTAsset) => {
    setSelectedAssets((prev) =>
      prev.some((a) => a.nft_id === asset.nft_id)
        ? prev.filter((a) => a.nft_id !== asset.nft_id)
        : [...prev, asset],
    )
  }

  // Handle successful deposit
  useEffect(() => {
    if (isConfirmed && isDepositing) {
      setRemainingAssets((prev) =>
        prev.filter(
          (asset) => !selectedAssets.some((selected) => selected.nft_id === asset.nft_id),
        ),
      )
      setSelectedAssets([])
      setIsDepositing(false)
      resetStates()

      // If all assets are deposited, trigger onFinish
      if (remainingAssets.length === selectedAssets.length) {
        onFinish?.()
      }
    }
  }, [isConfirmed, isDepositing, selectedAssets, onFinish])

  const handleDeposit = async () => {
    try {
      const isApproved = await checkAndApproveAssets(
        selectedAssets as unknown as DepositAsset[],
      )
      if (isApproved) {
        setIsDepositing(true)
        console.log('go and deposit?')
        await depositAssets(selectedAssets as unknown as DepositAsset[])
      }
    } catch (error) {
      setIsDepositing(false)
      resetStates()
    }
  }

  return (
    <div className='w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-y-auto hide-scrollbar'>
      {/* Header */}
      <div className='p-4 border-b border-gray-200'>
        <h2 className='text-lg font-semibold'>Deposit Assets</h2>
      </div>

      {/* Content */}
      <div className='p-4'>
        {/* Deposit Section */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
          <div className='p-4'>
            <p className='text-sm text-gray-600 mb-4'>
              Select the assets to deposit. If they are in the same wallet, you can select them
              together.
            </p>

            {/* Asset Selection Grid */}
            <div className='space-y-2 mb-4'>
              {remainingAssets.map((asset) => (
                <div
                  key={asset.nft_id}
                  onClick={() => toggleAssetSelection(asset)}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedAssets.some((a) => a.nft_id === asset.nft_id)
                      ? 'bg-blue-50 border-blue-500'
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <div className='w-12 h-12'>
                    <NFTImage
                      src={asset?.image}
                      alt={asset?.name}
                      fallback={asset?.name}
                      rounded='all'
                    />
                  </div>
                  <div className='ml-2 flex-1 flex flex-col gap-y-1 truncate'>
                    <p className='text-sm font-medium text-gray-900'>{asset.name}</p>
                    <p className='text-xs text-gray-500 truncate'>Token ID: {asset.token_id}</p>
                  </div>
                  <input
                    type='checkbox'
                    checked={selectedAssets.some((a) => a.nft_id === asset.nft_id)}
                    onChange={() => {}}
                    className='h-4 w-4 text-blue-500 rounded border-gray-300 mr-3'
                  />
                </div>
              ))}
            </div>

            {/* Button and Status Area */}
            <div className='space-y-3'>
              <button
                onClick={handleDeposit}
                disabled={
                  selectedAssets.length === 0 ||
                  isProcessingApproval ||
                  isProcessingDeposit ||
                  isConfirming
                }
                className={`w-full p-4 rounded-md transition-all duration-200 ${
                  selectedAssets.length === 0 ||
                  isProcessingApproval ||
                  isProcessingDeposit ||
                  isConfirming
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                }`}
              >
                {selectedAssets.length === 0
                  ? 'Select assets to deposit'
                  : 'Deposit Selected Assets'}
              </button>

              {/* Transaction Status */}
              {(isProcessingApproval ||
                isProcessingDeposit ||
                isConfirming ||
                transactionStatus === 'pending') && (
                <div className='flex items-center justify-center text-sm text-blue-600 bg-blue-50 p-3 rounded-md'>
                  <svg className='animate-spin h-4 w-4 mr-2' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  {isProcessingApproval && 'Checking and approving assets...'}
                  {isProcessingDeposit && 'Preparing deposit...'}
                  {isConfirming && 'Waiting for confirmation...'}
                  {transactionStatus === 'pending' && 'Transaction pending...'}
                </div>
              )}

              {/* Error Messages */}
              {(writeError || confirmError) && (
                <div className='flex items-center justify-center text-sm text-red-600 bg-red-50 p-3 rounded-md'>
                  <span className='mr-2'>⚠️</span>
                  {writeError
                    ? writeError instanceof Error
                      ? writeError.message
                      : 'Transaction failed'
                    : confirmError instanceof Error
                      ? confirmError.message
                      : 'Transaction confirmation failed'}
                </div>
              )}
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
      </div>
    </div>
  )
}

export default DepositTx
