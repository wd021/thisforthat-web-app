'use client'

import { useEffect, useState } from 'react'

import { Footer } from '@/components'
import { useIsMobile } from '@/hooks'
import { useToast } from '@/providers/toastProvider'
import { OfferFeedItem } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

import OfferPage from './offerPage'

interface NFTPageProps {
  params: {
    id: string
  }
}

const Offer: React.FC<NFTPageProps> = ({ params }) => {
  const isMobile = useIsMobile()
  const { showToast } = useToast()
  const [offerInfo, setOfferInfo] = useState<OfferFeedItem | null>(null)

  const fetchOfferInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('user_offers')
        .select(
          '*, user:user_profile!user_offers_user_id_fkey(*), counter_user:user_profile!user_offers_user_id_counter_fkey(*)',
        )
        .eq('id', params.id)
        .single()

      if (error) {
        showToast('⚠️ Failed to fetch Offer', 2500)
        throw error
      }

      if (data) {
        setOfferInfo(data)
      }
    } catch (error) {
      showToast('⚠️ Failed to fetch Offer', 2500)
      console.error('Failed to fetch Offer', error)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchOfferInfo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  return (
    <div
      className={`absolute top-[75px] bottom-0 w-full ${isMobile ? 'overflow-y-auto hide-scrollbar' : 'bottom-[50px]'}`}
    >
      {offerInfo && <OfferPage offerInfo={offerInfo} />}
      {!isMobile && <Footer />}
    </div>
  )
}

export default Offer
