'use client'

import { useState } from 'react'

import { Footer } from '@/components'
import { UserDropdown } from '@/components/dropdowns'
import { Offer } from '@/components/modals'
import { NFTGridObject, NFTOfferItem } from '@/components/shared'
import { useIsMobile } from '@/hooks'
import { useFollow, useProfile, useUserItems } from '@/hooks/supabase'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { UserTabOption } from '@/types/main'
import { NFTGridItem, OfferFeedItem as OfferFeedItemType, Profile } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

const ProfilePicture: React.FC<{ url: string | null }> = ({ url }) => (
  <div className='relative w-[175px] h-[175px] bg-gray-100 rounded-full'>
    {url && (
      <img
        src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL! + url}
        alt='Profile Picture'
        className='w-full h-full rounded-full'
      />
    )}
  </div>
)

const ProfileHeader: React.FC<{
  profile: Profile | null
  isFollowing: boolean
  onFollow: () => void
  isOwnProfile: boolean
}> = ({ profile, isFollowing, onFollow, isOwnProfile }) => (
  <div className='mt-12 mb-4 flex justify-center'>
    <div className='flex flex-col items-center'>
      <ProfilePicture url={profile?.profile_pic_url || null} />
      {!isOwnProfile && (
        <div
          className={`flex items-center border px-3 py-1 rounded-full mt-[-14px] z-10 cursor-pointer ${
            isFollowing ? 'bg-gray-800 text-white' : 'bg-gray-100 border-gray-200'
          }`}
          onClick={onFollow}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </div>
      )}
      <div className='flex items-center mt-4'>
        <div className='text-3xl font-bold'>{profile?.username}</div>
      </div>
      <p className='text-gray-600 mt-2'>{profile?.bio}</p>
    </div>
  </div>
)

const ContentGrid: React.FC<{
  items: (NFTGridItem | OfferFeedItemType)[]
  tabOption: UserTabOption
  onMakeOffer: (item: NFTGridItem) => void
  onViewOffer: (item: OfferFeedItemType) => void
  onPinItem: (item: NFTGridItem) => void
  userId: string | null
}> = ({ items, tabOption, onMakeOffer, onViewOffer, onPinItem, userId }) => {
  if (tabOption === 'offers') {
    return (
      <div className='p-3 md:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-6 mb-12'>
        {(items as OfferFeedItemType[]).map((item) => (
          <NFTOfferItem key={item.id} item={item} viewOffer={onViewOffer} userId={userId} />
        ))}
      </div>
    )
  }

  return (
    <div className='p-3 md:p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-6 mb-16'>
      {(items as NFTGridItem[]).map((item) => (
        <NFTGridObject
          key={item.nft_id}
          item={item}
          makeOffer={onMakeOffer}
          pinItem={onPinItem}
        />
      ))}
    </div>
  )
}

const UserPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const isMobile = useIsMobile()
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  const userPageProfile = useProfile(params.id, profile)
  const { isFollowing, handleFollow } = useFollow(userPageProfile, user)
  const [tabOption, setTabOption] = useState<UserTabOption>('nfts')
  const { items, hasMore, loadMore, refreshItems } = useUserItems(
    tabOption,
    userPageProfile,
    showToast,
  )

  const [makeOfferItem, setMakeOfferItem] = useState<NFTGridItem | null>(null)
  const [viewOfferItem, setViewOfferItem] = useState<OfferFeedItemType | null>(null)

  const handleMakeOffer = async (nft: NFTGridItem) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (nft.nft_user_id === user.id) {
      showToast(`⚠️ You can't make an offer on your own NFT`, 2500)
      return
    }

    setMakeOfferItem(nft)
  }

  const handlePinItem = async (nft: NFTGridItem) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    try {
      await supabase.from('user_pins').upsert(
        [
          {
            user_id: user.id,
            nft_id: nft.nft_id,
          },
        ],
        {
          onConflict: 'user_id,nft_id',
          ignoreDuplicates: true,
        },
      )
      showToast(`✅ NFT pinned`, 1500)
    } catch (error) {
      showToast(`⚠️ Error pinning NFT`, 2500)
      console.error('Error pinning NFT:', error)
    }
  }

  const handleTabChange = (newTabOption: UserTabOption) => {
    refreshItems()
    setTabOption(newTabOption)
  }

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${!isMobile && 'mb-[50px]'}`}
      >
        <div className='px-3 md:px-6 md:container md:mx-auto'>
          <ProfileHeader
            profile={userPageProfile}
            isFollowing={isFollowing}
            onFollow={handleFollow}
            isOwnProfile={userPageProfile?.id === user?.id}
          />
          <UserDropdown tabOption={tabOption} onNavigationChange={handleTabChange} />
          <ContentGrid
            items={items}
            tabOption={tabOption}
            onMakeOffer={handleMakeOffer}
            onViewOffer={setViewOfferItem}
            onPinItem={handlePinItem}
            userId={user?.id || null}
          />
          {items.length > 0 && hasMore && (
            <div className='w-full flex items-center justify-center my-4'>
              <button
                onClick={loadMore}
                className='px-10 py-3 text-lg rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors duration-300'
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
      {!isMobile && <Footer />}
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
    </div>
  )
}

export default UserPage
