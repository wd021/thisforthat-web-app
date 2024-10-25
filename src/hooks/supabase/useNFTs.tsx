import { useCallback, useState } from 'react'

import { useToast } from '@/providers/toastProvider'
import { UserNFT } from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

export default function useNFTs() {
  const [userNfts, setUserNfts] = useState<UserNFT[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { showToast } = useToast()

  const fetchUserNfts = useCallback(
    async (userId: string, pageNum: number) => {
      const { data, error } = await supabase
        .from('user_nfts')
        .select('*, nfts!user_nfts_nft_id_fkey(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * GRID_ITEMS_PER_PAGE, pageNum * GRID_ITEMS_PER_PAGE - 1)

      if (error) {
        showToast(`⚠️ Error fetching items`, 2500)
        console.error('Error fetching items:', error)
        return
      }

      setUserNfts((prevUserNfts) => {
        if (pageNum === 1) return data
        const newUserNfts = data.filter(
          (newUserNft: UserNFT) =>
            !prevUserNfts.some((prevUserNft) => prevUserNft.nft_id === newUserNft.nft_id),
        )
        return [...prevUserNfts, ...newUserNfts]
      })

      setHasMore(data.length === GRID_ITEMS_PER_PAGE)
    },
    [showToast],
  )

  const loadMore = useCallback(
    (userId: string) => {
      const nextPage = page + 1
      setPage(nextPage)
      fetchUserNfts(userId, nextPage)
    },
    [page, fetchUserNfts],
  )

  return { userNfts, hasMore, fetchUserNfts, loadMore }
}
