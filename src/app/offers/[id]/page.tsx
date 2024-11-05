'use client'

import { useEffect, useState } from 'react'

import { Footer } from '@/components'
import OfferPage from '@/components/offer'
import { useIsMobile } from '@/hooks'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { OfferData } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

const LoadingState: React.FC = () => (
  <div className='w-full flex flex-col items-center justify-center mt-[150px]'>
    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600'></div>
  </div>
)

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

  if (!offerInfo) {
    return <LoadingState />
  }

  return (
    <div
      className={`absolute top-[75px] bottom-0 w-full overflow-y-auto hide-scrollbar ${!isMobile && 'bottom-[50px]'}`}
    >
      {offerInfo && (
        <div className='max-w-screen-lg px-4 mx-auto my-8'>
          <OfferPage
            fullPage={true}
            offer={offerInfo}
            user={user}
            profile={profile}
            onFavorite={() => {}}
            onCreate={() => {}}
            onAccept={() => {}}
            onDecline={() => {}}
            onCounter={() => {}}
          />
        </div>
      )}
      {!isMobile && <Footer />}
    </div>
  )
}

export default Offer
