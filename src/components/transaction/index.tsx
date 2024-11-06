import React, { useState } from 'react'
import Link from 'next/link'

import { useCompleteTrade } from '@/hooks/supabase'
import { Expand } from '@/icons'
import { OnchainTradeInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'

import Footer from './footer'
import Header from './header'

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

const StatusBadge: React.FC<{ status: string; isDeposited?: boolean }> = ({
  status,
  isDeposited,
}) => {
  if (status === 'onchain_completed' || status === 'onchain_cancelled') {
    return (
      <span
        className={`px-3 py-1.5 rounded-full text-sm ${
          status === 'onchain_completed'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-600'
        }`}
      >
        {status === 'onchain_completed' ? 'completed' : 'cancelled'}
      </span>
    )
  }

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-sm ${
        isDeposited ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {isDeposited ? 'Deposited' : 'Pending'}
    </span>
  )
}

const NFTCard: React.FC<{
  asset: Asset
  isCompleted: boolean
  status: string
  isDeposited?: boolean
  recipient?: string
}> = ({ asset, isCompleted, status, isDeposited, recipient }) => {
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
            {!isCompleted && recipient && (
              <div className='flex items-center space-x-2'>
                <span className='text-xs text-gray-500'>Sending to:</span>
                <div className='flex items-center space-x-1.5 text-xs'>
                  {truncateAddress(recipient)}
                </div>
              </div>
            )}
          </div>
          <StatusBadge status={status} isDeposited={isDeposited} />
        </div>
      </div>
    </div>
  )
}

const CompactView: React.FC<{
  creatorAssets: Asset[]
  counterpartyAssets: Asset[]
}> = ({ creatorAssets, counterpartyAssets }) => (
  <div className='bg-gray-50 rounded-lg p-4'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-4'>
        <AssetPreviewGroup assets={creatorAssets} />
        <div className='p-2 bg-white rounded-full shadow-sm'>
          <Icons.SwapArrow />
        </div>
        <AssetPreviewGroup assets={counterpartyAssets} />
      </div>
    </div>
  </div>
)

const AssetPreviewGroup: React.FC<{ assets: Asset[] }> = ({ assets }) => (
  <div className='flex -space-x-2'>
    {assets.map((asset) => (
      <div
        key={asset.nft_id}
        className='w-12 h-12 rounded-lg overflow-hidden ring-2 ring-white'
      >
        <img src={asset.image} alt={asset.name} className='w-full h-full object-cover' />
      </div>
    ))}
  </div>
)

const TradeSection: React.FC<{
  username: string
  assets: Asset[]
  onchainInfo?: OnchainTradeInfo
  status: string
}> = ({ username, assets, onchainInfo, status }) => {
  const isCompleted = status === 'onchain_cancelled' || status === 'onchain_completed'

  const depositedCount = onchainInfo
    ? assets.reduce((count, asset) => {
        const onchainAsset = onchainInfo.assets.find(
          (a) => a.tokenId.toString() === asset.token_id,
        )
        return onchainAsset?.isDeposited ? count + 1 : count
      }, 0)
    : 0

  return (
    <div className='p-6 rounded-xl bg-gray-50/90 space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500'>
            <Icons.Lock />
          </div>
          <div>
            <h2 className='text-base font-semibold'>{username}</h2>
            {!isCompleted && (
              <p className='text-sm text-gray-600'>
                {depositedCount} of {assets.length} deposited
              </p>
            )}
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        {assets.map((asset) => {
          const onchainAsset = onchainInfo?.assets.find(
            (a) => a.tokenId.toString() === asset.token_id,
          )
          return (
            (onchainAsset || isCompleted) && (
              <NFTCard
                key={asset.nft_id}
                asset={asset}
                isCompleted={isCompleted}
                status={status}
                isDeposited={onchainAsset?.isDeposited}
                recipient={onchainAsset?.recipient}
              />
            )
          )
        })}
      </div>
    </div>
  )
}

const Transaction: React.FC<{
  fullPage?: boolean
  transaction: TransactionData
  onchainStatusLoading: boolean
  onchainInfo: OnchainTradeInfo
  showTxModal: () => void
}> = ({ fullPage = false, transaction, onchainInfo, showTxModal }) => {
  const [isExpanded, setIsExpanded] = useState(fullPage)

  // const { isConfirming, isConfirmed, hasError, retry } = useCompleteTrade(
  //   onchainInfo,
  //   transaction,
  // )

  const handleClick = () => {
    if (!fullPage) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div
      className={`p-6 w-full bg-white rounded-xl shadow-sm 
        ${!fullPage ? 'hover:shadow-lg cursor-pointer' : ''} 
        transition-all duration-200 space-y-4`}
      onClick={handleClick}
    >
      <Header
        fullPage={fullPage}
        transaction={transaction}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      {!isExpanded && (
        <CompactView
          creatorAssets={transaction.creator_assets}
          counterpartyAssets={transaction.counterparty_assets}
        />
      )}

      {isExpanded && (
        <>
          <div className='flex flex-col text-sm gap-y-2 ml-2'>
            <Link
              href={`/transactions/${transaction.offer_id}`}
              target='_blank'
              className='text-gray-500 hover:text-gray-900 flex items-center gap-0.5'
            >
              <span>Link to Offer</span>
              <Expand />
            </Link>
            <Link
              href='https://www.etherscan.io'
              target='_blank'
              className='text-gray-500 hover:text-gray-900 flex items-center gap-0.5'
            >
              <span>Onchain Contract</span>
              <Expand />
            </Link>
          </div>

          <div className='space-y-4'>
            <TradeSection
              username={transaction.creator_username}
              assets={transaction.creator_assets}
              onchainInfo={onchainInfo}
              status={transaction.status}
            />
            <TradeSection
              username={transaction.counterparty_username}
              assets={transaction.counterparty_assets}
              onchainInfo={onchainInfo}
              status={transaction.status}
            />
          </div>
        </>
      )}

      <Footer transaction={transaction} onchainInfo={onchainInfo} showTxModal={showTxModal} />
    </div>
  )
}

export default Transaction
