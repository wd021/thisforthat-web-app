'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { OfferFeed } from '@/components/feeds'
import { Duplicates, Offer, Transaction } from '@/components/modals'
import { LoadingIndicator, NFTImage, VerifiedBadge } from '@/components/shared'
import { useNFTOffers } from '@/hooks/supabase'
import { Etherscan, Opensea } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { OfferModalInfo, TxModalInfo } from '@/types/main'
import { NFT, UserNFT } from '@/types/supabase'
import { getBlockExplorerUrl, getOpenSeaUrl } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

const NFTSidebar: React.FC<{
  nft: NFT
  nftUsers: UserNFT[]
  showMultiUserModal: () => void
  makeOffer: () => void
  pinItem: () => void
}> = ({ nft, nftUsers, showMultiUserModal, makeOffer, pinItem }) => {
  const multipleHolders = nftUsers.length > 1 && !nft.is_verified

  return (
    <div className='w-full lg:w-[320px] flex flex-col lg:sticky lg:top-8 lg:overflow-y-auto hide-scrollbar'>
      <div className='bg-white rounded-lg shadow-md mb-4 mx-4 lg:mx-0 max-w-[320px] self-center lg:self-auto lg:max-w-none'>
        <NFTImage src={nft?.image} alt={nft?.name} fallback={nft?.name} />
        <div className='p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <Link
              href={`/${nft.user_profile.username}`}
              target='_blank'
              className='flex items-center truncate'
            >
              <img
                src={
                  process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                  nft.user_profile.profile_pic_url
                }
                alt={nft.user_profile.username}
                className='w-8 h-8 rounded-full'
              />
              <div className='text-xl font-bold ml-2'>{nft.user_profile.username}</div>
            </Link>
            <VerifiedBadge
              id={nft.id}
              name={nft.name}
              collectionName={nft.collection_name}
              tokenId={nft.token_id}
              isVerified={nft.is_verified}
              className='w-8 h-8 flex items-center justify-center shrink-0'
              chainId={nft.chain_id.toString()}
              collectionContract={nft.collection_contract}
            />
          </div>

          {multipleHolders && (
            <button onClick={showMultiUserModal} className='w-full'>
              <div className='flex items-center justify-between p-2 rounded-md bg-amber-50 hover:bg-amber-100 transition-all border border-amber-200/50'>
                <div className='flex items-center gap-2'>
                  <span className='w-5 h-5 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs'>
                    {nftUsers.length}
                  </span>
                  <span className='text-sm font-medium text-amber-700'>Multiple Users</span>
                </div>
                <div className='flex items-center text-amber-600'>
                  <span className='text-xs mr-1'>View all</span>
                  <svg
                    className='w-3 h-3'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
      <ActionButtons className='hidden lg:flex' makeOffer={makeOffer} pinItem={pinItem} />
    </div>
  )
}

const NFTTitle: React.FC<{ nft: NFT }> = ({ nft }) => {
  const blockExplorerUrl = getBlockExplorerUrl(
    nft.chain_id.toString(),
    nft.collection_contract,
    nft.token_id,
  )
  const openSeaUrl = getOpenSeaUrl(
    nft.chain_id.toString(),
    nft.collection_contract,
    nft.token_id,
  )
  return (
    <div className='w-full bg-white p-3 md:p-4 mb-4 rounded-lg shadow-sm'>
      <div className='flex items-center justify-between px-1'>
        <div className='flex items-center'>
          <div>
            <h2 className='md:text-lg lg:text-xl font-bold text-gray-800'>{nft.name}</h2>
            <p className='text-sm text-gray-500'>{nft.collection_name}</p>
          </div>
        </div>
        <div className='flex space-x-2'>
          <a
            href={openSeaUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full transition-all duration-300 hover:bg-blue-100 hover:shadow-md'
            title='View on OpenSea'
          >
            <Opensea className='w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform duration-300' />
          </a>
          <a
            href={blockExplorerUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center justify-center w-10 h-10 bg-gray-50 rounded-full transition-all duration-300 hover:bg-gray-100 hover:shadow-md'
            title={`View on Etherscan`}
          >
            <Etherscan className='w-8 h-8 text-gray-500 group-hover:scale-110 transition-transform duration-300' />
          </a>
        </div>
      </div>
    </div>
  )
}

const ActionButtons: React.FC<{
  className?: string
  makeOffer: () => void
  pinItem: () => void
}> = ({ className, makeOffer, pinItem }) => (
  <div className={`flex gap-x-2 p-0.5 ${className} lg:mb-2`}>
    <button
      onClick={makeOffer}
      className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center bg-yellow-50 hover:bg-yellow-100`}
    >
      <span className='text-3xl mr-2'>🤝</span>
      <span className='text-gray-800 text-xl font-semibold'>Offer</span>
    </button>
    <button
      onClick={pinItem}
      className={`py-2 px-4 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center bg-red-50 hover:bg-red-100`}
    >
      <span className='text-2xl'>📌</span>
    </button>
  </div>
)

const MobileActionButtons: React.FC<{ makeOffer: () => void; pinItem: () => void }> = ({
  makeOffer,
  pinItem,
}) => (
  <div className='flex gap-x-2 fixed bottom-0 left-0 right-0 bg-white p-3 shadow-lg lg:hidden border-t border-gray-200'>
    <button
      onClick={makeOffer}
      className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center bg-yellow-400 hover:bg-yellow-500`}
    >
      <span className='text-gray-800 text-lg font-semibold'>Make Offer</span>
    </button>
    <button
      onClick={pinItem}
      className={`py-2 px-4 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center bg-gray-100 hover:bg-gray-200`}
    >
      <span className='text-2xl'>📌</span>
    </button>
  </div>
)

const NFTPage: React.FC<{
  nft: NFT
  nftUsers: UserNFT[]
}> = ({ nft, nftUsers }) => {
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  const { items, hasMore, loadMore, setItems, isFirstLoad, isLoading } = useNFTOffers(nft.id)

  const [offerModalInfo, setOfferModalInfo] = useState<OfferModalInfo | null>(null)
  const [txModalInfo, setTxModalInfo] = useState<TxModalInfo | null>(null)
  const [multiUserModal, setShowMultiUserModal] = useState(false)

  const newOffer = async (nft: NFT) => {
    if (!user || !profile) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (nft.user_id === user.id) {
      showToast(`⚠️ You can't make an offer on your own NFT`, 2500)
      return
    }

    const modalInfo = {
      offerId: null,
      chainId: nft.chain_id,
      users: {
        creator: {
          id: user.id,
          username: profile.username,
          profile_pic_url: profile.profile_pic_url,
          wallet: profile.wallet,
        },
        counterparty: {
          id: nft.user_profile.id,
          username: nft.user_profile.username,
          profile_pic_url: nft.user_profile.profile_pic_url,
          wallet: nft.user_profile.wallet,
        },
      },
      assets: {
        creator: [],
        counterparty: [
          {
            nft_id: nft.id,
            name: nft.name,
            image: nft.image,
            collection_contract: nft.collection_contract,
            token_id: nft.token_id,
            token_type: nft.token_type,
          },
        ],
      },
    }

    setOfferModalInfo(modalInfo)
  }

  const pinItem = async (nft: NFT) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    showToast(`✅ NFT pinned`, 1500)

    const { error } = await supabase
      .from('user_pins')
      .upsert([{ user_id: user?.id, nft_id: nft.id }], {
        onConflict: 'user_id,nft_id',
        ignoreDuplicates: true,
      })
    if (error) {
      showToast(`⚠️ Error pinning NFT`, 2500)
      console.error('Error pinning NFT:', error)
      return
    }
  }

  return (
    <>
      <div className={`flex w-full h-full relative`}>
        <div className='mt-6 lg:my-0 w-full bg-[#f9f9f9] flex flex-col lg:flex-row justify-start lg:justify-center lg:gap-4 lg:gap-8 p-0 lg:p-8 pb-24 lg:pb-16'>
          <NFTSidebar
            nft={nft}
            nftUsers={nftUsers}
            showMultiUserModal={() => setShowMultiUserModal(true)}
            makeOffer={() => newOffer(nft)}
            pinItem={() => pinItem(nft)}
          />
          <div className='flex flex-col flex-grow w-full lg:max-w-2xl px-4 lg:px-0'>
            <NFTTitle nft={nft} />
            <div className='flex-grow overflow-hidden'>
              {isFirstLoad ? (
                <div className='w-full flex flex-col items-center justify-center mt-[150px]'>
                  <LoadingIndicator />
                </div>
              ) : (
                <>
                  {!isLoading && items.length === 0 ? (
                    <>
                      <div className='w-full flex flex-col items-center justify-center my-[150px] px-16 text-center'>
                        <div className='text-gray-400 text-6xl mb-4'>🔍</div>
                        <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                          No offers yet
                        </h3>
                        <p className='text-gray-500'>
                          Be the first to make an offer for this NFT!
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className='h-full overflow-y-auto hide-scrollbar'>
                      <div className='flex flex-col gap-y-4'>
                        <OfferFeed
                          items={items}
                          setOfferModalInfo={setOfferModalInfo}
                          setTxModalInfo={setTxModalInfo}
                          setItems={setItems}
                        />
                      </div>
                      {items.length > 0 && hasMore && (
                        <button
                          className='bg-gray-100 py-2 px-6 text-gray-600 hover:bg-gray-200 transition-colors duration-300 text-sm font-medium my-4 mx-auto rounded-full shadow-sm flex items-center'
                          onClick={loadMore}
                        >
                          Load more
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className='h-[100px] lg:hidden' />
          </div>
        </div>
        <MobileActionButtons makeOffer={() => newOffer(nft)} pinItem={() => pinItem(nft)} />
      </div>
      {offerModalInfo && (
        <Offer {...offerModalInfo} closeModal={() => setOfferModalInfo(null)} />
      )}
      {txModalInfo && (
        <Transaction
          {...txModalInfo}
          closeModal={() => setTxModalInfo(null)}
          onCreateTrade={() => {}}
          onCompleteTrade={() => {}}
        />
      )}
      {multiUserModal && (
        <Duplicates users={nftUsers} closeModal={() => setShowMultiUserModal(false)} />
      )}
    </>
  )
}

export default NFTPage
