import { useEffect, useState } from 'react'

import { useToast } from '@/providers/toastProvider'
import { Profile } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

export default function useProfile(username: string, currentProfile: Profile | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      if (username === currentProfile?.username) {
        setProfile(currentProfile)
        return
      }

      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('username', username)
        .single()

      if (error) {
        showToast(`⚠️ Error fetching profile`, 2500)
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    }

    fetchProfile()
  }, [username, currentProfile, showToast])

  return profile
}
