import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

import { useToast } from '@/providers/toastProvider'
import { Profile } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

export default function useFollow(userPageProfile: Profile | null, currentUser: User | null) {
  const [isFollowing, setIsFollowing] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !userPageProfile) return

      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', currentUser.id)
        .eq('followed_id', userPageProfile.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        showToast(`⚠️ Error getting follow status`, 2500)
        console.error('Error checking follow status:', error)
        return
      }
      setIsFollowing(!!data)
    }

    checkFollowStatus()
  }, [currentUser, userPageProfile, showToast])

  const handleFollow = async () => {
    if (!currentUser || !userPageProfile) return

    if (currentUser.id === userPageProfile.id) {
      showToast(`⚠️ You can't follow yourself`, 2500)
      return
    }

    try {
      if (isFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('followed_id', userPageProfile.id)
        setIsFollowing(false)
      } else {
        await supabase.from('user_follows').insert([
          {
            follower_id: currentUser.id,
            followed_id: userPageProfile.id,
          },
        ])
        setIsFollowing(true)
      }
    } catch (error) {
      showToast(`⚠️ Error ${isFollowing ? 'unfollowing' : 'following'} user`, 2500)
      console.error('Error handling follow:', error)
    }
  }

  return { isFollowing, handleFollow }
}
