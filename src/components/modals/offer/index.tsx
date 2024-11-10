'use client'

import React, { FC, useState } from 'react'
import Modal from 'react-modal'
import { AnimatePresence, motion } from 'framer-motion'

import { useIsMobile } from '@/hooks'
import { ChainLogo, Close } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { getModalStyles } from '@/styles'
import { ProfileMinimal, SimplifiedNFTAsset } from '@/types/supabase'
import { CHAIN_IDS_TO_CHAINS, MAX_NFTS_PER_SWAP } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

import SelectOverlay from './selectOverlay'
import UserSection from './userSection'

const Header: FC<{
  isCounterOffer: boolean
  onClose: () => void
  chainId: number
}> = ({ isCounterOffer, onClose, chainId }) => {
  const title = !isCounterOffer ? 'Make an Offer' : 'Make a Counter Offer'
  const chainName = CHAIN_IDS_TO_CHAINS[chainId as keyof typeof CHAIN_IDS_TO_CHAINS]

  return (
    <div className='bg-white border-b border-gray-200'>
      <div className='px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Left side with title and chain info */}
          <div className='flex items-center space-x-4'>
            <div className='flex items-center justify-center w-12 h-12 bg-yellow-50 rounded-full'>
              <span className='text-2xl' role='img' aria-label='handshake'>
                🤝
              </span>
            </div>

            <div className='flex flex-col'>
              <div className='text-lg font-semibold text-gray-900 mb-0.5'>{title}</div>
              <div className='flex items-center'>
                <div className='flex items-center '>
                  <ChainLogo chainId={chainId} className='w-4 h-4 mr-1.5' />
                  <span className='text-sm font-medium text-gray-700'>{chainName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button className='text-gray-500' aria-label='Close modal' onClick={onClose}>
            <Close className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  )
}
const Footer: FC<{ makeOffer: () => void }> = ({ makeOffer }) => (
  <div className='p-4 bg-white border-t border-gray-200'>
    <button
      className='w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-3 px-6 
      rounded-xl shadow-sm hover:shadow-md cursor-pointer font-semibold text-xl
      transition-all duration-200 flex items-center justify-center space-x-2'
      onClick={makeOffer}
    >
      <span>Make Offer</span>
    </button>
  </div>
)

const Offer: FC<{
  offerId: string | null
  chainId: number
  users: {
    creator: ProfileMinimal
    counterparty: ProfileMinimal
  }
  assets: {
    creator: SimplifiedNFTAsset[]
    counterparty: SimplifiedNFTAsset[]
  }
  closeModal: () => void
}> = ({ offerId, chainId, users, assets, closeModal }) => {
  const { showToast } = useToast()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)

  const [creatorItems, setCreatorItems] = useState(assets.creator)
  const [counterpartyItems, setCounterpartyItems] = useState(assets.counterparty)

  const [isSelectingNFTs, setIsSelectingNFTs] = useState(false)
  const [selectingUser, setSelectingUser] = useState<null | ProfileMinimal>(null)

  const [activeTab, setActiveTab] = useState<'trade' | 'interest'>('trade')
  const [interestMessage, setInterestMessage] = useState('')

  const showSelectScreen = (user: ProfileMinimal) => {
    setSelectingUser(user)
    setIsSelectingNFTs(true)
  }

  const handleNFTSelection = (user: ProfileMinimal, nfts: SimplifiedNFTAsset[]) => {
    if (user === users.creator) {
      setCreatorItems(nfts)
    } else {
      setCounterpartyItems(nfts)
    }
  }

  const closeNFTSelection = () => {
    setIsSelectingNFTs(false)
    setSelectingUser(null)
  }

  const makeOffer = async () => {
    if (!user) return

    if (activeTab === 'trade') {
      if (creatorItems.length === 0 || counterpartyItems.length === 0) {
        showToast(`⚠️ Please select at least one NFT for each user`, 2500)
        return
      }

      if (
        creatorItems.length > MAX_NFTS_PER_SWAP ||
        counterpartyItems.length > MAX_NFTS_PER_SWAP
      ) {
        showToast(`⚠️ You can only select up to ${MAX_NFTS_PER_SWAP} NFTs`, 2500)
        return
      }

      try {
        if (!offerId) {
          const { error } = await supabase.rpc('create_offer', {
            p_creator_id: users.creator.id,
            p_counterparty_id: users.counterparty.id,
            p_chain_id: chainId,
            p_status: 'created',
            p_offer: {
              creator_assets: creatorItems,
              counterparty_assets: counterpartyItems,
            },
            p_initial_message: null,
          })

          if (error) throw error
          showToast(`🎉 Offer sent to ${users.counterparty.username}`, 2500)
        } else {
          const { data, error } = await supabase.rpc('create_counter_offer', {
            p_creator_id: users.creator.id,
            p_counterparty_id: users.counterparty.id,
            p_chain_id: chainId,
            p_reference_offer_id: offerId,
            p_offer: {
              creator_assets: creatorItems,
              counterparty_assets: counterpartyItems,
            },
          })

          if (error) throw error

          const isCounterOffer =
            assets.creator.length > 0 && assets.counterparty.length > 0 ? true : false
          showToast(
            isCounterOffer
              ? `🎉 Counter offer sent to ${users.counterparty.username}`
              : `🎉 Offer sent to ${users.counterparty.username}`,
            2500,
          )
        }
      } catch (error) {
        showToast(`⚠️ Error sending offer`, 2500)
        console.error('Error sending offer:', error)
      }
    } else {
      if (!interestMessage.trim()) {
        showToast(`⚠️ Please enter a message`, 2500)
        return
      }

      try {
        const { error } = await supabase.rpc('create_offer', {
          p_creator_id: users.creator.id,
          p_counterparty_id: users.counterparty.id,
          p_chain_id: chainId,
          p_status: 'open',
          p_offer: {
            counterparty_assets: assets.counterparty,
          },
          p_initial_message: interestMessage,
        })

        if (error) throw error
        showToast(`🎉 Offer sent to ${users.counterparty.username}`, 2500)
      } catch (error) {
        showToast(`⚠️ Error sending offer`, 2500)
        console.error('Error sending offer:', error)
      }
    }

    closeModal()
  }

  const showOverlayScreen = selectingUser && isSelectingNFTs ? true : false

  return (
    <div>
      <Modal
        id='react-modal'
        ariaHideApp={false}
        isOpen={true}
        onRequestClose={closeModal}
        style={customStyles}
      >
        {!showOverlayScreen ? (
          <div className='flex flex-col bg-white lg:rounded-2xl shadow-2xl overflow-hidden h-full'>
            <Header isCounterOffer={!!offerId} onClose={closeModal} chainId={chainId} />
            {!offerId && (
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
                        activeTab === tab
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-900'
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
            )}
            <div className='flex-1 overflow-y-auto custom-scrollbar'>
              {activeTab === 'trade' ? (
                <div>
                  <UserSection
                    bg='bg-white'
                    user={users.creator}
                    items={creatorItems}
                    showSelectScreen={showSelectScreen}
                    onRemoveItem={(itemId) =>
                      setCreatorItems((prev) => prev.filter((i) => i.nft_id !== itemId))
                    }
                  />
                  <UserSection
                    bg='bg-gray-50'
                    user={users.counterparty}
                    items={counterpartyItems}
                    showSelectScreen={showSelectScreen}
                    onRemoveItem={(itemId) =>
                      setCounterpartyItems((prev) => prev.filter((i) => i.nft_id !== itemId))
                    }
                  />
                </div>
              ) : (
                <div className='p-6 pb-4'>
                  <textarea
                    className='w-full h-40 p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200'
                    placeholder='Share a message expressing your interest in this NFT'
                    value={interestMessage}
                    onChange={(e) => setInterestMessage(e.target.value)}
                  />
                </div>
              )}
            </div>

            <Footer makeOffer={makeOffer} />
          </div>
        ) : (
          <AnimatePresence>
            <div className='flex flex-col bg-white lg:rounded-2xl shadow-2xl overflow-hidden h-screen'>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='absolute inset-0 bg-white'
              >
                <SelectOverlay
                  chainId={chainId}
                  user={selectingUser!}
                  selectedNFTs={
                    selectingUser === users.creator ? creatorItems : counterpartyItems
                  }
                  onSelect={handleNFTSelection}
                  onClose={closeNFTSelection}
                />
              </motion.div>
            </div>
          </AnimatePresence>
        )}
      </Modal>
    </div>
  )
}

export default Offer
