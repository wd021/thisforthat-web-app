import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'

import { OfferData, Profile } from '@/types/supabase'

import CommentSection from './comments'
import Footer from './footer'
import Header from './header'
import SwapInfo from './swapInfo'

interface OfferCardProps {
  fullPage?: boolean
  offer: OfferData
  user: User | null
  profile: Profile | null
  onFavorite: () => void
  onCounter: () => void
  onAccept: () => void
  onDecline: () => void
}

export const Offer: React.FC<OfferCardProps> = ({
  fullPage = false,
  offer,
  user,
  profile,
  onFavorite,
  onCounter,
  onAccept,
  onDecline,
}) => {
  const [isExpanded, setIsExpanded] = useState(fullPage)

  const footerProps = {
    counterparty: offer.counterparty_username,
    isCounterparty: user?.id === offer.counterparty_id,
    childOfferId: offer.child_offer_id,
    status: offer.status,
    onCounter: (e: React.MouseEvent) => {
      e.stopPropagation()
      onCounter()
    },
    onAccept: (e: React.MouseEvent) => {
      e.stopPropagation()
      onAccept()
    },
    onDecline: (e: React.MouseEvent) => {
      e.stopPropagation()
      onDecline()
    },
  }

  return (
    <div
      className={`p-4 w-full bg-white rounded-xl shadow-sm ${!fullPage ? 'hover:shadow-md cursor-pointer' : ''} transition-all duration-200`}
      onClick={() => {
        if (!fullPage) {
          setIsExpanded(!isExpanded)
        }
      }}
    >
      <Header
        fullPage={fullPage}
        offer={offer}
        onFavorite={onFavorite}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      <SwapInfo offer={offer} isOpenOffer={offer.status === 'open'} isExpanded={isExpanded} />
      <div className={isExpanded ? 'mt-4 space-y-4' : undefined}>
        {isExpanded && (
          <CommentSection
            offerId={offer.offer_id}
            count={offer.comment_count}
            user={user}
            profile={profile}
          />
        )}
        <Footer {...footerProps} />
      </div>
    </div>
  )
}

export default Offer
