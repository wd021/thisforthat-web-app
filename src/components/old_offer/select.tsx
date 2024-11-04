import React, { FC, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Close } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { NFTOfferMetadata, ProfileMinimal } from '@/types/supabase'
import { MAX_NFTS_PER_SWAP } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

import { NFTImage } from '../shared'

import SelectNFT from './selectNft'

type Props = {
  type: 'initial_offer' | 'counter_offer'
  chainId: number
  offerId: string | null
  userA: ProfileMinimal
  userB: ProfileMinimal
  initUserAItems: NFTOfferMetadata[]
  initUserBItems: NFTOfferMetadata[]
  onClose: () => void
}

const Select: FC<Props> = ({
  type,
  chainId,
  offerId,
  userA,
  userB,
  initUserAItems,
  initUserBItems,
  onClose,
}) => {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [userAItems, setUserAItems] = useState(initUserAItems)
  const [userBItems, setUserBItems] = useState(initUserBItems)
  const [isSelectingNFTs, setIsSelectingNFTs] = useState(false)
  const [selectingUser, setSelectingUser] = useState<null | ProfileMinimal>(null)
  const [activeTab, setActiveTab] = useState<'trade' | 'interest'>('trade')
  const [interestMessage, setInterestMessage] = useState('')

  const showSelectScreen = (user: ProfileMinimal) => {
    setSelectingUser(user)
    setIsSelectingNFTs(true)
  }

  const handleNFTSelection = (user: ProfileMinimal, nfts: NFTOfferMetadata[]) => {
    if (user === userA) {
      setUserAItems(nfts)
    } else {
      setUserBItems(nfts)
    }
  }

  const closeNFTSelection = () => {
    setIsSelectingNFTs(false)
    setSelectingUser(null)
  }

  const makeOffer = async () => {
    if (!user) return

    if (activeTab === 'trade') {
      if (userAItems.length === 0 || userBItems.length === 0) {
        showToast(`⚠️ Please select at least one NFT for each user`, 2500)
        return
      }

      if (userAItems.length > MAX_NFTS_PER_SWAP || userBItems.length > MAX_NFTS_PER_SWAP) {
        showToast(`⚠️ You can only select up to ${MAX_NFTS_PER_SWAP} NFTs`, 2500)
        return
      }

      try {
        if (type === 'initial_offer') {
          // Transform the NFT items into the expected format
          const offerPayload = {
            creator_assets: userAItems.map((item) => ({
              nft_id: item.id,
              name: item.name,
            })),
            counterparty_assets: userBItems.map((item) => ({
              nft_id: item.id,
              name: item.name,
            })),
          }

          const { error } = await supabase.rpc('create_offer', {
            p_creator_id: userA.id,
            p_counterparty_id: userB.id,
            p_chain_id: chainId,
            p_status: 'created',
            p_offer: offerPayload,
            p_initial_message: null, // Not needed for regular trades
          })

          if (error) throw error
          showToast(`🎉 Offer sent to ${userB.username}`, 2500)
        } else {
          if (!offerId) return

          // For counter offers, we'll need a separate counter_offer function
          // This part remains unchanged until you update the counter_offer function
          // const { error } = await supabase.rpc('counter_offer', {
          //   p_offer_id: offerId,
          //   p_user_id: user.id,
          //   p_user_id_counter: user.id === userA.id ? userB.id : userA.id,
          //   p_new_offer: {
          //     user: userAItems,
          //     userCounter: userBItems,
          //   },
          // })

          // if (error) throw error
          // showToast(
          //   `🎉 Counter offer sent to ${user.id === userA.id ? userB.username : userA.username}`,
          //   2500,
          // )
        }
      } catch (error) {
        showToast(`⚠️ Error submitting offer`, 2500)
        console.error('Error making offer:', error)
      }
    } else {
      if (!interestMessage.trim()) {
        showToast(`⚠️ Please enter a message`, 2500)
        return
      }

      try {
        // Transform the NFT items for open offer
        const openOfferPayload = {
          creator_assets: userAItems.map((item) => ({
            nft_id: item.id,
            name: item.name,
          })),
          counterparty_assets: userBItems.map((item) => ({
            nft_id: item.id,
            name: item.name,
          })), // Empty for open offers
        }

        const { error } = await supabase.rpc('create_offer', {
          p_creator_id: user.id,
          p_counterparty_id: user.id === userA.id ? userB.id : userA.id,
          p_chain_id: chainId,
          p_status: 'open',
          p_offer: openOfferPayload,
          p_initial_message: interestMessage,
        })

        if (error) throw error
        showToast(`🎉 Offer sent!`, 2500)
      } catch (error) {
        showToast(`⚠️ Error sending offer`, 2500)
        console.error('Error sending offer:', error)
      }
    }

    onClose()
  }

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden ${
        selectingUser && isSelectingNFTs ? 'h-screen' : 'h-full'
      }`}
    >
      <Header type={type} onClose={onClose} />

      <div className='border-b border-gray-200 bg-white'>
        <div className='flex relative'>
          <motion.div
            className='absolute bottom-0 h-0.5 bg-blue-500 transition-all duration-300'
            style={{
              width: '50%',
              left: activeTab === 'trade' ? '0%' : '50%',
            }}
          />
          {(['trade', 'interest'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-4 px-6 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <span className='flex items-center justify-center space-x-2'>
                <span>{tab === 'trade' ? '↔️' : '💬'}</span>
                <span className='font-medium'>
                  {tab === 'trade' ? 'Specific Trade' : 'Express Interest'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {activeTab === 'trade' ? (
          <div>
            <UserSection
              bg='bg-white'
              user={userA}
              items={userAItems}
              showSelectScreen={showSelectScreen}
              onRemoveItem={(itemId) =>
                setUserAItems((prev) => prev.filter((i) => i.id !== itemId))
              }
            />
            <UserSection
              bg='bg-gray-50'
              user={userB}
              items={userBItems}
              showSelectScreen={showSelectScreen}
              onRemoveItem={(itemId) =>
                setUserBItems((prev) => prev.filter((i) => i.id !== itemId))
              }
            />
          </div>
        ) : (
          <div className='p-6 pb-0'>
            <textarea
              className='w-full h-40 p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200'
              placeholder="Share what you're interested in trading... Be specific about which NFTs catch your eye!"
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
            />
          </div>
        )}
      </div>

      <Footer type={type} makeOffer={makeOffer} />

      <AnimatePresence>
        {selectingUser && isSelectingNFTs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 bg-white'
          >
            <SelectNFT
              chainId={chainId}
              user={selectingUser}
              selectedNFTs={selectingUser === userA ? userAItems : userBItems}
              onSelect={handleNFTSelection}
              onClose={closeNFTSelection}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Header: FC<{ type: 'initial_offer' | 'counter_offer'; onClose: () => void }> = ({
  type,
  onClose,
}) => (
  <div className='flex items-center justify-between py-5 px-6 bg-gray-50 border-b border-gray-200'>
    <div className='flex items-center space-x-3'>
      <span className='text-2xl'>🤝</span>
      <h1 className='text-xl font-semibold text-gray-900'>
        {type === 'initial_offer' ? 'Make an Offer' : 'Make a Counter Offer'}
      </h1>
    </div>
    <button
      className='p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200'
      onClick={onClose}
    >
      <Close className='w-5 h-5' />
    </button>
  </div>
)

const UserSection: FC<{
  bg: string
  user: ProfileMinimal
  items: NFTOfferMetadata[]
  showSelectScreen: (user: ProfileMinimal) => void
  onRemoveItem: (itemId: string) => void
}> = ({ bg, user, items, showSelectScreen, onRemoveItem }) => (
  <div className={`p-6 relative ${bg} border-b border-gray-200`}>
    <div className='flex items-center justify-between mb-6'>
      <div className='flex items-center'>
        <img
          src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user?.profile_pic_url}
          alt={user?.username}
          className='w-12 h-12 rounded-full border-2 border-white shadow-md object-cover'
        />
        <div className='ml-3'>
          <div className='text-lg font-semibold text-gray-900'>{user?.username}</div>
          <div className='text-sm text-gray-500'>{items.length} NFTs selected</div>
        </div>
      </div>
      <button
        className='px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm 
        hover:bg-blue-600 transition-colors duration-200 focus:outline-none 
        focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 font-medium'
        onClick={() => showSelectScreen(user)}
      >
        Add NFT
      </button>
    </div>
    <NFTGrid items={items} onRemoveItem={onRemoveItem} />
  </div>
)

const NFTGrid: FC<{ items: NFTOfferMetadata[]; onRemoveItem: (itemId: string) => void }> = ({
  items,
  onRemoveItem,
}) => (
  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
    <AnimatePresence>
      {items.map((item) => (
        <NFTItem key={item.id} item={item} onRemove={onRemoveItem} />
      ))}
    </AnimatePresence>
  </div>
)

const NFTItem: FC<{
  item: NFTOfferMetadata
  onRemove: (itemId: string) => void
}> = ({ item, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className='relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md 
    transition-all duration-200 cursor-pointer group'
  >
    <NFTImage src={item.image} alt={item.name} fallback={item.name} />
    <div
      className='absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 
      group-hover:opacity-100 transition-opacity duration-200'
      onClick={() => onRemove(item.id)}
    >
      <span className='text-white font-medium'>Remove</span>
    </div>
  </motion.div>
)

const Footer: FC<{ type: 'initial_offer' | 'counter_offer'; makeOffer: () => void }> = ({
  type,
  makeOffer,
}) => (
  <div className='p-6 bg-white border-t border-gray-200'>
    <button
      className='w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-3 px-6 
      rounded-xl shadow-sm hover:shadow-md cursor-pointer font-semibold text-base
      transition-all duration-200 flex items-center justify-center space-x-2'
      onClick={makeOffer}
    >
      <span>{type === 'initial_offer' ? '🤝 Make Offer' : '🔄 Counter Offer'}</span>
    </button>
  </div>
)

export default Select
