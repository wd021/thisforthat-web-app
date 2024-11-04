import React, { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

import { NFTImage } from '@/components/shared'
import { useChatScroll } from '@/hooks'
import { Chain, ChainLogo } from '@/icons'
import { useToast } from '@/providers/toastProvider'
import { NFTAsset, OfferData, OfferMessage, Profile } from '@/types/supabase'
import { FEED_ITEMS_PER_PAGE } from '@/utils/constants'
import { timeAgoShort } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

interface OfferCardProps {
  offer: OfferData
  user: User | null
  profile: Profile | null
  onLike: (side: 'creator' | 'counterparty') => void
  onFavorite: () => void
  onCreate: (offerId: string) => void
  onAccept: (offerId: string) => void
  onDecline: (offerId: string) => void
  onCounter: (offerId: string) => void
}

const SwapArrowsIcon = () => (
  <svg
    className='h-4 w-4'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M7 10h14l-4-4m0 8h-14l4 4' />
  </svg>
)

const SendIcon = () => (
  <svg
    className='h-3.5 w-3.5'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <line x1='22' y1='2' x2='11' y2='13' />
    <polygon points='22 2 15 22 11 13 2 9 22 2' />
  </svg>
)

const MessageIcon = () => (
  <svg
    className='h-8 w-8'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' />
  </svg>
)

const Icons = {
  Clock: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  ),
  ChevronRight: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
    </svg>
  ),
  ChevronDown: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
    </svg>
  ),
  Heart: ({ filled }: { filled?: boolean }) => (
    <svg
      className='w-4 h-4'
      fill={filled ? 'currentColor' : 'none'}
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
      />
    </svg>
  ),
  Star: ({ filled }: { filled?: boolean }) => (
    <svg
      className='w-5 h-5'
      fill={filled ? 'currentColor' : 'none'}
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
      />
    </svg>
  ),
  Message: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
      />
    </svg>
  ),
  ExternalLink: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
      />
    </svg>
  ),
  SwapArrows: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
      />
    </svg>
  ),
  Send: () => (
    <svg className='w-4 h-4' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        stroke='currentColor'
        d='M5 12h14M13 7l6 5-6 5'
      />
    </svg>
  ),
  Close: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M6 18L18 6M6 6l12 12'
      />
    </svg>
  ),
}

