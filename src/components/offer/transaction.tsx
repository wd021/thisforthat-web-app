import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { useCancelTrade, useDepositAsset, useTradeInfo } from '@/hooks'
import { ChainLogo, Checkmark, ChevronDown, ChevronUp, Close, Upload } from '@/icons'
import { DepositAsset } from '@/types/main'

import DepositProcessOverlay from './transactionDepositOverlay'

interface User {
  username: string
  profile_pic_url: string
}

interface Offer {
  user: DepositAsset[]
  userCounter: DepositAsset[]
}

interface TradeInfo {
  user: User
  counter_user: User
  offer: Offer
  onchain_trade_id: string
}

interface Props {
  info: TradeInfo
  closeModal: () => void
  onBackToChat: () => void
  onCancelTrade: () => void
}

const Transaction: React.FC<Props> = ({ info, closeModal, onBackToChat, onCancelTrade }) => {
  const [expandedGrids, setExpandedGrids] = useState<{ [key: string]: boolean }>({
    user: true,
    counterparty: true,
  })
  const [selectedAssets, setSelectedAssets] = useState<DepositAsset[]>([])
  const [showDepositOverlay, setShowDepositOverlay] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)

  const tradeId = BigInt(info.onchain_trade_id)
  const { tradeInfo, isLoading, refetch } = useTradeInfo(info.onchain_trade_id)

  console.log('tradeInfo', tradeInfo)

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

  const { cancelTrade, isConfirming: isCancelConfirming } = useCancelTrade(tradeId)

  // Effect to check if selected assets need approval when they change
  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (selectedAssets.length === 0) return
      const approvalStatuses = await checkBatchApprovals(selectedAssets)
      setNeedsApproval(approvalStatuses.some(({ isApproved }) => !isApproved))
    }
    checkApprovalStatus()
  }, [selectedAssets, checkBatchApprovals])

  const handleDepositClick = () => {
    setShowDepositOverlay(true)
  }

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
      setShowDepositOverlay(false)
      setSelectedAssets([])
      refetch() // Refresh trade info after deposit
    } catch (error) {
      console.error('Deposit error:', error)
    }
  }

  const toggleAssetSelection = (asset: DepositAsset) => {
    setSelectedAssets((prev) =>
      prev.some((a) => a.id === asset.id)
        ? prev.filter((a) => a.id !== asset.id)
        : [...prev, asset],
    )
  }

  const toggleGrid = (key: string) => {
    setExpandedGrids((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const renderAssetItem = (asset: DepositAsset) => {
    const isSelected = selectedAssets.some((a) => a.id === asset.id)

    return (
      <div
        key={asset.id}
        className={`flex items-center p-2.5 bg-white rounded-md shadow-sm mb-1.5 ${
          isSelected && !asset.uploaded ? 'ring-1 ring-blue-500' : ''
        } ${!asset.uploaded ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={() => !asset.uploaded && toggleAssetSelection(asset)}
      >
        <input
          type='checkbox'
          checked={isSelected}
          onChange={() => {}}
          className='mr-2.5'
          disabled={asset.uploaded}
        />
        <img
          src={asset.image}
          alt={asset.name}
          className='w-10 h-10 object-cover rounded-md mr-2.5'
        />
        <div className='flex-grow'>
          <div className='text-sm font-medium text-gray-800'>{asset.name}</div>
          <div className='text-xs text-gray-500'>
            Token ID: {asset.token_id.substring(0, 6)}...
          </div>
        </div>
        {asset.uploaded && (
          <span className='text-green-500 text-xs flex items-center'>
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
    )
  }

  const renderAssetGrid = (assets: DepositAsset[], user: User, isCurrentUser: boolean) => {
    const gridKey = isCurrentUser ? 'user' : 'counterparty'
    const isExpanded = expandedGrids[gridKey]
    const depositedCount = assets.filter((a) => a.uploaded).length

    return (
      <div className='bg-gray-50 rounded-md shadow p-3'>
        <div
          className='flex items-center justify-between cursor-pointer'
          onClick={() => toggleGrid(gridKey)}
        >
          <div className='flex items-center space-x-2.5'>
            <img
              src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user.profile_pic_url}
              alt={user.username}
              className='w-7 h-7 rounded-full'
            />
            <div className='font-medium text-sm text-gray-800'>
              {user.username} ({depositedCount}/{assets.length} deposited)
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </div>
        {isExpanded && <div className='mt-2.5 space-y-1.5'>{assets.map(renderAssetItem)}</div>}
      </div>
    )
  }

  const totalAssets = info.offer.user.length + info.offer.userCounter.length
  const uploadedAssets =
    info.offer.user.filter((a) => a.uploaded).length +
    info.offer.userCounter.filter((a) => a.uploaded).length
  const progress = (uploadedAssets / totalAssets) * 100

  return (
    <div className='bg-gray-100 rounded-xl shadow-xl max-w-2xl w-full h-[90vh] flex flex-col overflow-hidden'>
      <div className='bg-white p-3 flex items-center justify-between shadow-sm'>
        <div className='flex items-center space-x-2.5'>
          <img src='/chain-icon.png' alt='Chain' className='w-8 h-8' />
          <h2 className='text-xl font-bold text-gray-800'>Swap</h2>
        </div>
        <button
          onClick={closeModal}
          className='text-gray-500 hover:text-gray-700 transition-colors'
        >
          <svg className='w-5 h-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-3 space-y-3'>
        <div className='bg-white p-2.5 rounded-md shadow-sm'>
          <div className='flex justify-between items-center mb-1.5 text-xs font-medium text-gray-700'>
            <span>
              Total Progress: {uploadedAssets}/{totalAssets} deposited
            </span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out'
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className='space-y-3'>
          {renderAssetGrid(info.offer.user, info.user, true)}
          {renderAssetGrid(info.offer.userCounter, info.counter_user, false)}
        </div>
      </div>

      <div className='bg-white p-3 border-t border-gray-200'>
        <button
          onClick={handleDepositClick}
          disabled={selectedAssets.length === 0 || isDepositConfirming}
          className={`w-full px-3 py-2.5 ${
            selectedAssets.length === 0 || isDepositConfirming
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-md transition-colors font-semibold flex items-center justify-center text-sm`}
        >
          <svg className='w-4 h-4 mr-1.5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z'
              clipRule='evenodd'
            />
          </svg>
          {`Deposit Selected (${selectedAssets.length})`}
        </button>

        <div className='flex justify-between mt-2.5'>
          <button
            onClick={onBackToChat}
            className='px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors font-medium text-xs'
          >
            Back to Chat
          </button>
          <button
            onClick={onCancelTrade}
            disabled={isCancelConfirming}
            className={`px-3 py-1.5 ${
              isCancelConfirming
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800'
            } rounded-md transition-colors font-medium text-xs`}
          >
            Cancel Trade
          </button>
        </div>
      </div>

      {showDepositOverlay && (
        <DepositProcessOverlay
          selectedAssets={selectedAssets}
          isApproving={isApproving}
          isDepositing={isDepositConfirming}
          needsApproval={needsApproval}
          error={errorReason}
          onCancel={() => !isApproving && !isDepositConfirming && setShowDepositOverlay(false)}
          onApprove={handleApprove}
          onDeposit={handleDeposit}
        />
      )}
    </div>
  )
}

export default Transaction
