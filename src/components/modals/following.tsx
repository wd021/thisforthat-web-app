import React, { useState } from 'react'
import Modal from 'react-modal'
import Link from 'next/link'

import { useIsMobile } from '@/hooks'
import { useFollowers } from '@/hooks/supabase'
import { Close } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { getModalStyles } from '@/styles'

interface TabProps {
  label: string
  isActive: boolean
  onClick: () => void
  count?: number
}

interface FollowButtonProps {
  isFollowing: boolean
  onClick: () => void
}

interface EmptyStateProps {
  type: 'following' | 'followers'
}

interface UserProfile {
  username: string
  profile_pic_url: string
  bio?: string
}

interface FollowItem {
  id: string
  followed_id: string
  user_profile: UserProfile
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick, count }) => (
  <button
    className={`
      relative px-4 py-3 font-medium transition-all duration-200
      ${
        isActive
          ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gray-900'
          : 'text-gray-500 hover:text-gray-700'
      }
    `}
    onClick={onClick}
  >
    {label}
    {count !== undefined && (
      <span className={`ml-1.5 text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
        {count}
      </span>
    )}
  </button>
)

const FollowButton: React.FC<FollowButtonProps> = ({ isFollowing, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
      ${
        isFollowing
          ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-red-600 hover:bg-red-100 group'
          : 'text-white bg-gray-900 hover:bg-gray-800'
      }
    `}
  >
    <span className='block group-hover:hidden'>{isFollowing ? 'Following' : 'Follow'}</span>
    <span className='hidden group-hover:block'>Unfollow</span>
  </button>
)

const EmptyState: React.FC<EmptyStateProps> = ({ type }) => (
  <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
      {type === 'following' ? 'Not following anyone yet' : 'No followers yet'}
    </h3>
  </div>
)

const LoadingSpinner = () => (
  <div className='w-full flex flex-col items-center justify-center py-12'>
    <div className='animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-900'></div>
  </div>
)

const Following: React.FC<{
  userId: string
  followingCount: number
  followersCount: number
  initialTab: 'following' | 'followers'
  closeModal: () => void
}> = ({ userId, followingCount, followersCount, initialTab, closeModal }) => {
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)
  const [activeTab, setActiveTab] = useState(initialTab)
  const { user } = useAuth()
  const { items, hasMore, loadMore, isLoading, unfollowUser } = useFollowers(userId, activeTab)

  const renderUserItem = (item: FollowItem) => (
    <div key={item.id} className='flex items-center justify-between p-4'>
      <Link
        href={`/${item.user_profile.username}`}
        className='flex items-center flex-1 min-w-0'
      >
        <div className='relative w-12 h-12 rounded-full overflow-hidden'>
          <img
            src={
              process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + item.user_profile.profile_pic_url
            }
            alt={item.user_profile.username}
            className='w-full h-full object-cover'
          />
        </div>
        <div className='ml-3 min-w-0'>
          <div className='font-medium text-gray-900 truncate'>{item.user_profile.username}</div>
          {item.user_profile.bio && (
            <div className='text-sm text-gray-500 truncate'>{item.user_profile.bio}</div>
          )}
        </div>
      </Link>
      {user?.id === userId && activeTab === 'following' && (
        <div className='ml-4'>
          <FollowButton isFollowing={true} onClick={() => unfollowUser(item.followed_id)} />
        </div>
      )}
    </div>
  )

  return (
    <Modal
      id='react-modal'
      ariaHideApp={false}
      isOpen={true}
      onRequestClose={closeModal}
      style={customStyles}
    >
      <div className='flex flex-col h-full lg:h-auto w-full bg-white rounded-lg'>
        <div className='flex items-center justify-between px-4 mt-3 border-b'>
          <div className='flex items-center'>
            <Tab
              label='Following'
              isActive={activeTab === 'following'}
              onClick={() => setActiveTab('following')}
              count={followingCount}
            />
            <Tab
              label='Followers'
              isActive={activeTab === 'followers'}
              onClick={() => setActiveTab('followers')}
              count={followersCount}
            />
          </div>
          <button className='text-gray-500' aria-label='Close modal' onClick={closeModal}>
            <Close className='w-5 h-5' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto custom-scrollbar'>
          {!isLoading && items.length === 0 && <EmptyState type={activeTab} />}

          {items.map(renderUserItem)}

          {isLoading && <LoadingSpinner />}

          {hasMore && !isLoading && (
            <button
              onClick={loadMore}
              className='w-full py-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors font-medium'
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default Following
