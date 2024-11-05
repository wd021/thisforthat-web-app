'use client'

import { useState } from 'react'
import { Footer } from '@/components'
import { UserDropdown } from '@/components/dropdowns'
import { Offer, Transaction, Following } from '@/components/modals'
import { NFTGridObject } from '@/components/shared'
import { useIsMobile } from '@/hooks'
import { useFollow, useProfile, useUserItems } from '@/hooks/supabase'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { OfferModalInfo, TxModalInfo, UserTabOption } from '@/types/main'
import { NFTGridItem, OfferData, Profile } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'
import { OfferFeed } from '@/components/home'

const ProfileHeader = ({
  profile,
  isOwnProfile,
  onFollow,
  isFollowing,
  onClick,
}: {
  profile: Profile | null
  isOwnProfile: boolean
  onFollow: () => void
  isFollowing: boolean
  onClick: (option: string) => void
}) => {
  const renderProfileImage = () => (
    <div className='relative w-[175px] h-[175px] rounded-full overflow-hidden'>
      {profile ? (
        <img
          src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL! + profile.profile_pic_url}
          alt='Profile Picture'
          className='w-full h-full object-cover'
        />
      ) : (
        <div className='w-full h-full bg-gradient-to-br from-blue-50 to-purple-50' />
      )}
    </div>
  )

  const renderFollowButton = () =>
    !isOwnProfile && (
      <button
        onClick={onFollow}
        className={`
          inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium
          transition-all duration-200 ease-in-out shadow-sm
          ${
            isFollowing
              ? 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
        `}
      >
        {isFollowing && <span className='mr-1.5 text-xs'>✓</span>}
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    )

  const StatItem = ({ value, label, onClick }) => (
    <button
      onClick={onClick}
      className='w-[100px] group flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-200'
    >
      <span className='text-lg font-bold text-gray-900 group-hover:text-blue-500 transition-colors'>
        {value.toLocaleString()}
      </span>
      <span className='text-xs text-gray-500 mt-0.5'>{label}</span>
    </button>
  )

  const renderStats = () => (
    <div className='inline-flex items-center divide-x divide-gray-100'>
      <StatItem
        value={profile?.following_count || 0}
        label='Following'
        onClick={() => onClick('following')}
      />
      <StatItem
        value={profile?.followers_count || 0}
        label='Followers'
        onClick={() => onClick('followers')}
      />
      <StatItem value={profile?.nfts_count || 0} label='NFTs' onClick={() => onClick('nfts')} />
      <StatItem
        value={profile?.offers_count || 0}
        label='Offers'
        onClick={() => onClick('offers')}
      />
    </div>
  )

  return (
    <div className='max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-8 mb-6'>
      <div className='flex flex-col md:flex-row gap-8 items-center'>
        {renderProfileImage()}
        <div className='flex-1 min-w-0 space-y-4'>
          <div className='flex items-center gap-4'>
            <h1 className='text-2xl font-bold text-gray-900 truncate'>{profile?.username}</h1>
            {renderFollowButton()}
          </div>
          {profile?.bio && <p className='text-gray-600 leading-relaxed'>{profile.bio}</p>}
          <div className='bg-gray-50 rounded-xl overflow-hidden'>{renderStats()}</div>
        </div>
      </div>
    </div>
  )
}

const LoadingState: React.FC = () => (
  <div className='w-full flex flex-col items-center justify-center mt-[150px]'>
    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600'></div>
  </div>
)

