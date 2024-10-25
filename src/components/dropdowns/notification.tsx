'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { NFTOfferDisplay } from '@/components/shared'
import { Notifications } from '@/icons'
import { timeAgoShort } from '@/utils/helpers'

interface Notification {
  id: string
  notification_type: string
  metadata: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    offer: any
    offer_id?: string
    username: string
    profile_pic_url: string
  }
  updated_at: string
}

const FeedItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const isClickable = ['offer_new', 'offer_update', 'offer_accepted'].includes(
    notification.notification_type,
  )

  const getMessage = () => {
    switch (notification.notification_type) {
      case 'follow':
        return <>started following you</>
      case 'message':
        return <>sent you a new message</>
      case 'offer_new':
        return <>made a new offer</>
      case 'offer_update':
        return <>made a counter offer</>
      case 'offer_accepted':
        return <>accepted your offer</>
      default:
        return 'Unknown notification'
    }
  }

  return (
    <div
      className={`p-4 ${
        isClickable
          ? 'cursor-pointer hover:bg-gray-100 transition-colors duration-200 group'
          : ''
      }`}
    >
      <div className='flex items-start'>
        <Link
          href={`/${notification.metadata.username}`}
          target='_blank'
          onClick={(e) => e.stopPropagation()}
          className='relative w-10 h-10 mr-3 shrink-0'
        >
          <img
            src={
              process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
              notification.metadata.profile_pic_url
            }
            alt='Profile Picture'
            className='w-full h-full rounded-full'
          />
        </Link>
        <div className='flex-grow flex items-start justify-between'>
          <div className='flex-grow'>
            <div className='flex items-center gap-x-1'>
              <div className='text-sm font-semibold'>{notification.metadata.username}</div>
              <span className='text-gray-500'>·</span>
              <div className='text-xs text-gray-700'>
                {timeAgoShort(new Date(notification.updated_at))}
              </div>
            </div>
            <div className='text-sm'>{getMessage()}</div>
          </div>
          {isClickable && (
            <div className='flex items-center text-gray-500 ml-2'>
              <span className='text-xs mr-1'>Expand</span>
              <svg
                fill='none'
                height='14'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
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
      {['offer_new', 'offer_update', 'offer_accepted'].includes(
        notification.notification_type,
      ) &&
        notification.metadata.offer && (
          <div className='mt-2 w-full'>
            <NFTOfferDisplay
              userAOffers={notification.metadata.offer.user}
              userBOffers={notification.metadata.offer.userCounter}
              size='medium'
              status={
                notification.notification_type === 'offer_acepted' ? 'accepted' : 'pending'
              }
            />
          </div>
        )}
    </div>
  )
}

const NotificationDropdown: React.FC<{
  notifications: Notification[]
  selectOffer: (offerId: string) => void
  newCount: number
  onOpen: () => void
}> = ({ notifications, selectOffer, newCount, onOpen }) => {
  const router = useRouter()
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

  const handleNotificationClick = (notification: Notification) => {
    if (notification.notification_type !== 'follow') {
      selectOffer(notification.metadata.offer_id!)
    } else {
      router.push(`/${notification.metadata.username}`)
    }
    toggleDropdown()
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
        <div className='absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10'>
          <div className='flex flex-col h-[480px]'>
            {' '}
            <div className='p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold'>Notifications</h3>
            </div>
            <div className='flex-grow overflow-y-auto hide-scrollbar'>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className='hover:bg-gray-50 border-b border-gray-200 w-full cursor-pointer'
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <FeedItem notification={notification} />
                  </div>
                ))
              ) : (
                <div className='flex flex-col items-center justify-center h-full p-6 text-center'>
                  <Notifications className='w-12 h-12' />
                  <h3 className='text-lg font-semibold my-2'>No New Notifications</h3>
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