const CommentSection: React.FC<{
  offerId: string
  user: User | null
  profile: Profile | null
}> = ({ offerId, user, profile }) => {
  const { showToast } = useToast()

  const [messages, setMessages] = useState<OfferMessage[]>([])
  const [newMessage, setNewMessage] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)

  const { chatContainerRef, scrollToBottom, isNearBottom } = useChatScroll([messages])

  useEffect(() => {
    // Subscribe to real-time updates
    supabase
      .channel('offer_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offer_messages',
          filter: `offer_id=eq.${offerId}`,
        },
        (payload) => {
          // Ignore own messages
          if (payload.new.user_id === user?.id) return

          const shouldScroll = isNearBottom()

          setMessages((prevMsgs) => [...prevMsgs, payload.new as OfferMessage])
          if (shouldScroll) {
            scrollToBottom()
          }
        },
      )
      .subscribe()

    // Fetch initial activities
    setPage(1)
    fetchMessages(1)

    return () => {
      supabase.channel('activities').unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMessages = async (page: number) => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('offer_messages')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false })
        .range((page - 1) * FEED_ITEMS_PER_PAGE, page * FEED_ITEMS_PER_PAGE - 1)

      if (error) {
        showToast(`⚠️ Failed to fetch comments`, 2500)
        throw error
      }

      if (data && data.length > 0) {
        const reversedData = data.reverse()
        setMessages((prevMsgs) => (page === 1 ? reversedData : [...prevMsgs, ...reversedData]))
        setHasMore(data.length === FEED_ITEMS_PER_PAGE)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      showToast(`⚠️ Failed to fetch comments`, 2500)
      console.error('Failed to fetch comments', error)
    } finally {
      setLoading(false)
    }
  }

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!newMessage.trim()) return

    if (!user || !profile) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (profile?.banned) {
      showToast(`⚠️ You are banned from commenting`, 2500)
      return
    }

    try {
      const optimisticId = Math.random()
      const newMsg = {
        user_id: profile.id,
        offer_id: offerId,
        type: 'user',
        message: newMessage.trim(),
        username: profile.username,
        profile_pic_url: profile.profile_pic_url,
      }

      // optimistaclly update the UI
      const shouldScroll = isNearBottom()
      setMessages((prevMsgs) => [
        ...prevMsgs,
        {
          ...newMsg,
          id: optimisticId,
          created_at: new Date().toISOString(),
        } as unknown as OfferMessage,
      ])

      const { error } = await supabase.from('offer_messages').insert(newMsg)

      if (error) {
        showToast(`⚠️ Failed to send message`, 2500)
        console.error('Error submitting comment:', error)
        setMessages(messages.filter((msg) => Number(msg.id) !== optimisticId))
      } else {
        setNewMessage('')
      }

      if (shouldScroll) {
        scrollToBottom()
      }
    } catch (error) {
      showToast(`⚠️ Failed to send message`, 2500)
      console.error('Failed to send message', error)
    }
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
      {/* Header */}
      <div className='border-b border-gray-100 px-3 py-2'>
        <h3 className='text-sm font-medium text-gray-900'>Comments</h3>
      </div>

      {/* Messages Container */}
      <div className='max-h-[400px] overflow-y-auto px-3 py-2 space-y-3 bg-gray-50'>
        {messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <div className='text-gray-400 mb-1'>
              <MessageIcon />
            </div>
            <p className='text-gray-600 text-sm font-medium'>No comments yet</p>
            <p className='text-gray-400 text-xs'>Be the first to share your thoughts!</p>
          </div>
        ) : (
          messages.map((offerMsg) => (
            <div
              key={offerMsg.id}
              className='group flex items-start space-x-2 hover:bg-gray-50/80 rounded-md p-1.5 -mx-1.5 transition-colors duration-200'
            >
              <div className='relative h-8 w-8 flex-shrink-0'>
                <img
                  src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + offerMsg.profile_pic_url}
                  alt={offerMsg.username}
                  className='rounded-full object-cover w-full h-full'
                />
                <div className='absolute inset-0 rounded-full ring-1 ring-white' />
              </div>
              <div className='flex-1 min-w-0 pt-0.5'>
                <div className='flex items-center gap-x-1.5'>
                  <span className='text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors'>
                    {offerMsg.username}
                  </span>
                  <span className='text-gray-400 text-xs'>·</span>
                  <time className='text-xs text-gray-500'>
                    {timeAgoShort(new Date(offerMsg.created_at))}
                  </time>
                </div>
                <p className='text-sm text-gray-700 whitespace-pre-wrap break-words leading-snug'>
                  {offerMsg.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <div className='border-t border-gray-100 p-3 bg-white rounded-b-lg'>
        <form onSubmit={submitMessage} className='flex items-center gap-x-2'>
          <div className='relative flex-1'>
            <input
              type='text'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Write a comment...'
              className='w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm 
                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent 
                transition-all duration-200 placeholder:text-gray-400'
            />
            {loading && (
              <div className='absolute right-2 top-1/2 -translate-y-1/2'>
                <div className='animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-300 border-t-blue-600' />
              </div>
            )}
          </div>
          <button
            type='submit'
            disabled={!newMessage.trim() || loading}
            className='inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 
              text-white rounded-md text-xs font-medium 
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 
              focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed 
              disabled:hover:bg-blue-600 transition-colors duration-200'
          >
            <SendIcon />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}

const UserInfo: React.FC<{ username: string; profilePic: string }> = ({
  username,
  profilePic,
}) => (
  <div className='flex items-center space-x-2'>
    <div className='h-5 w-5 rounded-full overflow-hidden flex-shrink-0'>
      <img
        src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + profilePic}
        alt={username}
        className='w-full h-full object-cover'
      />
    </div>
    <span className='text-sm font-medium'>{username}</span>
  </div>
)

const ActionButton: React.FC<{
  onClick: (e: React.MouseEvent) => void
  variant: 'accept' | 'decline' | 'counter'
  disabled?: boolean
}> = ({ onClick, variant, disabled }) => {
  const variants = {
    accept: 'bg-white border-green-600 text-green-600 hover:bg-green-50',
    decline: 'bg-white border-red-600 text-red-600 hover:bg-red-50',
    counter: 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50',
  }

  const labels = {
    accept: 'Accept',
    decline: 'Reject',
    counter: 'Counter',
  }

  const icons = {
    accept: (
      <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
      </svg>
    ),
    decline: (
      <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M6 18L18 6M6 6l12 12'
        />
      </svg>
    ),
    counter: (
      <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
        />
      </svg>
    ),
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} 
        flex items-center space-x-1.5 px-3 py-1.5 
        rounded-full border text-sm font-medium
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {icons[variant]}
      <span>{labels[variant]}</span>
    </button>
  )
}

