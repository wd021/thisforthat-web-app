import { useEffect, useState } from 'react'

import { useToast } from '@/providers/toastProvider'
import { UserNFT } from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

export default function useNFTs(userId: string | undefined): {
  items: UserNFT[]
  hasMore: boolean
  page: number
  loadMore: () => void
  setItems: React.Dispatch<React.SetStateAction<UserNFT[]>>
  isFirstLoad: boolean
  isLoading: boolean
} {
  const [items, setItems] = useState<UserNFT[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const fetchItems = async (currentPage: number) => {
    setIsLoading(true)
    try {
      const rangeStart = (currentPage - 1) * GRID_ITEMS_PER_PAGE
      const rangeEnd = currentPage * GRID_ITEMS_PER_PAGE - 1

      const { data, error } = await supabase
        .from('user_nfts')
        .select('*, nfts!user_nfts_nft_id_fkey(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(rangeStart, rangeEnd)

      if (error) throw error

      if (currentPage === 1) {
        setItems(data)
      } else {
        setItems((prevItems) => {
          const newItems = data.filter(
            (newItem: UserNFT) =>
              !prevItems.some((prevItem) => prevItem.nft_id === newItem.nft_id),
          )
          return [...prevItems, ...newItems]
        })
      }

      setHasMore(data.length === GRID_ITEMS_PER_PAGE)
      if (isFirstLoad) setIsFirstLoad(false)
    } catch (error) {
      console.error('Error fetching items:', error)
      showToast(`⚠️ Error fetching items`, 2500)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchItems(1)
      setPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

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
