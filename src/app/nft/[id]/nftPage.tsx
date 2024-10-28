'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { Duplicates, Offer } from '@/components/modals'
import { NFTImage, NFTOfferItem, VerifiedBadge } from '@/components/shared'
import { useNFTOffers } from '@/hooks/supabase'
import { ChainLogo, Etherscan, Opensea } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import {
  NFT,
  NFTFeedItem as NFTFeedItemType,
  NFTOffers,
  OfferFeedItem as OfferFeedItemType,
} from '@/types/supabase'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'
import { getBlockExplorerUrl, getOpenSeaUrl } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

const NFTSidebar: React.FC<{
  nft: NFT
  nftUsers: any[]
  showMultiUserModal: () => void
  makeOffer: () => void
  pinItem: () => void
}> = ({ nft, nftUsers, showMultiUserModal, makeOffer, pinItem }) => {
  const multipleHolders = nftUsers.length > 1

  return (
    <div className='w-full lg:w-[360px] flex flex-col lg:sticky lg:top-8 lg:overflow-y-auto hide-scrollbar'>
      <div className='bg-white rounded-lg shadow-md mb-4 mx-4 lg:mx-0 max-w-[260px] self-center lg:self-auto lg:max-w-none'>
        <NFTImage src={nft?.image} alt={nft?.name} fallback={nft?.name} />
        <div className='p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <Link
              href={`/${nft.user_profile.username}`}
              target='_blank'
              className='flex items-center'
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
              chainName={CHAIN_IDS_TO_CHAINS[nft.chain_id as keyof typeof CHAIN_IDS_TO_CHAINS]}
              collectionName={nft.collection_name}
              tokenId={nft.token_id}
              isVerified={nft.is_verified}
              className='w-10 h-10 flex items-center justify-center'
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
    <div className='w-full bg-white p-3 md:p-6 mb-4 rounded-lg shadow-md'>
      <div className='flex items-center justify-between px-1'>
        <div className='flex items-center'>
          <ChainLogo chainId={nft.chain_id} className='w-6 h-6 mr-2 md:w-8 md:h-8' />
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

const OffersGrid: React.FC<{
  items: NFTOffers[]
  viewOffer: (offer: OfferFeedItemType) => void
  userId: string | null
}> = ({ items, viewOffer, userId }) => (
  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2'>
    {items.map((item) => (
      <NFTOfferItem
        key={item.id}
        item={item.user_offers}
        viewOffer={viewOffer}
        userId={userId}
      />
    ))}
    {items.length === 0 && (
      <div className='col-span-1 sm:col-span-2 flex flex-col items-center justify-center py-16 px-4'>
        <h3 className='text-lg font-semibold text-gray-700 mb-1'>No Offers Yet</h3>
        <p className='text-gray-500 text-center text-sm max-w-sm'>
          Be the first to make an offer on this NFT. Click the offer button to get started!
        </p>
      </div>
    )}
  </div>
)

const ActionButtons: React.FC<{
  className?: string
  makeOffer: () => void
  pinItem: () => void
}> = ({ className, makeOffer, pinItem }) => (
  <div className={`flex gap-x-2 p-0.5 ${className} lg:mb-2`}>
    <button
      onClick={makeOffer}
      className={`flex-1 py-3 px-4 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center bg-yellow-50 hover:bg-yellow-100`}
    >
      <span className='text-2xl mr-2'>🤝</span>
      <span className='text-gray-800 text-lg font-semibold'>Offer</span>
    </button>
    <button
      onClick={pinItem}
      className={`py-3 px-4 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center bg-red-50 hover:bg-red-100`}
    >
      <span className='text-2xl'>📌</span>
    </button>
  </div>
)

const MobileActionButtons: React.FC<{ makeOffer: () => void; pinItem: () => void }> = ({
  makeOffer,
  pinItem,
}) => (
  <div className='flex gap-x-2 fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg lg:hidden'>
    <button
      onClick={makeOffer}
      className={`flex-1 py-3 px-4 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center bg-yellow-50 hover:bg-yellow-100`}
    >
      <span className='text-2xl mr-2'>🤝</span>
      <span className='text-gray-800 text-lg font-semibold'>Offer</span>
    </button>
    <button
      onClick={pinItem}
      className={`py-3 px-4 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center bg-red-50 hover:bg-red-100`}
    >
      <span className='text-2xl'>📌</span>
    </button>
  </div>
)

const NFTPage: React.FC<{
  nft: NFT
  nftUsers: any[]
}> = ({ nft, nftUsers }) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { items, hasMore, loadMore } = useNFTOffers(nft.id)
  const [makeOfferItem, setMakeOfferItem] = useState<NFTFeedItemType | null>(null)
  const [viewOfferItem, setViewOfferItem] = useState<OfferFeedItemType | null>(null)
  const [multiUserModal, setShowMultiUserModal] = useState(false)

  const makeOffer = async (nft: NFT) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (nft.user_id === user.id) {
      showToast(`⚠️ You can't make an offer on your own NFT`, 2500)
      return
    }

    const initialNFTOfferItem: NFTFeedItemType = {
      nft_id: nft.id,
      nft_name: nft.name,
      nft_image: nft.image,
      nft_chain_id: nft.chain_id,
      nft_collection_contract: nft.collection_contract,
      nft_token_id: nft.token_id,
      nft_token_type: nft.token_type,
      nft_collection_name: nft.collection_name,
      nft_created_at: nft.created_at,
      nft_thumbnail: nft.thumbnail,
      nft_is_verified: nft.is_verified,
      nft_verified_at: nft.verified_at,
      nft_pins: nft.pins,
      nft_user_id: nft.user_id,
      nft_user_id_username: nft.user_profile.username,
      nft_user_id_profile_pic_url: nft.user_profile.profile_pic_url,
    }

    setMakeOfferItem(initialNFTOfferItem)
  }

  const viewOffer = async (offer: OfferFeedItemType) => {
    setViewOfferItem(offer)
  }

  const pinItem = async (nft: NFT) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    showToast(`✅ NFT pinned`, 1500)

    const { error } = await supabase.from('user_pins').upsert(
      [
        {
          user_id: user?.id,
          nft_id: nft.id,
        },
      ],
      {
        onConflict: 'user_id,nft_id',
        ignoreDuplicates: true,
      },
    )
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
            makeOffer={() => makeOffer(nft)}
            pinItem={() => pinItem(nft)}
          />
          <div className='flex flex-col flex-grow w-full lg:max-w-3xl px-4 lg:px-0'>
            <NFTTitle nft={nft} />
            <div className='flex-grow overflow-hidden'>
              <div className='h-full overflow-y-auto hide-scrollbar'>
                <OffersGrid
                  items={items}
                  viewOffer={viewOffer}
                  userId={user ? user.id : null}
                />
                {items.length > 0 && hasMore && (
                  <button
                    className='bg-gray-100 py-2 px-6 text-gray-600 hover:bg-gray-200 transition-colors duration-300 text-sm font-medium my-4 mx-auto rounded-full shadow-sm flex items-center'
                    onClick={loadMore}
                  >
                    Load more
                  </button>
                )}
              </div>
            </div>
            <div className='h-[100px] lg:hidden' />
          </div>
        </div>
        <MobileActionButtons makeOffer={() => makeOffer(nft)} pinItem={() => pinItem(nft)} />
      </div>
      {makeOfferItem && (
        <Offer
          type='make_offer'
          offerId={null}
          initialNFT={makeOfferItem}
          closeModal={() => setMakeOfferItem(null)}
        />
      )}
      {viewOfferItem && (
        <Offer
          type={
            viewOfferItem.status === 'accepted' || viewOfferItem.status === 'completed'
              ? 'transaction'
              : 'view_offer'
          }
          offerId={viewOfferItem.id}
          initialNFT={null}
          closeModal={() => setViewOfferItem(null)}
        />
      )}
      {multiUserModal && (
        <Duplicates users={nftUsers} closeModal={() => setShowMultiUserModal(false)} />
      )}
    </>
  )
}

export default NFTPage
