import OfferCard from '@/components/offer'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { OfferModalInfo, TxModalInfo } from '@/types/main'
import { OfferData } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

const OfferFeed: React.FC<{
  items: OfferData[]
  setOfferModalInfo: (modalInfo: OfferModalInfo) => void
  setTxModalInfo: (modalInfo: TxModalInfo) => void
  setItems: (items: OfferData[]) => void
}> = ({ items, setOfferModalInfo, setTxModalInfo, setItems }) => {
  const { user, profile } = useAuth()
  const { showToast } = useToast()

  const favOffer = async (offer: OfferData) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    try {
      // Optimistically update UI
      setItems(
        items.map((item) =>
          item.offer_id === offer.offer_id ? { ...item, favorited_by_user: true } : item,
        ),
      )

      const { error } = await supabase
        .from('offer_favorites')
        .upsert([{ user_id: user.id, offer_id: offer.offer_id }], {
          onConflict: 'user_id,offer_id',
          ignoreDuplicates: true,
        })

      if (error) {
        // Revert the optimistic update if there's an error
        setItems(
          items.map((item) =>
            item.offer_id === offer.offer_id ? { ...item, favorited_by_user: false } : item,
          ),
        )
        showToast(`⚠️ Error favoriting offer`, 2500)
        console.error('Error favoriting offer:', error)
      }
    } catch (error) {
      // Handle any other errors
      setItems(
        items.map((item) =>
          item.offer_id === offer.offer_id ? { ...item, favorited_by_user: false } : item,
        ),
      )

      showToast(`⚠️ Error favoriting offer`, 2500)
      console.error('Error favoriting offer:', error)
    }
  }

  const counterOffer = async (offer: OfferData) => {
    // counter offer reverses the creator and counterparty
    const offerModalInfo = {
      offerId: offer.offer_id,
      chainId: offer.chain_id,
      users: {
        creator: {
          id: offer.counterparty_id,
          username: offer.counterparty_username,
          profile_pic_url: offer.counterparty_profile_pic_url,
          wallet: offer.counterparty_wallet,
        },
        counterparty: {
          id: offer.creator_id,
          username: offer.creator_username,
          profile_pic_url: offer.creator_profile_pic_url,
          wallet: offer.creator_wallet,
        },
      },
      assets: {
        creator: offer.counterparty_assets,
        counterparty: offer.creator_assets,
      },
    }

    setOfferModalInfo(offerModalInfo)

    setItems(
      items.map((item) =>
        item.offer_id === offer.offer_id
          ? { ...item, status: item.status === 'open' ? 'countered-open' : 'countered' }
          : item,
      ),
    )
  }

  const acceptOffer = async (offer: OfferData) => {
    // needs to first create trade onchain
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    try {
      // Optimistically update UI
      setItems(
        items.map((item) =>
          item.offer_id === offer.offer_id ? { ...item, status: 'accepted' } : item,
        ),
      )

      const { error } = await supabase.rpc('accept_offer', {
        p_offer_id: offer.offer_id,
      })

      if (error) {
        // Revert the optimistic update if there's an error
        setItems(
          items.map((item) =>
            item.offer_id === offer.offer_id ? { ...item, status: offer.status } : item,
          ),
        )
        showToast(`⚠️ Error accepting offer`, 2500)
        console.error('Error accepting offer:', error)
      } else {
        // prompt modal to create trade onchain
        const txModalInfo = {
          transactionInfo: {
            status: 'accepted',
            offerId: offer.offer_id,
            onchain: {
              id: null,
              hash: null,
              done: false,
            },
            chainId: offer.chain_id,
            users: {
              creator: {
                id: offer.creator_id,
                username: offer.creator_username,
                profile_pic_url: offer.creator_profile_pic_url,
                wallet: offer.creator_wallet,
              },
              counterparty: {
                id: offer.counterparty_id,
                username: offer.counterparty_username,
                profile_pic_url: offer.counterparty_profile_pic_url,
                wallet: offer.counterparty_wallet,
              },
            },
            assets: {
              creator: offer.counterparty_assets,
              counterparty: offer.creator_assets,
            },
          },
          onchainInfo: null,
        }
        setTxModalInfo(txModalInfo)

        // showToast(`✅ Offer accepted successfully`, 2500)
      }
    } catch (error) {
      // Handle any other errors
      setItems(
        items.map((item) =>
          item.offer_id === offer.offer_id ? { ...item, status: offer.status } : item,
        ),
      )
      showToast(`⚠️ Error accepting offer`, 2500)
      console.error('Error accepting offer:', error)
    }
  }

  const declineOffer = async (offer: OfferData) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    try {
      // Optimistically update UI
      setItems(
        items.map((item) =>
          item.offer_id === offer.offer_id ? { ...item, status: 'rejected' } : item,
        ),
      )

      const { error } = await supabase.rpc('reject_offer', {
        p_offer_id: offer.offer_id,
      })

      if (error) {
        // Revert the optimistic update if there's an error
        setItems(
          items.map((item) =>
            item.offer_id === offer.offer_id ? { ...item, status: offer.status } : item,
          ),
        )
        showToast(`⚠️ Error declining offer`, 2500)
        console.error('Error declining offer:', error)
      }
    } catch (error) {
      // Handle any other errors
      setItems(
        items.map((item) =>
          item.offer_id === offer.offer_id ? { ...item, status: offer.status } : item,
        ),
      )
      showToast(`⚠️ Error declining offer`, 2500)
      console.error('Error declining offer:', error)
    }
  }

  return (
    <>
      {items.map((item) => (
        <OfferCard
          key={item.offer_id}
          offer={item}
          user={user}
          profile={profile}
          onFavorite={() => favOffer(item)}
          onCounter={() => counterOffer(item)}
          onAccept={() => acceptOffer(item)}
          onDecline={() => declineOffer(item)}
        />
      ))}
    </>
  )
}

export default OfferFeed
