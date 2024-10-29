import React from 'react'
import Link from 'next/link'

import { NFTOfferDisplay } from '@/components/shared'
import { OfferFeedItem, Profile } from '@/types/supabase'
import { timeAgoShort } from '@/utils/helpers'

interface NFTOfferItemProps {
  item: OfferFeedItem
  userId: string | null
  statusDetailed?: boolean
  viewOffer: (offer: OfferFeedItem) => void
}

const UserInfo: React.FC<{ user: Profile; isRight?: boolean }> = ({
  user,
  isRight = false,
}) => (
  <Link
    href={`/${user.username}`}
    target='_blank'
    onClick={(e) => e.stopPropagation()}
    className={`flex items-center space-x-2 ${isRight ? 'flex-row-reverse space-x-reverse' : ''} group`}
  >
    <div className='relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0'>
      <img
        src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}${user.profile_pic_url}`}
        alt={user.username}
        className='w-full h-full object-cover'
      />
    </div>
    <span className='font-semibold text-sm truncate'>{user.username}</span>
  </Link>
)

const StatusDisplay: React.FC<{
  status: string
  statusDetailed: boolean
  isMyTurn: boolean
}> = ({ status, statusDetailed, isMyTurn }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          bgColor: !statusDetailed ? 'bg-yellow-100' : isMyTurn ? 'bg-blue-100' : 'bg-gray-100',
          textColor: !statusDetailed
            ? 'text-yellow-800'
            : isMyTurn
              ? 'text-blue-800'
              : 'text-gray-800',
          dotColor: !statusDetailed
            ? 'bg-yellow-500'
            : isMyTurn
              ? 'bg-blue-500'
              : 'bg-gray-400',
          text: !statusDetailed ? 'negotiating' : isMyTurn ? 'Your turn' : `Not your turn`,
        }
      case 'accepted':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          dotColor: 'bg-green-500',
          text: 'Offer Accepted',
        }
      case 'cancelled':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          dotColor: 'bg-red-500',
          text: 'Offer Cancelled',
        }
      case 'completed':
        return {
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          dotColor: 'bg-purple-500',
          text: 'Transfer Complete',
        }
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          dotColor: 'bg-gray-400',
          text: 'Unknown Status',
        }
    }
  }

  const { bgColor, textColor, dotColor, text } = getStatusConfig()

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1 rounded-full ${bgColor} ${textColor}`}
    >
      <div
        className={`w-2 h-2 rounded-full ${dotColor} ${status === 'pending' && isMyTurn ? 'animate-pulse' : ''}`}
      />
      <span className='text-xs font-medium'>{text}</span>
    </div>
  )
}

const NFTOfferItem: React.FC<NFTOfferItemProps> = ({
  item,
  userId,
  statusDetailed = false,
  viewOffer,
}) => {
  const isMyTurn = userId !== null && item.offer_user_id !== userId
  const userToAct = item.offer_user_id === item.user_id ? item.counter_user : item.user

  return (
    <div
      className={`bg-white w-full h-full rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col`}
      onClick={() => viewOffer(item)}
    >
      <div className='p-4 space-y-4'>
        <div className='flex justify-between items-center'>
          <UserInfo user={item.user} />
          <UserInfo user={item.counter_user} isRight />
        </div>

        <NFTOfferDisplay
          userAOffers={item.offer.user}
          userBOffers={item.offer.userCounter}
          size='large'
          defaultOpen={false}
          status={item.status}
        />
      </div>
      <div className='mt-auto px-4 py-3 bg-white bg-opacity-60 backdrop-blur-sm flex justify-between items-center transition-all duration-300'>
        <StatusDisplay
          status={item.status}
          statusDetailed={statusDetailed}
          isMyTurn={isMyTurn}
          userToAct={userToAct}
        />
        <span className='text-xs text-gray-600'>{timeAgoShort(new Date(item.updated_at))}</span>
      </div>
    </div>
  )
}

export default NFTOfferItem
