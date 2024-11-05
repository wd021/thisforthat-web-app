import { useEffect, useState } from 'react'
import { useToast } from '@/providers/toastProvider'
import { OfferData } from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'
import { useAuth } from '@/providers/authProvider'

export default function useNFTOffers(nftId: string): {
  items: OfferData[]
  hasMore: boolean
  page: number
  loadMore: () => void
  setItems: React.Dispatch<React.SetStateAction<OfferData[]>>
  isFirstLoad: boolean
  isLoading: boolean
} {
  const [items, setItems] = useState<OfferData[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { showToast } = useToast()

  const fetchItems = async (currentPage: number) => {
    setIsLoading(true)
    try {
      const rangeStart = (currentPage - 1) * GRID_ITEMS_PER_PAGE
      const rangeEnd = currentPage * GRID_ITEMS_PER_PAGE - 1

      const { data, error } = await supabase.rpc('get_nft_offers', {
        p_nft_id: nftId,
        current_user_id: user?.id || null,
        range_start: rangeStart,
        range_end: rangeEnd,
      })

      if (error) throw error

      if (currentPage === 1) {
        setItems(data)
      } else {
        setItems((prevOffers) => {
          const newOffers = data.filter(
            (newOffer: OfferData) =>
              !prevOffers.some((prevOffer) => prevOffer.offer_id === newOffer.offer_id),
          )
          return [...prevOffers, ...newOffers]
        })
      }

      setHasMore(data.length === GRID_ITEMS_PER_PAGE)
      if (isFirstLoad) setIsFirstLoad(false)
    } catch (error) {
      console.error('Error fetching items:', error)
      showToast(`⚠️ Error fetching offers`, 2500)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems(1)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftId, user?.id])

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
    setItems,
    isFirstLoad,
    isLoading,
  }
}
