import React, { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { NFTOfferDisplay } from '@/components/shared'
import { ChainLogo, ChevronDown, ChevronUp, Close, Share } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { formatDate, timeAgoShort } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

const ActivityItem: FC<{ item: any; user: any; isLastItem: boolean }> = ({
  item,
  user,
  isLastItem,
}) => {
  return (
    <div className={`w-full ${!isLastItem ? 'border-b border-gray-200' : ''}`}>
      <div className='p-4'>
        <div className='flex items-start'>
          <Link
            href={`/${user?.username}`}
            target='_blank'
            onClick={(e) => e.stopPropagation()}
            className='relative w-10 h-10 mr-2 shrink-0'
          >
            <img
              src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user?.profile_pic_url}
              alt='Profile'
              className='w-full h-full rounded-full object-cover shadow-sm'
            />
          </Link>
          <div className='flex-grow'>
            <div className='flex items-center gap-x-1'>
              <div className='text-sm font-semibold text-gray-800'>{user?.username}</div>
              <span className='text-gray-500'>·</span>
              <div className='text-xs text-gray-700'>
                {timeAgoShort(new Date(item.created_at))}
              </div>
            </div>
            {item.item_type === 'message' && <div className='text-sm'>{item.content}</div>}
            {(item.item_type === 'offer' ||
              item.item_type === 'counter_offer' ||
              item.item_type === 'accept') && (
              <div className='text-sm'>
                {item.item_type === 'offer'
                  ? 'made an offer'
                  : item.item_type === 'counter_offer'
                    ? 'made a counter offer'
                    : 'accepted the offer'}
              </div>
            )}
          </div>
        </div>
        {(item.item_type === 'offer' ||
          item.item_type === 'counter_offer' ||
          item.item_type === 'accept') && (
          <div className='mt-2 w-full'>
            <NFTOfferDisplay
              userAOffers={item.offer.user}
              userBOffers={item.offer.userCounter}
              size='medium'
              status={item.item_type === 'accept' ? 'accepted' : 'pending'}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const ChainInfo: FC<{ chainName: string; chainLogo: string }> = ({ chainName, chainLogo }) => (
  <div className='flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1'>
    <ChainLogo chainId={1} className='w-4 h-4' />
    <span className='text-sm font-medium text-gray-700'>{chainName}</span>
  </div>
)

const Main: FC<{
  offerId: string
  info: any
  acceptOffer: () => void
  counterOffer: () => void
  closeModal: () => void
}> = ({ offerId, info, acceptOffer, counterOffer, closeModal }) => {
  const { showToast } = useToast()
  const { user, profile, hasProfile } = useAuth()
  const [newMessage, setNewMessage] = useState<string>('')
  const [offerActivityItems, setOfferActivityItems] = useState<any[]>([])
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)

  const fetchOfferActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('user_offer_items')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false })
        .limit(25)

      if (error) throw error

      setOfferActivityItems(data.reverse())
    } catch (error) {
      console.error('Failed to fetch activities', error)
    }
  }

  const copyOfferLink = () => {
    const offerUrl = `${window.location.origin}/offer/${offerId}`
    navigator.clipboard
      .writeText(offerUrl)
      .then(() => {
        showToast('✅ Link copied ', 2500)
      })
      .catch((err) => {
        console.error('Failed to copy link:', err)
        showToast('⚠️ Error copying link', 2500)
      })
  }

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newMessage.trim() || !profile) return

    try {
      if (profile?.banned) {
        alert('You are banned from commenting.')
        return
      }

      const optimisticId = Math.random()
      const newOfferItem = {
        offer_id: offerId,
        user_id: profile.id,
        item_type: 'message',
        content: newMessage.trim(),
      }

      setOfferActivityItems((prev) => [
        ...prev,
        {
          ...newOfferItem,
          id: optimisticId,
          created_at: new Date().toISOString(),
        } as unknown,
      ])

      const { error } = await supabase.from('user_offer_items').insert(newOfferItem)

      if (error) {
        console.error('Error submitting comment:', error)
        setOfferActivityItems((prev) => prev.filter((item) => Number(item.id) !== optimisticId))
      } else {
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message', error)
    }
  }

  useEffect(() => {
    if (offerId) fetchOfferActivity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId])

  const isInitialOfferUser = user?.id === info?.user_id
  const isCounterUser = user?.id === info?.user_id_counter
  const isLatestOfferUser = user?.id === info?.offer_user_id

  const isParticipant = (isInitialOfferUser || isCounterUser) && user
  const userToAct = info?.offer_user_id === info?.user_id ? info?.counter_user : info?.user

  return (
    <div className='flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden'>
      <div className='flex items-center justify-between py-4 px-6 bg-white border-b border-gray-100'>
        <div className='flex items-center space-x-4'>
          <div className='text-xl font-bold text-gray-800'>🤝 Swap Offer</div>
          <ChainInfo chainName={'ethereum'} chainLogo={'1'} />
        </div>
        <div className='flex items-center space-x-4'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyOfferLink}
            className='flex items-center text-gray-600 hover:text-gray-800'
          >
            <Share className='w-4 h-4 mr-1' />
            <span className='text-sm'>Share</span>
          </motion.button>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className='cursor-pointer text-gray-500 hover:text-gray-700'
            onClick={closeModal}
          >
            <Close className='w-6 h-6' />
          </motion.div>
        </div>
      </div>

      <div className='flex-grow overflow-y-auto'>
        {info &&
          offerActivityItems.map((item: any, index: number) => (
            <ActivityItem
              key={item.id}
              item={item}
              user={item.user_id === info?.user_id ? info.user : info.counter_user}
              isLastItem={index === offerActivityItems.length - 1}
            />
          ))}
      </div>

      {isParticipant && (
        <div className='bg-white border-t border-gray-200'>
          {info.status === 'pending' && (
            <div className='p-4 bg-gray-50 border-b border-gray-200'>
              <div className='flex flex-col space-y-3'>
                <div className='flex justify-between items-center'>
                  {!isLatestOfferUser ? (
                    <div className='flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800'>
                      <div className='w-2 h-2 rounded-full bg-blue-500 animate-pulse' />
                      <span className='text-sm font-medium'>Your turn</span>
                    </div>
                  ) : (
                    <div className='flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-200 text-gray-700'>
                      <div className='w-2 h-2 rounded-full bg-gray-500' />
                      <span className='text-sm font-medium'>
                        Waiting for {userToAct?.username}
                      </span>
                    </div>
                  )}
                  {!isLatestOfferUser ? (
                    <div className='flex space-x-2'>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='bg-yellow-400 text-gray-800 py-2 px-4 rounded-full shadow-sm font-semibold text-sm transition-all duration-200'
                        onClick={counterOffer}
                      >
                        Counter
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='bg-green-400 text-gray-800 py-2 px-4 rounded-full shadow-sm font-semibold text-sm transition-all duration-200'
                        onClick={acceptOffer}
                      >
                        Accept
                      </motion.button>
                    </div>
                  ) : (
                    <div className='flex ml-auto' />
                  )}
                </div>
              </div>
            </div>
          )}
          <div className='p-4'>
            <form onSubmit={submitMessage} className='flex gap-x-2'>
              <input
                type='text'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder='Send a message...'
                className='flex-grow px-4 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200'
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type='submit'
                className='bg-gray-800 text-white px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200'
                disabled={!newMessage.trim() || !hasProfile}
              >
                Send
              </motion.button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Main
