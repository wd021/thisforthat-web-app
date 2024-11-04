import React, { useState } from 'react'
import Header from './header'
import { TransactionData } from '@/types/supabase'
import { OnchainTradeInfo } from '@/types/main'

// Icon Components
const Icons = {
  Lock: () => (
    <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
      />
    </svg>
  ),
  Copy: () => (
    <svg className='w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
      />
    </svg>
  ),
  ExternalLink: () => (
    <svg className='w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
      />
    </svg>
  ),
  SwapArrow: () => (
    <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
      />
    </svg>
  ),
  Wallet: () => (
    <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
      />
    </svg>
  ),
}

// Helper Components
const NFTCard = ({ asset, isDeposited, recipient, onCopy }) => {
  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className='flex items-center p-4 bg-white rounded-lg border border-gray-100'>
      <div className='relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0'>
        <img src={asset.image} alt={asset.name} className='w-full h-full object-cover' />
      </div>

      <div className='flex-grow ml-4'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-y-0.5'>
            <h3 className='text-sm font-medium'>{asset.name}</h3>
            <p className='text-xs text-gray-500 mt-0.5'>{asset.collection_name}</p>
            <div className='flex items-center space-x-2'>
              <span className='text-xs text-gray-500'>Sending to:</span>
              <div className='flex items-center space-x-1.5 text-xs'>
                {truncateAddress(recipient)}
              </div>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm ${
              isDeposited ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isDeposited ? 'Deposited' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  )
}

const TradeSection = ({ username, assets, onchainInfo }) => {
  const depositedCount = assets.reduce((count, asset) => {
    const onchainAsset = onchainInfo.assets.find((a) => a.tokenId.toString() === asset.token_id)
    return onchainAsset?.isDeposited ? count + 1 : count
  }, 0)

  return (
    <div className='p-6 rounded-xl bg-gray-50/90 space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500'>
            <Icons.Lock />
          </div>
          <div>
            <h2 className='text-base font-semibold'>{username}</h2>
            <p className='text-sm text-gray-600'>
              {depositedCount} of {assets.length} deposited
            </p>
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        {assets.map((asset) => {
          const onchainAsset = onchainInfo.assets.find(
            (a) => a.tokenId.toString() === asset.token_id,
          )
          return (
            <NFTCard
              key={asset.nft_id}
              asset={asset}
              isDeposited={onchainAsset?.isDeposited}
              recipient={onchainAsset?.recipient}
              onCopy={(text) => navigator.clipboard.writeText(text)}
            />
          )
        })}
      </div>
    </div>
  )
}

const Transaction: React.FC<{
  fullPage?: boolean
  transaction: TransactionData
  onchainInfo: OnchainTradeInfo
  showTxModal: () => void
}> = ({ fullPage = false, transaction, onchainInfo, showTxModal }) => {
  const [isExpanded, setIsExpanded] = useState(fullPage)

  const handleClick = () => {
    if (!fullPage) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div
      className={`p-6 w-full bg-white rounded-xl shadow-sm ${!fullPage ? 'hover:shadow-lg cursor-pointer' : ''} transition-all duration-200 space-y-4`}
      onClick={handleClick}
    >
      <Header
        fullPage={fullPage}
        transaction={transaction}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      {/* Compact View */}
      {!isExpanded && (
        <div className='bg-gray-50 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='flex -space-x-2'>
                {transaction.creator_assets.map((asset) => (
                  <div
                    key={asset.nft_id}
                    className='w-12 h-12 rounded-lg overflow-hidden ring-2 ring-white'
                  >
                    <img
                      src={asset.image}
                      alt={asset.name}
                      className='w-full h-full object-cover'
                    />
                  </div>
                ))}
              </div>
              <div className='p-2 bg-white rounded-full shadow-sm'>
                <Icons.SwapArrow />
              </div>
              <div className='flex -space-x-2'>
                {transaction.counterparty_assets.map((asset) => (
                  <div
                    key={asset.nft_id}
                    className='w-12 h-12 rounded-lg overflow-hidden ring-2 ring-white'
                  >
                    <img
                      src={asset.image}
                      alt={asset.name}
                      className='w-full h-full object-cover'
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className='space-y-4'>
          <TradeSection
            username={transaction.creator_username}
            assets={transaction.creator_assets}
            onchainInfo={onchainInfo}
          />
          <TradeSection
            username={transaction.counterparty_username}
            assets={transaction.counterparty_assets}
            onchainInfo={onchainInfo}
          />
        </div>
      )}

      {/* Progress Bar and Action Button */}
      <div className='flex items-center justify-between'>
        <div className='flex-1 mr-8 max-w-[300px]'>
          {onchainInfo ? (
            <>
              <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-green-500 transition-all duration-500'
                  style={{
                    width: `${(onchainInfo.depositedAssetCount / onchainInfo.totalAssetCount) * 100}%`,
                  }}
                />
              </div>
              <div className='flex justify-between mt-2'>
                <span className='text-xs text-gray-500'>Progress</span>
                <span className='text-xs text-gray-500'>
                  {onchainInfo.depositedAssetCount} of {onchainInfo.totalAssetCount} assets
                  deposited
                </span>
              </div>
            </>
          ) : (
            <div>loading...</div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            showTxModal()
          }}
          className='flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors'
        >
          <Icons.Wallet />
          Create Trade
        </button>
      </div>
    </div>
  )
}

export default Transaction
