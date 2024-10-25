import { useEffect, useState } from 'react'

import { useToast } from '@/providers/toastProvider'
import { NFTOffers } from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

export default function useNFTOffers(nftId: string): {
  items: NFTOffers[]
  hasMore: boolean
  page: number
  loadMore: () => void
} {
  const [items, setItems] = useState<NFTOffers[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const { showToast } = useToast()

  const fetchItems = async (currentPage: number) => {
    try {
      const { data, error } = await supabase
        .from('nfts_offers')
        .select(
          '*, user_offers!nfts_offers_offer_id_fkey(*, user:user_profile!user_offers_user_id_fkey(*), counter_user:user_profile!user_offers_user_id_counter_fkey(*))',
        )
        .eq('nft_id', nftId)
        .order('updated_at', { ascending: false })
        .range((currentPage - 1) * GRID_ITEMS_PER_PAGE, currentPage * GRID_ITEMS_PER_PAGE - 1)

      if (error) throw error

      if (currentPage === 1) {
        setItems(data)
      } else {
        setItems((prevOffers) => {
          const newOffers = data.filter(
            (newOffer: NFTOffers) =>
              !prevOffers.some((prevOffer) => prevOffer.id === newOffer.id),
          )
          return [...prevOffers, ...newOffers]
        })
      }

      setHasMore(data.length === GRID_ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching items:', error)
      showToast(`⚠️ Error fetching offers`, 2500)
    }
  }

  useEffect(() => {
    fetchItems(1)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftId])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchItems(nextPage)
  }

  return {
    items,
    hasMore,
    page,
    loadMore,
  }
}
