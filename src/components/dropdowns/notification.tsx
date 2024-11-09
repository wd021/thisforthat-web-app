'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { Expand, Notifications } from '@/icons'
import { timeAgoShort } from '@/utils/helpers'

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
  updated_at: string
}

const FeedItem = ({ notification }: { notification: Notification }) => {
  const { user } = notification.metadata

  return (
    <div className='space-y-3'>
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
              {timeAgoShort(new Date(notification.updated_at))}
            </span>
          </div>

          <Expand className='text-gray-500 ml-2' />
        </div>
      </div>

      <div className='text-sm text-gray-600'>{notification.message}</div>
    </div>
  )
}

const NotificationDropdown: React.FC<{
  notifications: Notification[]
  newCount: number
  onOpen: () => void
}> = ({ notifications, newCount, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const toggleDropdown = () => {
    if (!isOpen && newCount > 0) {
      onOpen()
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className='h-full w-[45px] rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'
      >
        <Notifications className='w-[22px] h-[22px]' />
        {newCount > 0 && (
          <span className='z-10 absolute top-[4px] right-[4px] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full'>
            {newCount > 9 ? '9+' : newCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute right-[-55px] mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10'>
          <div className='flex flex-col max-h-[90vh]'>
            <div className='p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold'>Notifications</h3>
            </div>
            <div className='flex-grow overflow-y-auto hide-scrollbar'>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={
                      notification.notification_type === 'follow'
                        ? `/${notification.metadata.user.username}`
                        : notification.notification_type === 'transaction_done' ||
                            notification.notification_type === 'transaction_cancelled'
                          ? `/transactions/${notification.metadata.offer_id}`
                          : `/offers/${notification.metadata.offer_id}`
                    }
                    target='_blank'
                    className='block border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50'
                    onClick={() => {
                      toggleDropdown()
                    }}
                  >
                    <FeedItem notification={notification} />
                  </Link>
                ))
              ) : (
                <div className='flex flex-col items-center justify-center h-full p-6 text-center'>
                  <Notifications className='w-8 h-8' />
                  <h3 className='text-lg font-semibold my-2'>No Notifications</h3>
                  <p className='text-sm text-gray-500 px-6'>
                    When you have new notifications, they&apos;ll appear here.
                  </p>
                </div>
              )}
            </div>
            <div className='p-4 border-t border-gray-200'>
              <Link
                href='/notifications'
                className='text-blue-500 hover:underline text-sm font-medium'
                onClick={() => {
                  toggleDropdown()
                }}
              >
                Show All Notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
