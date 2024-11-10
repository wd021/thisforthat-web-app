import React, { useState } from 'react'
import Link from 'next/link'

import { useTradeInfo } from '@/hooks'
import { useSyncApiWithChain } from '@/hooks/supabase'
import { Expand, SwapArrows } from '@/icons'
import { useToast } from '@/providers/toastProvider'
import { OnchainTradeInfo, TxCancelModalInfo, TxModalInfo } from '@/types/main'
import { NFTAsset, TransactionData } from '@/types/supabase'
import { getChainInfo } from '@/utils/helpers'

import { NFTImage } from '../shared'

import Footer from './footer'
import Header from './header'

const NFTCard = ({ asset }: { asset: NFTAsset }) => (
  <Link
    href={`/nfts/${asset.nft_id}`}
    target='_blank'
    className='flex items-center p-2 bg-white rounded-lg border border-gray-100'
  >
    <div className='w-12 h-12 rounded-lg object-cover shrink-0'>
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
  creatorAssets: NFTAsset[]
  counterpartyAssets: NFTAsset[]
}> = ({ creatorAssets, counterpartyAssets }) => (
  <div className='bg-gray-50 rounded-lg p-3 overflow-hidden overflow-x-auto hide-scrollbar'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-4'>
        <AssetPreviewGroup assets={creatorAssets} />
        <div className='p-2 bg-white rounded-full shadow-sm'>
          <SwapArrows />
        </div>
        <AssetPreviewGroup assets={counterpartyAssets} />
      </div>
    </div>
  </div>
)

const AssetPreviewGroup: React.FC<{ assets: NFTAsset[] }> = ({ assets }) => (
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

const TradeSection = ({
  username,
  profilePic,
  assets,
  onchainInfo,
  status,
}: {
  username: string
  profilePic: string
  assets: NFTAsset[]
  onchainInfo: OnchainTradeInfo | null
  status: string
}) => {
  const isCompleted = status === 'onchain_cancelled' || status === 'onchain_completed'
  const depositedCount = onchainInfo
    ? assets.reduce((count, asset) => {
        const isDeposited = onchainInfo?.assets.some(
          (onchainAsset) =>
            onchainAsset.token.toLowerCase() === asset.collection_contract.toLowerCase() &&
            onchainAsset.tokenId.toString() === asset.token_id &&
            onchainAsset.isDeposited,
        )
        return isDeposited ? count + 1 : count
      }, 0)
    : '-'

  return (
    <div className='p-3 rounded-lg bg-gray-50 space-y-2 w-full'>
      <div className='flex justify-between'>
        <div className='flex items-center gap-2 mb-2'>
          <Link href={`/${username}`} target='_blank'>
            <img
              src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + profilePic}
              alt={username}
              className='w-6 h-6 rounded-full ml-2 object-cover'
            />
          </Link>
          <span className='text-sm font-semibold'>{username}</span>
        </div>
        <div>
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
  setTxModalInfo: (modalInfo: TxModalInfo) => void
  setTxCancelModalInfo: (modalInfo: TxCancelModalInfo) => void
}> = ({ fullPage = false, transaction, setTxModalInfo, setTxCancelModalInfo }) => {
  const { showToast } = useToast()

  const { tradeInfo: onchainInfo, isLoading: onchainLoading } = useTradeInfo(
    transaction?.chain_id || null,
    transaction?.onchain_trade_id || null,
    transaction?.onchain_done as boolean,
  )

  useSyncApiWithChain(onchainInfo || null, transaction)

  const [isExpanded, setIsExpanded] = useState(fullPage)

  const handleClick = () => {
    if (!fullPage) {
      setIsExpanded(!isExpanded)
    }
  }

  const explorerLink = getChainInfo(transaction.chain_id.toString()).blockExplorerUrl

  return (
    <div
      className={`p-2 md:p-4 w-full bg-white rounded-xl shadow-md 
        ${!fullPage ? 'hover:shadow-lg cursor-pointer' : ''} 
        transition-all duration-200 space-y-2 md:space-y-4`}
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
          <div className='flex py-2 md:py-1 gap-2 md:gap-4 ml-3'>
            <Link
              href={`/offers/${transaction.offer_id}`}
              target='_blank'
              className='text-gray-600 hover:text-gray-900 flex items-center gap-0.5 font-semibold'
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <span>🤝 Offer</span>
              <Expand className='w-4 h-4' />
            </Link>
            <Link
              href={`${explorerLink}/tx/${transaction.onchain_tx}`}
              target='_blank'
              className='text-gray-600 hover:text-gray-900 flex items-center gap-0.5 font-semibold'
              onClick={(e) => {
                e.stopPropagation()
              }}
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
              onchainInfo={onchainInfo || null}
              status={transaction.status}
            />
            <TradeSection
              username={transaction.counterparty_username}
              profilePic={transaction.counterparty_profile_pic_url}
              assets={transaction.counterparty_assets}
              onchainInfo={onchainInfo || null}
              status={transaction.status}
            />
          </div>
        </>
      )}

      <Footer
        transaction={transaction}
        onchainInfo={onchainInfo || null}
        onchainLoading={onchainLoading}
        showTxModal={() => {
          if (!onchainInfo) {
            showToast('⚠️ Unable to connect to network. Please try again later.')
          } else {
            const txModalInfo = {
              transactionInfo: {
                status: transaction.status,
                offerId: transaction.offer_id,
                onchain: {
                  id: transaction.onchain_trade_id,
                  hash: transaction.onchain_tx,
                  done: transaction.onchain_done,
                },
                chainId: transaction.chain_id,
                users: {
                  creator: {
                    id: transaction.creator_id,
                    username: transaction.creator_username,
                    profile_pic_url: transaction.creator_profile_pic_url,
                    wallet: transaction.creator_wallet,
                  },
                  counterparty: {
                    id: transaction.counterparty_id,
                    username: transaction.counterparty_username,
                    profile_pic_url: transaction.counterparty_profile_pic_url,
                    wallet: transaction.counterparty_wallet,
                  },
                },
                assets: {
                  creator: transaction.creator_assets,
                  counterparty: transaction.counterparty_assets,
                },
              },
              onchainInfo: onchainInfo,
            }

            setTxModalInfo(txModalInfo)
          }
        }}
        showTxCancelModal={() => {
          if (!transaction.onchain_trade_id || !transaction.onchain_tx) {
            showToast('⚠️ Unable to connect to network. Please try again later.')
            return
          }

          const txCancelModalInfo = {
            transactionInfo: {
              status: transaction.status,
              offerId: transaction.offer_id,
              onchain: {
                id: transaction.onchain_trade_id as string,
                hash: transaction.onchain_tx as string,
                done: transaction.onchain_done,
              },
              chainId: transaction.chain_id,
              users: {
                creator: {
                  id: transaction.creator_id,
                  username: transaction.creator_username,
                  profile_pic_url: transaction.creator_profile_pic_url,
                  wallet: transaction.creator_wallet,
                },
                counterparty: {
                  id: transaction.counterparty_id,
                  username: transaction.counterparty_username,
                  profile_pic_url: transaction.counterparty_profile_pic_url,
                  wallet: transaction.counterparty_wallet,
                },
              },
            },
          }

          setTxCancelModalInfo(txCancelModalInfo)
        }}
      />
    </div>
  )
}

export default Transaction