const MetricsBar: React.FC<{
  isOpenOffer: boolean
  creatorLikes: {
    id: string
    username: string
    count: number
    hasUserLiked: boolean
  }
  counterpartyLikes: {
    id: string
    username: string
    count: number
    hasUserLiked: boolean
  }
  onLike: (liked_side: 'creator' | 'counterparty') => void
  showActions?: boolean
  status: string
  onAccept?: (e: React.MouseEvent) => void
  onDecline?: (e: React.MouseEvent) => void
  onCounter?: (e: React.MouseEvent) => void
}> = ({
  isOpenOffer,
  creatorLikes,
  counterpartyLikes,
  onLike,
  showActions,
  status,
  onAccept,
  onDecline,
  onCounter,
}) => (
  <div className='flex items-center justify-between mt-4'>
    <div className='flex items-center space-x-2 text-gray-500'>
      {isOpenOffer ? (
        <LikeButton
          count={creatorLikes.count}
          isLiked={creatorLikes.hasUserLiked}
          onLike={() => onLike('creator')}
        />
      ) : (
        <>
          <LikeButton
            count={creatorLikes.count}
            isLiked={creatorLikes.hasUserLiked}
            onLike={() => onLike('creator')}
            label={`${creatorLikes.username}`}
          />
          <LikeButton
            count={counterpartyLikes.count}
            isLiked={counterpartyLikes.hasUserLiked}
            onLike={() => onLike('counterparty')}
            label={`${counterpartyLikes.username}`}
          />
        </>
      )}
    </div>
    {showActions && (
      <div className='flex items-center space-x-2'>
        <ActionButton variant='decline' onClick={onDecline || (() => {})} />
        <ActionButton variant='counter' onClick={onCounter || (() => {})} />
        <ActionButton variant='accept' onClick={onAccept || (() => {})} />
      </div>
    )}
  </div>
)

const FavoriteButton: React.FC<{ isFavorited: boolean; onClick: () => void }> = ({
  isFavorited,
  onClick,
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}
    className={`p-1.5 hover:bg-gray-100 rounded-full ${isFavorited ? 'text-yellow-500' : 'text-gray-500'} hover:text-yellow-500 transition-colors`}
  >
    <Icons.Star filled={isFavorited} />
  </button>
)

