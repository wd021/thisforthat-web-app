'use client'

import { useEffect, useState } from 'react'

import { Footer } from '@/components'
import { Offer as OfferModal, Transaction } from '@/components/modals'
import OfferCard from '@/components/offer'
import { LoadingIndicator } from '@/components/shared'
import { useIsMobile } from '@/hooks'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { OfferModalInfo, TxModalInfo } from '@/types/main'
import { OfferData } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

interface NFTPageProps {
  params: {
    id: string
  }
}

const Offer: React.FC<NFTPageProps> = ({ params }) => {
  const { user, loading, profile } = useAuth()
  const { showToast } = useToast()
  const isMobile = useIsMobile()
  const [offerInfo, setOfferInfo] = useState<OfferData | null>(null)

  const [offerModalInfo, setOfferModalInfo] = useState<OfferModalInfo | null>(null)
  const [txModalInfo, setTxModalInfo] = useState<TxModalInfo | null>(null)

  const fetchOfferInfo = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_single_offer', {
          offer_id_param: params.id,
          current_user_id: user?.id,
        })
        .single()

      if (error) {
        showToast('⚠️ Failed to fetch Offer', 2500)
        throw error
      }

      if (data) {
        setOfferInfo(data as OfferData)
      }
    } catch (error) {
      showToast('⚠️ Failed to fetch Offer', 2500)
      console.error('Failed to fetch Offer', error)
    }
  }

  useEffect(() => {
    if ((params.id, !loading)) {
      fetchOfferInfo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, loading])

  const favOffer = async () => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (!offerInfo) {
      showToast(`⚠️ Unexpected error`, 2500)
      return
    }

    try {
      // Optimistically update UI
      setOfferInfo({ ...offerInfo, favorited_by_user: true })

      const { error } = await supabase
        .from('offer_favorites')
        .upsert([{ user_id: user.id, offer_id: offerInfo.offer_id }], {
          onConflict: 'user_id,offer_id',
          ignoreDuplicates: true,
        })

      if (error) {
        // Revert the optimistic update if there's an error
        setOfferInfo({ ...offerInfo, favorited_by_user: false })
        showToast(`⚠️ Error favoriting offer`, 2500)
        console.error('Error favoriting offer:', error)
      }
    } catch (error) {
      // Handle any other errors
      setOfferInfo({ ...offerInfo, favorited_by_user: false })
      showToast(`⚠️ Error favoriting offer`, 2500)
      console.error('Error favoriting offer:', error)
    }
  }

  const counterOffer = async () => {
    if (!offerInfo) {
      showToast(`⚠️ Unexpected error`, 2500)
      return
    }

    // counter offer reverses the creator and counterparty
    const offerModalInfo = {
      offerId: offerInfo.offer_id,
      chainId: offerInfo.chain_id,
      users: {
        creator: {
          id: offerInfo.counterparty_id,
          username: offerInfo.counterparty_username,
          profile_pic_url: offerInfo.counterparty_profile_pic_url,
          wallet: offerInfo.counterparty_wallet,
        },
        counterparty: {
          id: offerInfo.creator_id,
          username: offerInfo.creator_username,
          profile_pic_url: offerInfo.creator_profile_pic_url,
          wallet: offerInfo.creator_wallet,
        },
      },
      assets: {
        creator: offerInfo.counterparty_assets,
        counterparty: offerInfo.creator_assets,
      },
    }

    setOfferModalInfo(offerModalInfo)

    if (offerInfo) {
      setOfferInfo({
        ...offerInfo,
        status: offerInfo.status === 'open' ? 'countered-open' : 'countered',
      } as OfferData)
    }
  }

  const acceptOffer = async () => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (!offerInfo) {
      showToast(`⚠️ Unexpected error`, 2500)
      return
    }

    // Store original state for potential revert
    const originalOfferInfo = { ...offerInfo }

    try {
      // Optimistically update UI
      setOfferInfo({ ...offerInfo, status: 'accepted' })

      const { error } = await supabase.rpc('accept_offer', {
        p_offer_id: offerInfo.offer_id,
      })

      if (error) throw error

      // prompt modal to create trade onchain
      const txModalInfo = {
        transactionInfo: {
          status: 'accepted',
          offerId: offerInfo.offer_id,
          onchain: {
            id: null,
            hash: null,
            done: false,
          },
          chainId: offerInfo.chain_id,
          users: {
            creator: {
              id: offerInfo.creator_id,
              username: offerInfo.creator_username,
              profile_pic_url: offerInfo.creator_profile_pic_url,
              wallet: offerInfo.creator_wallet,
            },
            counterparty: {
              id: offerInfo.counterparty_id,
              username: offerInfo.counterparty_username,
              profile_pic_url: offerInfo.counterparty_profile_pic_url,
              wallet: offerInfo.counterparty_wallet,
            },
          },
          assets: {
            creator: offerInfo.creator_assets,
            counterparty: offerInfo.counterparty_assets,
          },
        },
        onchainInfo: null,
      }
      setTxModalInfo(txModalInfo)
    } catch (error) {
      // Revert to original state
      setOfferInfo(originalOfferInfo)

      // Error handling
      const errorMessage = error instanceof Error ? error.message : 'Error accepting offer'
      showToast(`⚠️ ${errorMessage}`, 2500)
      console.error('Error accepting offer:', error)
    }
  }

  const declineOffer = async () => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (!offerInfo) {
      showToast(`⚠️ Unexpected error`, 2500)
      return
    }

    // Store original state for potential revert
    const originalOfferInfo = { ...offerInfo }

    try {
      // Optimistically update UI
      setOfferInfo({ ...offerInfo, status: 'rejected' })

      const { error } = await supabase.rpc('reject_offer', {
        p_offer_id: offerInfo.offer_id,
      })

      if (error) throw error
    } catch (error) {
      // Revert to original state
      setOfferInfo(originalOfferInfo)

      // Error handling
      const errorMessage = error instanceof Error ? error.message : 'Error declining offer'
      showToast(`⚠️ ${errorMessage}`, 2500)
      console.error('Error declining offer:', error)
    }
  }

  if (!offerInfo) {
    return (
      <div className='w-full flex flex-col items-center justify-center mt-[150px]'>
        <LoadingIndicator />
      </div>
    )
  }

  return (
    <div
      className={`absolute top-[75px] bottom-0 w-full overflow-y-auto hide-scrollbar ${!isMobile && 'bottom-[50px]'}`}
    >
      {offerInfo && (
        <div className='max-w-screen-lg px-4 mx-auto my-8'>
          <OfferCard
            fullPage={true}
            offer={offerInfo}
            user={user}
            profile={profile}
            onFavorite={favOffer}
            onCounter={counterOffer}
            onAccept={acceptOffer}
            onDecline={declineOffer}
          />
        </div>
      )}
      {offerModalInfo && (
        <OfferModal {...offerModalInfo} closeModal={() => setOfferModalInfo(null)} />
      )}
      {txModalInfo && (
        <Transaction
          {...txModalInfo}
          closeModal={() => setTxModalInfo(null)}
          onCreateTrade={() => {}}
          onCompleteTrade={() => {}}
        />
      )}
      {!isMobile && <Footer />}
    </div>
  )
}

export default Offer
