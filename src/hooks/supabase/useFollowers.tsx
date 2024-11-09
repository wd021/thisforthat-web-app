import { useEffect, useState } from 'react'

import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { FollowingProfile } from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

const useFollowers = (userId: string, activeTab: 'following' | 'followers') => {
  const [items, setItems] = useState<FollowingProfile[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { showToast } = useToast()

  const fetchItems = async (page: number) => {
    setIsLoading(true)
    try {
      const rangeStart = (page - 1) * GRID_ITEMS_PER_PAGE
      const rangeEnd = page * GRID_ITEMS_PER_PAGE - 1

      let query = supabase
        .from('user_follows')
        .select(
          `
          id,
          follower_id,
          followed_id,
          user_profile!user_follows_${activeTab === 'following' ? 'followed' : 'follower'}_id_fkey1 (
            id,
            username,
            profile_pic_url
          )
        `,
        )
        .order('created_at', { ascending: false })
        .range(rangeStart, rangeEnd)

      if (activeTab === 'following') {
        query = query.eq('follower_id', userId)
      } else {
        query = query.eq('followed_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      if (page === 1) {
        setItems(data)
      } else {
        setItems((prev) => [...prev, ...data])
      }

      setHasMore(data.length === GRID_ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching follows:', error)
      showToast('⚠️ Error fetching follows', 2500)
    } finally {
      setIsLoading(false)
    }
  }

  const unfollowUser = async (targetUserId: string) => {
    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user?.id)
        .eq('followed_id', targetUserId)

      if (error) throw error

      setItems((prev) => prev.filter((item) => item.id !== targetUserId))
      showToast('✅ Unfollowed successfully', 2500)
    } catch (error) {
      console.error('Error unfollowing user:', error)
      showToast('⚠️ Error unfollowing user', 2500)
    }
  }

  useEffect(() => {
    fetchItems(1)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeTab])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchItems(nextPage)
  }

  return { items, hasMore, loadMore, isLoading, unfollowUser }
}

export default useFollowers
