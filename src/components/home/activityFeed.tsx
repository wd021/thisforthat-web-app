import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { NFTOfferDisplay } from '@/components/shared'
import { useChatScroll } from '@/hooks'
import { CollapsibleIcon } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { Activity } from '@/types/supabase'
import { SimplifiedOfferItem } from '@/types/supabase'
import { FEED_ITEMS_PER_PAGE } from '@/utils/constants'
import { timeAgoShort } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

function renderMessageText(text: string) {
  // This regex matches URLs with common TLDs, requiring either www. or http(s)://
  const urlRegex =
    /\b(?:https?:\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|](?:\.(?:com|net|org|edu|gov|mil|co|io|ai|app|dev|xyz))\b/gi

  const parts: (string | JSX.Element)[] = []
  let lastIndex = 0
  let match

  while ((match = urlRegex.exec(text)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Add the matched URL
    let fullUrl = match[0]
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl
    }

    parts.push(
      <a
        key={match.index}
        href={fullUrl}
        target='_blank'
        rel='noopener noreferrer'
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className='underline'
      >
        {match[0]}
      </a>,
    )

    lastIndex = urlRegex.lastIndex
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <>{parts}</>
}

type FilterType = 'all' | 'messages' | 'swaps'

interface ActivityFeedToggleProps {
  filter: FilterType
  setFilter: (filter: FilterType) => void
}

const FeedItem: React.FC<{
  activity: Activity
  setViewOfferItem: (item: SimplifiedOfferItem) => void
}> = ({ activity, setViewOfferItem }) => {
  const isClickable = activity.activity_type !== 'message'

  return (
    <div
      key={activity.id}
      className={`border-b border-gray-200 p-4 ${
        isClickable
          ? 'cursor-pointer hover:bg-gray-100 transition-colors duration-200 group'
          : ''
      }`}
      onClick={() => {
        if (isClickable) {
          const viewOfferItem: SimplifiedOfferItem = {
            id: (activity.metadata as { offer_id: string }).offer_id,
            status: activity.activity_type === 'offer_accepted' ? 'accepted' : 'pending',
          }
          setViewOfferItem(viewOfferItem)
        }
      }}
    >
      <div className='flex items-start'>
        <Link
          href={`/${activity.username}`}
          target='_blank'
          onClick={(e) => e.stopPropagation()}
          className='relative w-10 h-10 mr-3 shrink-0'
        >
          <img
            src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + activity.profile_pic_url}
            alt='Profile'
            className='w-full h-full rounded-full'
          />
        </Link>
        <div className='flex-grow flex items-start justify-between'>
          <div className='flex-grow'>
            <div className='flex items-center gap-x-1'>
              <div className='text-sm font-semibold text-gray-800'>{activity.username}</div>
              <span className='text-gray-500'>·</span>
              <div className='text-xs text-gray-700'>
                {timeAgoShort(new Date(activity.created_at))}
              </div>
            </div>
            {activity.activity_type === 'message' && (
              <div className='text-sm'>{renderMessageText(activity.content || '')}</div>
            )}
            {(activity.activity_type === 'offer_start' ||
              activity.activity_type === 'offer_accepted' ||
              activity.activity_type === 'offer_counter') && (
              <div className='text-sm'>
                {activity.activity_type === 'offer_start'
                  ? 'made an offer'
                  : activity.activity_type === 'offer_counter'
                    ? 'made a counter offer'
                    : 'accepted an offer'}
              </div>
            )}
          </div>
          {isClickable && (
            <div className='flex items-center text-gray-500 ml-2'>
              <span className='text-xs mr-1'>Expand</span>
              <svg
                fill='none'
                height='14'
                stroke='currentColor'
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                viewBox='0 0 24 24'
                width='14'
              >
                <line x1='7' x2='17' y1='17' y2='7' />
                <polyline points='7 7 17 7 17 17' />
              </svg>
            </div>
          )}
        </div>
      </div>
      {(activity.activity_type === 'offer_start' ||
        activity.activity_type === 'offer_accepted' ||
        activity.activity_type === 'offer_counter') && (
        <div className='mt-2 w-full'>
          <NFTOfferDisplay
            userAOffers={(activity.metadata as { offer: { user: never } }).offer.user}
            userBOffers={
              (activity.metadata as { offer: { userCounter: never } }).offer.userCounter
            }
            size='medium'
            status={activity.activity_type === 'offer_accepted' ? 'accepted' : 'pending'}
          />
        </div>
      )}
    </div>
  )
}

