'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { Footer } from '@/components'
import { LoadMore } from '@/components/shared/buttons'
import { useIsMobile } from '@/hooks'
import { Expand, Notifications } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { FEED_ITEMS_PER_PAGE } from '@/utils/constants'
import { timeAgoShort } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

interface Notification {
  id: string
  notification_type: string
  message: string
  metadata: {
    offer_id?: string
    user: {
      username: string
      profile_pic_url: string
    }
  }
  created_at: string
  user_id: string
}

const FeedItem = ({ notification }: { notification: Notification }) => {
  const { user } = notification.metadata

  return (
    <div className='space-y-1'>
      <div className='flex items-center'>
        <Link
          href={`/${user.username}`}
          target='_blank'
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className='relative w-8 h-8 mr-2 shrink-0'
        >
          <img
            src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}${user.profile_pic_url}`}
            alt={`${user.username}'s profile`}
            className='w-full h-full rounded-full'
          />
        </Link>

        <div className='flex flex-grow items-start justify-between'>
          <div className='flex items-center gap-x-1'>
            <span className='text-sm font-semibold'>{user.username}</span>
            <span className='text-gray-500'>·</span>
            <span className='text-xs text-gray-700'>
              {timeAgoShort(new Date(notification.created_at))}
            </span>
          </div>

          <Expand className='text-gray-500 ml-2' />
        </div>
      </div>

      <div className='text-sm text-gray-600'>{notification.message}</div>
    </div>
  )
}

const NotificationsPage: React.FC = () => {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [initialFetchComplete, setInitialFetchComplete] = useState(false)

  const fetchNotifications = async (pageNum: number) => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * FEED_ITEMS_PER_PAGE, pageNum * FEED_ITEMS_PER_PAGE - 1)

      if (error) throw error

      if (data?.length > 0) {
        setNotifications((prev) => (pageNum === 1 ? data : [...prev, ...data]))
        setHasMore(data.length === FEED_ITEMS_PER_PAGE)
      } else {
        setHasMore(false)
      }

      if (pageNum === 1) setInitialFetchComplete(true)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setCurrentPage((prev) => prev + 1)
      fetchNotifications(currentPage + 1)
    }
  }

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${
          !isMobile && 'mb-[50px]'
        }`}
      >
        <div className='max-w-2xl mx-auto w-full px-4 py-6'>
          <h1 className='text-2xl font-bold mb-6'>Notifications</h1>

          {!initialFetchComplete ? (
            <div className='flex justify-center py-8'>
              <div className='w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin' />
            </div>
          ) : notifications.length > 0 ? (
            <div className='space-y-4'>
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  target='_blank'
                  href={
                    notification.notification_type === 'follow'
                      ? `/${notification.metadata.user.username}`
                      : notification.notification_type === 'transaction_done' ||
                          notification.notification_type === 'transaction_cancelled'
                        ? `/transactions/${notification.metadata.offer_id}`
                        : `/offers/${notification.metadata.offer_id}`
                  }
                  className='block bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50'
                >
                  <FeedItem notification={notification} />
                </Link>
              ))}

              {hasMore && <LoadMore onClick={handleLoadMore} isLoading={isLoading} />}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <Notifications className='w-12 h-12 text-gray-400' />
              <h3 className='text-lg font-semibold mt-4 mb-2'>No Notifications</h3>
              <p className='text-sm text-gray-500 max-w-md'>
                When you have new notifications, they&apos;ll appear here.
              </p>
            </div>
          )}
        </div>
      </div>
      {!isMobile && <Footer />}
    </div>
  )
}

export default NotificationsPage