const NoResultsState: React.FC<{ tab: UserTabOption }> = ({ tab }) => {
  const messages = {
    nfts: {
      title: 'No NFTs',
      description: 'User has not uploaded any NFTs yet.',
    },
    pinned: {
      title: 'No Pinned NFTs',
      description: 'User has not pinned any NFTs yet.',
    },
    offers: {
      title: 'No offers',
      description: 'User has no offers yet.',
    },
  }

  const { title, description } = messages[tab]

  return (
    <div className='w-full flex flex-col items-center justify-center mt-[150px] px-16 text-center'>
      <div className='text-gray-400 text-6xl mb-4'>🔍</div>
      <h3 className='text-xl font-semibold text-gray-700 mb-2'>{title}</h3>
      <p className='text-gray-500'>{description}</p>
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
  const [offerModalInfo, setOfferModalInfo] = useState<OfferModalInfo | null>(null)
  const [txModalInfo, setTxModalInfo] = useState<TxModalInfo | null>(null)
  const [followingModalInfo, setFollowingModalInfo] = useState<
    null | 'following' | 'followers'
  >(null)

  const { items, setItems, hasMore, loadMore, refreshItems, isFirstLoad, isLoading } =
    useUserItems(tabOption, userPageProfile, showToast)

  const handleNewOffer = async (nft: NFTGridItem) => {
    if (!user || !profile) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (nft.nft_user_id === user.id) {
      showToast(`⚠️ You can't make an offer on your own NFT`, 2500)
      return
    }

    setOfferModalInfo({
      offerId: null,
      chainId: nft.nft_chain_id,
      users: {
        creator: {
          id: user.id,
          username: profile.username,
          profile_pic_url: profile.profile_pic_url,
          wallet: profile.wallet,
        },
        counterparty: {
          id: nft.nft_user_id,
          username: nft.nft_user_id_username,
          profile_pic_url: nft.nft_user_id_profile_pic_url,
          wallet: nft.nft_user_id_wallet,
        },
      },
      assets: {
        creator: [],
        counterparty: [
          {
            nft_id: nft.nft_id,
            name: nft.nft_name,
            image: nft.nft_image,
            collection_contract: nft.nft_collection_contract,
            token_id: nft.nft_token_id,
            token_type: nft.nft_token_type,
          },
        ],
      },
    })
  }

  const handlePinItem = async (nft: NFTGridItem) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    try {
      await supabase.from('user_pins').upsert([{ user_id: user.id, nft_id: nft.nft_id }], {
        onConflict: 'user_id,nft_id',
        ignoreDuplicates: true,
      })
      showToast(`✅ NFT pinned`, 1500)
    } catch (error) {
      showToast(`⚠️ Error pinning NFT`, 2500)
      console.error('Error pinning NFT:', error)
    }
  }

  const handleTabChange = (newTabOption: UserTabOption) => {
    if (newTabOption === tabOption) return

    refreshItems()
    setTabOption(newTabOption)
  }

  const renderContent = () => {
    if (isFirstLoad) return <LoadingState />
    if (!isLoading && !isFirstLoad && items.length === 0)
      return <NoResultsState tab={tabOption} />

    return tabOption !== 'offers' ? (
      <div className='p-3 md:p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-6 mb-24'>
        {(items as NFTGridItem[]).map((item) => (
          <NFTGridObject
            key={item.nft_id}
            item={item}
            newOffer={handleNewOffer}
            pinItem={handlePinItem}
          />
        ))}
      </div>
    ) : (
      <div className='px-4 max-w-[740px] mx-auto flex flex-col gap-y-4 my-6'>
        <OfferFeed
          items={items as OfferData[]}
          setOfferModalInfo={setOfferModalInfo}
          setItems={setItems}
        />
      </div>
    )
  }

  const renderLoadMoreButton = () =>
    items.length > 0 &&
    hasMore && (
      <div className='w-full flex items-center justify-center my-4'>
        <button
          onClick={loadMore}
          className='px-10 py-3 text-lg rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors duration-300'
        >
          Load More
        </button>
      </div>
    )

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${!isMobile && 'mb-[50px]'}`}
      >
        <div className='my-8 px-3 md:px-6 md:container md:mx-auto'>
          <ProfileHeader
            profile={userPageProfile}
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onClick={(option: string) => {
              if (option === 'following' || option === 'followers') {
                setFollowingModalInfo(option as 'following' | 'followers')
              } else {
                handleTabChange(option as UserTabOption)
              }
            }}
            isOwnProfile={userPageProfile?.id === user?.id}
          />
          <UserDropdown tabOption={tabOption} onNavigationChange={handleTabChange} />
          {renderContent()}
          {renderLoadMoreButton()}
        </div>
      </div>
      {!isMobile && <Footer />}
      {offerModalInfo && (
        <Offer {...offerModalInfo} closeModal={() => setOfferModalInfo(null)} />
      )}
      {txModalInfo && <Transaction {...txModalInfo} closeModal={() => setTxModalInfo(null)} />}
      {followingModalInfo && (
        <Following
          userId={userPageProfile?.id!}
          initialTab={followingModalInfo}
          closeModal={() => setFollowingModalInfo(null)}
        />
      )}
    </div>
  )
}

export default UserPage