const LikeButton: React.FC<{
  count: number
  isLiked: boolean
  onLike: () => void
  label?: string
}> = ({ count, isLiked, onLike, label }) => (
  <button
    onClick={(e) => {
      e.stopPropagation()

      if (!isLiked) {
        onLike()
      }
    }}
    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors
      ${
        isLiked
          ? 'bg-red-50 text-red-500'
          : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500'
      }`}
  >
    <Icons.Heart filled={isLiked} />
    <span className='text-sm font-medium'>{count}</span>
    {label && <span className='text-sm'>{label}</span>}
  </button>
)

const OfferSide: React.FC<{
  assets: Array<NFTAsset>
  isExpanded: boolean
  side: 'creator' | 'counterparty'
}> = ({ assets, isExpanded, side }) => (
  <div
    className={`flex flex-col ${isExpanded ? 'flex-1 h-full p-3' : ''} ${
      side === 'creator' && isExpanded ? 'border-r border-gray-100' : ''
    }`}
  >
    <div className={isExpanded ? 'flex-1' : ''}>
      <div className={`flex ${isExpanded ? 'flex-col space-y-3' : 'flex-row space-x-4'}`}>
        {assets?.map((asset) => (
          <div
            key={asset.nft_id}
            className={`group transition-transform duration-200 ${
              isExpanded ? 'w-full hover:-translate-y-0.5' : 'hover:scale-105'
            }`}
          >
            <div className='flex items-start space-x-2'>
              <div className={`relative ${isExpanded ? 'h-12 w-12' : 'h-10 w-10'}`}>
                <NFTImage
                  src={asset.image}
                  alt={asset.name}
                  fallback={asset.name}
                  rounded='all'
                  className='ring-1 ring-gray-200 group-hover:ring-blue-200 transition-shadow'
                />
              </div>
              <div className='flex flex-col min-w-0 py-0.5'>
                <span className='text-xs font-medium text-gray-900 truncate'>{asset.name}</span>
                <span className='flex items-center mt-0.5'>
                  <ChainLogo chainId={asset.chain_id} className='w-3 h-3' />
                  <span className='ml-1 text-xs text-gray-600'>Ethereum</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const TradeOffer: React.FC<{
  offer: OfferData
  isOpenOffer: boolean
  isExpanded: boolean
}> = ({ offer, isOpenOffer, isExpanded }) => {
  if (isOpenOffer) {
    return (
      <div className='mb-3'>
        {offer.counterparty_assets[0] && (
          <div className='flex items-start space-x-2.5 p-2.5 rounded-lg bg-gray-50/80 border border-gray-200 hover:bg-gray-50 transition-colors'>
            <div className='relative h-10 w-10 flex-shrink-0'>
              <NFTImage
                src={offer.counterparty_assets[0].image}
                alt={offer.counterparty_assets[0].name}
                fallback={offer.counterparty_assets[0].name}
                rounded='all'
                className='ring-1 ring-gray-200'
              />
            </div>
            <div className='flex flex-col min-w-0 py-0.5'>
              <span className='text-sm font-medium text-gray-900 truncate'>
                {offer.counterparty_assets[0].name}
              </span>
              <span className='flex items-center mt-0.5'>
                <ChainLogo chainId={1} className='w-3 h-3' />
                <span className='ml-1 text-xs text-gray-600'>Ethereum</span>
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='mb-3'>
      <div
        className={`flex bg-gray-50/80 border border-gray-200 rounded-lg custom-scrollbar ${
          isExpanded ? 'max-h-[280px] overflow-y-auto' : 'p-3 items-center overflow-x-auto'
        }`}
      >
        <OfferSide assets={offer.creator_assets} isExpanded={isExpanded} side='creator' />

        {!isExpanded && (
          <div className='flex items-center px-2'>
            <div className='bg-white/80 shadow-sm border border-gray-100 rounded-full p-1.5'>
              <SwapArrowsIcon />
            </div>
          </div>
        )}

        <OfferSide
          assets={offer.counterparty_assets}
          isExpanded={isExpanded}
          side='counterparty'
        />
      </div>
    </div>
  )
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  user,
  profile,
  onLike,
  onFavorite,
  onAccept,
  onDecline,
  onCounter,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isCounterparty = user?.id === offer.counterparty_id

  const isOpenOffer = offer.status === 'open'

  const isActive = offer.status === 'created' || offer.status === 'countered'
  const showActions = isCounterparty && isActive

  return (
    <div
      className='w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer'
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className={`${isExpanded ? 'p-4' : 'p-3'}`}>
        <div className='flex items-center justify-between mb-2 p-2'>
          <div className='flex items-center space-x-1'>
            <UserInfo
              username={offer.creator_username}
              profilePic={offer.creator_profile_pic_url}
            />
            <Icons.ChevronRight />
            <UserInfo
              username={offer.counterparty_username}
              profilePic={offer.counterparty_profile_pic_url}
            />
          </div>
          <div className='flex items-center space-x-2.5'>
            <FavoriteButton isFavorited={offer.favorited_by_user} onClick={onFavorite} />

            <a
              href={`/offer/${offer.offer_id}`}
              target='_blank'
              rel='noopener noreferrer'
              className='p-1.5 text-gray-500 hover:bg-gray-100 rounded-full'
              onClick={(e) => e.stopPropagation()}
            >
              <Icons.ExternalLink />
            </a>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className='p-1.5 hover:bg-gray-100 rounded-full'
            >
              {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
            </button>
          </div>
        </div>
        {isOpenOffer ? (
          <>
            {offer.counterparty_assets[0] && (
              <div className='bg-gray-50/80 border border-gray-200 rounded-lg p-3'>
                <div className='flex items-center'>
                  <div className='w-10 h-10'>
                    <NFTImage
                      src={offer.counterparty_assets[0].image}
                      alt={offer.counterparty_assets[0].name}
                      fallback={offer.counterparty_assets[0].name}
                      rounded='all'
                    />
                  </div>
                  <span className='ml-1.5 text-xs text-gray-900'>
                    <div>{offer.counterparty_assets[0].name}</div>
                    <div className='flex items-center'>
                      <ChainLogo chainId={1} className='w-3 h-3' />
                      <div className='ml-1'>Ethereum</div>
                    </div>
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <TradeOffer offer={offer} isOpenOffer={isOpenOffer} isExpanded={isExpanded} />
        )}
        {isExpanded ? (
          <div className='mt-4 space-y-4'>
            <CommentSection offerId={offer.offer_id} user={user} profile={profile} />
            <MetricsBar
              isOpenOffer={isOpenOffer}
              creatorLikes={{
                id: offer.creator_id,
                username: offer.creator_username,
                count: offer.creator_side_likes,
                hasUserLiked: offer.creator_side_liked_by_user,
              }}
              counterpartyLikes={{
                id: offer.counterparty_id,
                username: offer.counterparty_username,
                count: offer.counterparty_side_likes,
                hasUserLiked: offer.counterparty_side_liked_by_user,
              }}
              onLike={(liked_side: 'creator' | 'counterparty') => onLike(liked_side)}
              showActions={showActions}
              status={offer.status}
              onAccept={(e) => {
                e.stopPropagation()
                onAccept(offer.offer_id)
              }}
              onDecline={(e) => {
                e.stopPropagation()
                onDecline(offer.offer_id)
              }}
              onCounter={(e) => {
                e.stopPropagation()
                onCounter(offer.offer_id)
              }}
            />
          </div>
        ) : (
          <MetricsBar
            isOpenOffer={isOpenOffer}
            creatorLikes={{
              id: offer.creator_id,
              username: offer.creator_username,
              count: offer.creator_side_likes,
              hasUserLiked: offer.creator_side_liked_by_user,
            }}
            counterpartyLikes={{
              id: offer.counterparty_id,
              username: offer.counterparty_username,
              count: offer.counterparty_side_likes,
              hasUserLiked: offer.counterparty_side_liked_by_user,
            }}
            onLike={(liked_side: 'creator' | 'counterparty') => onLike(liked_side)}
            showActions={showActions}
            status={offer.status}
            onAccept={(e) => {
              e.stopPropagation()
              onAccept(offer.offer_id)
            }}
            onDecline={(e) => {
              e.stopPropagation()
              onDecline(offer.offer_id)
            }}
            onCounter={(e) => {
              e.stopPropagation()
              onCounter(offer.offer_id)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default OfferCard
