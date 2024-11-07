import { useEffect, useState } from 'react'

import { UserTabOption } from '@/types/main'
import { NFTGridItem, OfferData, Profile } from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

export default function useUserItems(
  tabOption: UserTabOption,
  userPageProfile: Profile | null,
  showToast: (message: string, duration: number) => void,
): {
  items: (NFTGridItem | OfferData)[]
  setItems: (items: (NFTGridItem | OfferData)[]) => void
  hasMore: boolean
  page: number
  loadMore: () => void
  refreshItems: () => void
  isFirstLoad: boolean
  isLoading: boolean
} {
  const [items, setItems] = useState<(NFTGridItem | OfferData)[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const fetchItems = async (tab: UserTabOption, page: number) => {
    if (!userPageProfile) return

    setIsLoading(true)

    const rangeStart = (page - 1) * GRID_ITEMS_PER_PAGE
    const rangeEnd = page * GRID_ITEMS_PER_PAGE - 1

    const baseParams = {
      range_start: rangeStart,
      range_end: rangeEnd,
    }

    try {
      let query
      switch (tab) {
        case 'offers':
          query = supabase.rpc('get_user_offers', {
            ...baseParams,
            current_user_id: userPageProfile.id,
          })
          break
        case 'pinned':
          query = supabase.rpc('get_user_pinned_feed', {
            ...baseParams,
            page_user_id: userPageProfile.id,
          })
          break
        default:
          query = supabase.rpc('get_user_feed', {
            ...baseParams,
            page_user_id: userPageProfile.id,
          })
      }

      const { data, error } = await query
      if (error) throw error

      if (tab !== 'offers') {
        // For NFT items, inject user profile data
        const updatedData = (data || []).map((item: NFTGridItem) => ({
          ...item,
          nft_user_id_username: userPageProfile.username,
          nft_user_id_profile_pic_url: userPageProfile.profile_pic_url,
          nft_user_id_wallet: userPageProfile.wallet,
        }))

        if (page === 1) {
          setItems(updatedData)
        } else {
          setItems((prevItems) => {
            const newItems = updatedData.filter(
              (newItem: NFTGridItem) =>
                !prevItems.some(
                  (prevItem) => (prevItem as NFTGridItem).nft_id === newItem.nft_id,
                ),
            )
            return [...prevItems, ...newItems]
          })
        }
      } else {
        if (page === 1) {
          setItems(data || [])
        } else {
          setItems((prevItems) => {
            const newItems = (data || []).filter(
              (newItem: OfferData) =>
                !prevItems.some(
                  (prevItem) => (prevItem as OfferData).offer_id === newItem.offer_id,
                ),
            )
            return [...prevItems, ...newItems]
          })
        }
      }

      setHasMore(data.length === GRID_ITEMS_PER_PAGE)
    } catch (error) {
      showToast(`⚠️ Error fetching items`, 2500)
      console.error('Error fetching items:', error)
    } finally {
      setIsLoading(false)
      if (isFirstLoad) {
        setIsFirstLoad(false)
      }
    }
  }

  useEffect(() => {
    if (userPageProfile) {
      fetchItems(tabOption, 1)
    }
  }, [tabOption, userPageProfile])

  const loadMore = () => {
    if (!isLoading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchItems(tabOption, nextPage)
    }
  }

  const refreshItems = () => {
    setIsFirstLoad(true)
    setPage(1)
    setHasMore(false)
    setItems([])
  }

  return { items, setItems, hasMore, page, loadMore, refreshItems, isFirstLoad, isLoading }
}
