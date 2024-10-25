import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { useCancelTrade, useDepositAsset } from '@/hooks'
import useTradeAssetsInfo from '@/hooks/useTradeAssetsInfo'
import { ChainLogo, Checkmark, ChevronDown, ChevronUp, Close, Upload } from '@/icons'

interface Asset {
  id: string
  name: string
  image: string
  uploaded: boolean
  collection_contract: string
  token_id: string
  token_type: string
}

interface User {
  username: string
  profile_pic_url: string
}

interface Offer {
  user: Asset[]
  userCounter: Asset[]
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
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([])
  const [uploadStep, setUploadStep] = useState<'idle' | 'approving' | 'depositing'>('idle')
  const [isWarningExpanded, setIsWarningExpanded] = useState(false)

  const tradeId = BigInt(info.onchain_trade_id)
  const { tradeInfo, isLoading, isError, refetch } = useTradeAssetsInfo(info.onchain_trade_id)

  const {
    depositAsset,
    isApproving,
    isConfirming: isDepositConfirming,
    isConfirmed: isDepositConfirmed,
    errorReason,
  } = useDepositAsset(tradeId)

  const {
    cancelTrade,
    isConfirming: isCancelConfirming,
    isConfirmed: isCancelConfirmed,
  } = useCancelTrade(tradeId)

  useEffect(() => {
    if (isApproving) setUploadStep('approving')
    else if (isDepositConfirming) setUploadStep('depositing')
    else setUploadStep('idle')
  }, [isApproving, isDepositConfirming])

  const handleBulkUpload = async () => {
    // ... (keep the existing logic)
  }

  const toggleAssetSelection = (asset: Asset) => {
    setSelectedAssets((prev) =>
      prev.some((a) => a.id === asset.id)
        ? prev.filter((a) => a.id !== asset.id)
        : [...prev, asset],
    )
  }

  const toggleGrid = (key: string) => {
    setExpandedGrids((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const renderWarningSection = () => (
    <div className='bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg text-yellow-700 p-2.5 text-xs'>
      <div
        className='flex justify-between items-center cursor-pointer'
        onClick={() => setIsWarningExpanded(!isWarningExpanded)}
      >
        <p className='font-semibold'>Verify all NFTs before depositing.</p>
        {isWarningExpanded ? (
          <ChevronUp className='w-4 h-4' />
        ) : (
          <ChevronDown className='w-4 h-4' />
        )}
      </div>
      {isWarningExpanded && (
        <div className='mt-1.5'>
          <p className='mb-1.5'>
            Once all NFTs are deposited, the contract automatically sends them to the
            counterparty. Cancelling before all NFTs are deposited will return them to their
            original owners.
          </p>
          <Link
            href='https://www.google.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-800 transition-colors text-xs'
          >
            Verify on Etherscan
          </Link>
        </div>
      )}
    </div>
  )

  const renderAssetItem = (asset: Asset) => {
    const isSelected = selectedAssets.some((a) => a.id === asset.id)

    return (
      <div
        key={asset.id}
        className={`flex items-center p-2.5 bg-white rounded-md shadow-sm mb-1.5 ${isSelected && !asset.uploaded ? 'ring-1 ring-blue-500' : ''} ${!asset.uploaded ? 'cursor-pointer hover:bg-gray-50' : ''}`}
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
            <Checkmark className='w-3 h-3 mr-1' /> Deposited
          </span>
        )}
      </div>
    )
  }

  const renderAssetGrid = (assets: Asset[], user: User, isCurrentUser: boolean) => {
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
          {isExpanded ? (
            <ChevronUp className='w-4 h-4 text-gray-500' />
          ) : (
            <ChevronDown className='w-4 h-4 text-gray-500' />
          )}
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
          <ChainLogo chainId={1} className='w-8 h-8' />
          <h2 className='text-xl font-bold text-gray-800'>Swap</h2>
        </div>
        <button
          onClick={closeModal}
          className='text-gray-500 hover:text-gray-700 transition-colors'
        >
          <Close className='w-5 h-5' />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-3 space-y-3'>
        {renderWarningSection()}

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
          onClick={handleBulkUpload}
          disabled={selectedAssets.length === 0 || uploadStep !== 'idle'}
          className={`w-full px-3 py-2.5 ${
            selectedAssets.length === 0 || uploadStep !== 'idle'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-md transition-colors font-semibold flex items-center justify-center text-sm`}
        >
          <Upload className='w-4 h-4 mr-1.5' />
          {uploadStep === 'approving'
            ? 'Approving...'
            : uploadStep === 'depositing'
              ? 'Depositing...'
              : `Deposit Selected (${selectedAssets.length})`}
        </button>

        <div className='text-xs text-gray-600 text-center mt-1.5'>
          {uploadStep === 'approving' && 'Step 1/2: Approving transfers'}
          {uploadStep === 'depositing' && 'Step 2/2: Depositing assets'}
        </div>

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
    </div>
  )
}

export default Transaction
