import React, { useState } from 'react'
import Link from 'next/link'

import { useSyncApiWithChain } from '@/hooks/supabase'
import { Expand } from '@/icons'
import { OnchainTradeInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'

import { NFTImage } from '../shared'

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

const StatusBadge = ({ status, isDeposited }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs ${
      status === 'onchain_completed'
        ? 'bg-green-100 text-green-700'
        : status === 'onchain_cancelled'
          ? 'bg-red-100 text-red-600'
          : isDeposited
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600'
    }`}
  >
    {status === 'onchain_completed'
      ? 'completed'
      : status === 'onchain_cancelled'
        ? 'cancelled'
        : isDeposited
          ? 'Deposited'
          : 'Pending'}
  </span>
)

const NFTCard = ({ asset }) => (
  <Link
    href={`/nfts/${asset.nft_id}`}
    target='_blank'
    className='flex items-center p-2 bg-white rounded-lg border border-gray-100'
  >
    <div className='w-12 h-12 rounded-lg object-cover'>
      <NFTImage src={asset.image} alt={asset.name} fallback={asset.name} rounded='all' />
    </div>
    <div className='flex-grow ml-3'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-y-0.5'>
          <h3 className='text-sm font-medium'>{asset.name}</h3>
          <p className='text-xs text-gray-500'>{asset.collection_name}</p>
        </div>
      </div>
    </div>
  </Link>
)

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
      <div key={asset.nft_id} className='w-12 h-12'>
        <NFTImage
          src={asset.image}
          alt={asset.name}
          fallback={asset.name}
          rounded='all'
          rings={true}
        />
      </div>
    ))}
  </div>
)

const TradeSection = ({ username, profilePic, assets, onchainInfo, status }) => {
  const isCompleted = status === 'onchain_cancelled' || status === 'onchain_completed'
  const depositedCount = assets.reduce((count, asset) => {
    const isDeposited = onchainInfo?.assets.some(
      (onchainAsset) =>
        onchainAsset.token.toLowerCase() === asset.collection_contract.toLowerCase() &&
        onchainAsset.tokenId.toString() === asset.token_id &&
        onchainAsset.isDeposited,
    )
    return isDeposited ? count + 1 : count
  }, 0)

  return (
    <div className='p-3 rounded-lg bg-gray-50 space-y-2 w-full'>
      <div className='flex items-center gap-2 mb-2'>
        <Link href={`/${username}`} target='_blank'>
          <img
            src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + profilePic}
            alt={username}
            className='w-6 h-6 rounded-full ml-2 object-cover'
          />
        </Link>
        <div className='flex items-center justify-between w-full'>
          <span className='text-sm font-medium'>{username}</span>
          {!isCompleted && (
            <span className='text-xs text-gray-600'>
              {depositedCount} of {assets.length} deposited
            </span>
          )}
        </div>
      </div>
      <div className='space-y-2'>
        {assets.map((asset) => {
          return <NFTCard key={asset.nft_id} asset={asset} />
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
  useSyncApiWithChain(onchainInfo, transaction)

  const [isExpanded, setIsExpanded] = useState(fullPage)

  const handleClick = () => {
    if (!fullPage) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div
      className={`p-4 w-full bg-white rounded-xl shadow-sm 
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

      {!isExpanded ? (
        <CompactView
          creatorAssets={transaction.creator_assets}
          counterpartyAssets={transaction.counterparty_assets}
        />
      ) : (
        <>
          <div className='flex gap-4 text-sm ml-2'>
            <Link
              href={`/transactions/${transaction.offer_id}`}
              className='text-gray-500 hover:text-gray-900 flex items-center gap-0.5'
            >
              <span>🤝 Offer</span>
              <Expand className='w-4 h-4' />
            </Link>
            <Link
              href='https://www.etherscan.io'
              className='text-gray-500 hover:text-gray-900 flex items-center gap-0.5'
            >
              <span>📝 Contract</span>
              <Expand className='w-4 h-4' />
            </Link>
          </div>

          <div
            className='space-y-3 space-x-0 flex flex-col md:flex-row md:justify-between md:space-y-0 md:space-x-4'
            onClick={(e) => {
              if (isExpanded) {
                e.stopPropagation()
              }
            }}
          >
            <TradeSection
              username={transaction.creator_username}
              profilePic={transaction.creator_profile_pic_url}
              assets={transaction.creator_assets}
              onchainInfo={onchainInfo}
              status={transaction.status}
            />
            <TradeSection
              username={transaction.counterparty_username}
              profilePic={transaction.counterparty_profile_pic_url}
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
