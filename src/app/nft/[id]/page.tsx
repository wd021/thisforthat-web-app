'use client'

import { useEffect, useState } from 'react'

import { Footer } from '@/components'
import { useIsMobile } from '@/hooks'
import { useToast } from '@/providers/toastProvider'
import { NFT as NFTType } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

import NFTPage from './nftPage'

interface NFTPageProps {
  params: {
    id: string
  }
}

const NFT: React.FC<NFTPageProps> = ({ params }) => {
  const isMobile = useIsMobile()
  const { showToast } = useToast()
  const [nftInfo, setNftInfo] = useState<NFTType | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nftUsers, setNftUsers] = useState<any[]>([])

  const fetchNftData = async () => {
    try {
      const [nftResponse, usersResponse] = await Promise.all([
        supabase
          .from('nfts')
          .select('*, user_profile!nfts_user_id_fkey(*)')
          .eq('id', params.id)
          .single(),

        supabase
          .from('user_nfts')
          .select(
            `
            wallet_address,
            user_profile: user_id(*)
          `,
          )
          .eq('nft_id', params.id),
      ])

      if (nftResponse.error) {
        showToast('⚠️ Failed to fetch NFT', 2500)
        throw nftResponse.error
      }

      setNftInfo(nftResponse.data)
      setNftUsers(usersResponse.data ? usersResponse.data : [])
    } catch (error) {
      showToast('⚠️ Failed to fetch NFT data', 2500)
      console.error('Failed to fetch NFT data', error)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchNftData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  return (
    <div
      className={`absolute top-[75px] bottom-0 w-full ${isMobile ? 'overflow-y-auto hide-scrollbar' : ''}`}
    >
      {nftInfo && <NFTPage nft={nftInfo} nftUsers={nftUsers} />}
      {!isMobile && <Footer />}
    </div>
  )
}

export default NFT