const ActivityFeedToggle: React.FC<ActivityFeedToggleProps> = ({ filter, setFilter }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filterOptions: FilterType[] = ['all', 'messages', 'swaps']

  const getFilterEmoji = (filterType: FilterType) => {
    switch (filterType) {
      case 'all':
        return '🔄'
      case 'messages':
        return '💬'
      case 'swaps':
        return '🤝'
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={dropdownRef} className='z-[50] mr-2.5 relative inline-block text-left'>
      <div>
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          className='inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'
          id='options-menu'
          aria-haspopup='true'
          aria-expanded='true'
        >
          {getFilterEmoji(filter)} {filter.charAt(0).toUpperCase() + filter.slice(1)}
          <svg
            className='-mr-1 ml-2 h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className='origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
          <div
            className='py-1'
            role='menu'
            aria-orientation='vertical'
            aria-labelledby='options-menu'
          >
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setFilter(option)
                  setIsOpen(false)
                }}
                className={`${
                  filter === option ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } group flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900`}
                role='menuitem'
              >
                <span className='mr-2'>{getFilterEmoji(option)}</span>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ActivityFeed: React.FC<{
  showCollapsibleTab: boolean
  setViewOfferItem: (item: SimplifiedOfferItem) => void
}> = ({ showCollapsibleTab = true, setViewOfferItem }) => {
  const { user, profile } = useAuth()
  const { showToast } = useToast()

  const [feedCollapsed, setFeedCollapsed] = useState(false)
  const toggleFeed = () => setFeedCollapsed(!feedCollapsed)

  const [activities, setActivities] = useState<Activity[]>([])
  const [newMessage, setNewMessage] = useState<string>('')
  const [filter, setFilter] = useState<FilterType>('all')

  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)

  const { chatContainerRef, scrollToBottom, isNearBottom } = useChatScroll([activities])

  useEffect(() => {
    // Subscribe to real-time updates
    supabase
      .channel('activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
        },
        (payload) => {
          // Ignore own messages
          if (payload.new.user_id === user?.id && payload.new.activity_type === 'message')
            return

          const shouldScroll = isNearBottom()
          if (filter === 'messages' && payload.new.activity_type !== 'message') return
          if (filter === 'swaps' && payload.new.activity_type === 'message') return
          setActivities((prevActivities) => [...prevActivities, payload.new as Activity])
          if (shouldScroll) {
            scrollToBottom()
          }
        },
      )
      .subscribe()

    // Fetch initial activities
    setPage(1)
    fetchActivities(1, filter)

    return () => {
      supabase.channel('activities').unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const fetchActivities = async (page: number, currentFilter: FilterType) => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })

      if (currentFilter === 'messages') {
        query = query.eq('activity_type', 'message')
      } else if (currentFilter === 'swaps') {
        query = query.neq('activity_type', 'message')
      }

      const { data, error } = await query.range(
        (page - 1) * FEED_ITEMS_PER_PAGE,
        page * FEED_ITEMS_PER_PAGE - 1,
      )

      if (error) {
        showToast(`⚠️ Failed to fetch activities`, 2500)
        throw error
      }

      if (data && data.length > 0) {
        const reversedData = data.reverse()
        setActivities((prevActivities) =>
          page === 1 ? reversedData : [...prevActivities, ...reversedData],
        )
        setHasMore(data.length === FEED_ITEMS_PER_PAGE)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      showToast(`⚠️ Failed to fetch activities`, 2500)
      console.error('Failed to fetch activities', error)
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
        activity_type: 'message',
        content: newMessage.trim(),
        username: profile.username,
        profile_pic_url: profile.profile_pic_url,
      }

      // optimistaclly update the UI
      const shouldScroll = isNearBottom()
      setActivities((prevActivities) => [
        ...prevActivities,
        {
          ...newMsg,
          id: optimisticId,
          created_at: new Date().toISOString(),
          metadata: null,
        } as unknown as Activity,
      ])

      const { error } = await supabase.from('activities').insert(newMsg)

      if (error) {
        showToast(`⚠️ Failed to send message`, 2500)
        console.error('Error submitting comment:', error)
        setActivities(activities.filter((activity) => Number(activity.id) !== optimisticId))
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

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true
    if (filter === 'messages') return activity.activity_type === 'message'
    if (filter === 'swaps') return activity.activity_type !== 'message'
    return true
  })

  const desktopStyle = `shadow-[0_0_3px_#bbbbbb] hidden lg:flex flex-col h-full ${
    feedCollapsed ? 'w-12' : 'w-[460px]'
  } bg-gray-50 transition-all duration-300 ease-in-out shrink-0`
  const mobileStyle = `h-full w-full flex flex-col`

  return (
    <div
      className={`${showCollapsibleTab ? desktopStyle : mobileStyle} rounded-l-xl overflow-hidden`}
    >
      {showCollapsibleTab && (
        <div
          className={`bg-white cursor-pointer flex items-center ${
            feedCollapsed ? 'flex-col h-full' : 'justify-between'
          } border-b border-gray-100`}
          onClick={toggleFeed}
        >
          <div className={`flex items-center p-4 ${feedCollapsed ? 'flex-col' : ''}`}>
            <CollapsibleIcon collapsed={feedCollapsed} />
            <span
              className={`${feedCollapsed ? 'mt-2 writing-vertical-lr transform rotate-180' : 'ml-2'} font-semibold`}
            >
              Latest Activity
            </span>
          </div>
          {!feedCollapsed && <ActivityFeedToggle filter={filter} setFilter={setFilter} />}
        </div>
      )}
      {!feedCollapsed && (
        <>
          <div
            ref={chatContainerRef}
            className='flex flex-col flex-1 overflow-y-auto hide-scrollbar'
          >
            {filteredActivities.length > 0 && hasMore && (
              <button
                className='bg-gray-100 py-2 px-6 text-gray-600 hover:bg-gray-200 transition-colors duration-300 text-sm font-medium my-4 mx-auto rounded-full shadow-sm flex items-center'
                onClick={() => {
                  const nextPage = page + 1
                  setPage(nextPage)
                  fetchActivities(nextPage, filter)
                }}
              >
                Load more
              </button>
            )}
            {filteredActivities.map((activity: Activity) => (
              <FeedItem
                key={activity.id}
                activity={activity}
                setViewOfferItem={setViewOfferItem}
              />
            ))}
          </div>
          <div className='p-4 bg-gray-50 border-t border-gray-100'>
            <form onSubmit={submitMessage} className='flex items-center gap-x-2'>
              <input
                type='text'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder='Send a message...'
                className='flex-grow px-4 py-2 border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent'
              />
              <button
                type='submit'
                className='bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default ActivityFeed
