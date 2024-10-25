import { useEffect, useState } from 'react'

import { UserTabOption } from '@/types/main'
import { NFTFeedItem, OfferFeedItem, Profile } from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

export default function useUserItems(
  tabOption: UserTabOption,
  userPageProfile: Profile | null,
  showToast: (message: string, duration: number) => void,
): {
  items: (NFTFeedItem | OfferFeedItem)[]
  hasMore: boolean
  page: number
  loadMore: () => void
  refreshItems: () => void
} {
  const [items, setItems] = useState<(NFTFeedItem | OfferFeedItem)[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchItems = async (tab: UserTabOption, currentPage: number) => {
    if (!userPageProfile) return

    const rangeStart = (currentPage - 1) * GRID_ITEMS_PER_PAGE
    const rangeEnd = currentPage * GRID_ITEMS_PER_PAGE - 1

    const baseParams = {
      page_user_id: userPageProfile.id,
      range_start: rangeStart,
      range_end: rangeEnd,
    }

    try {
      let query
      switch (tab) {
        case 'offers':
          query = supabase
            .from('user_offers')
            .select(
              '*, user:user_profile!user_offers_user_id_fkey(*), counter_user:user_profile!user_offers_user_id_counter_fkey(*)',
            )
            .or(`user_id.eq.${userPageProfile.id},user_id_counter.eq.${userPageProfile.id}`)
            .order('updated_at', { ascending: false })
            .range(rangeStart, rangeEnd)
          break
        case 'pinned':
          query = supabase.rpc('get_user_pinned_feed', baseParams)
          break
        default:
          query = supabase.rpc('get_user_feed', baseParams)
      }

      const { data, error } = await query
      if (error) throw error

      if (tab !== 'offers') {
        const updatedData = data.map((nft: NFTFeedItem) => ({
          ...nft,
          nft_user_id_username: userPageProfile.username,
          nft_user_id_profile_pic_url: userPageProfile.profile_pic_url,
        }))

        setItems(
          currentPage === 1
            ? updatedData
            : (prevItems) => [
                ...prevItems,
                ...updatedData.filter(
                  (newNft: NFTFeedItem) =>
                    !prevItems.some(
                      (prevNft) => (prevNft as NFTFeedItem).nft_id === newNft.nft_id,
                    ),
                ),
              ],
        )
      } else {
        setItems(
          currentPage === 1
            ? data
            : (prevItems) => [
                ...prevItems,
                ...data.filter(
                  (newOffer: OfferFeedItem) =>
                    !prevItems.some(
                      (prevOffer) => (prevOffer as OfferFeedItem).id === newOffer.id,
                    ),
                ),
              ],
        )
      }

      setHasMore(data.length === GRID_ITEMS_PER_PAGE)
    } catch (error) {
      showToast(`⚠️ Error fetching items`, 2500)
      console.error('Error fetching items:', error)
    }
  }

  useEffect(() => {
    if (userPageProfile) {
      fetchItems(tabOption, 1)
    }
  }, [tabOption, userPageProfile])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchItems(tabOption, nextPage)
  }

  const refreshItems = () => {
    setItems([])
    setPage(1)
    setHasMore(false)
  }

  return { items, hasMore, page, loadMore, refreshItems }
}
