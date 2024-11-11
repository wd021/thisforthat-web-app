import { useEffect, useRef, useState } from 'react'
import { User } from '@supabase/supabase-js'

import { useToast } from '@/providers/toastProvider'
import { OfferMessage, Profile } from '@/types/supabase'
import { FEED_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

interface UseCommentSectionProps {
  offerId: string
  user: User | null
  profile: Profile | null
  initialCommentCount: number
}

export default function useCommentSection({
  offerId,
  user,
  profile,
  initialCommentCount,
}: UseCommentSectionProps) {
  const { showToast } = useToast()
  const commentsContainerRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<OfferMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [initialFetchComplete, setInitialFetchComplete] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [wasNearBottom, setWasNearBottom] = useState(false)
  const [commentCount, setCommentCount] = useState(initialCommentCount)

  const scrollToBottom = () => {
    if (!commentsContainerRef.current) return
    commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight
  }

  const checkIfNearBottom = () => {
    if (!commentsContainerRef.current) return false
    const container = commentsContainerRef.current
    const threshold = 100
    const isNear =
      container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
    setWasNearBottom(isNear)
    return isNear
  }

  const fetchMessages = async (pageNum: number) => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      const totalMessages = await supabase
        .from('offer_messages')
        .select('count')
        .eq('offer_id', offerId)
        .single()

      const total = totalMessages.data?.count || 0
      const end = total - (pageNum - 1) * FEED_ITEMS_PER_PAGE - 1
      const start = Math.max(end - FEED_ITEMS_PER_PAGE + 1, 0)

      const { data, error } = await supabase
        .from('offer_messages')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: true })
        .range(start, end)

      if (error) throw error

      if (data?.length > 0) {
        setMessages((prev) => (pageNum === 1 ? data : [...data, ...prev]))
        setHasMore(start > 0)
      } else {
        setHasMore(false)
      }

      if (pageNum === 1) setInitialFetchComplete(true)
    } catch (error) {
      showToast(`⚠️ Failed to fetch comments`, 2500)
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newMessage.trim()) return
    if (!user || !profile) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }
    if (profile?.banned) {
      showToast(`⚠️ You are banned from commenting`, 2500)
      return
    }

    const optimisticId = Math.random()
    const newMsg = {
      user_id: profile.id,
      offer_id: offerId,
      type: 'user',
      message: newMessage.trim(),
      username: profile.username,
      profile_pic_url: profile.profile_pic_url,
    }

    const shouldScroll = checkIfNearBottom()

    try {
      // Optimistic updates
      setMessages((prev) => [
        ...prev,
        {
          ...newMsg,
          id: optimisticId,
          created_at: new Date().toISOString(),
        } as unknown as OfferMessage,
      ])
      setCommentCount((prev) => prev + 1)

      const { error } = await supabase.from('offer_messages').insert(newMsg)
      if (error) throw error

      setNewMessage('')
      if (shouldScroll) scrollToBottom()
    } catch (error) {
      showToast(`⚠️ Failed to send message`, 2500)
      console.error('Failed to send message:', error)
      setMessages((prev) => prev.filter((msg) => Number(msg.id) !== optimisticId))
      setCommentCount((prev) => prev - 1) // Revert the optimistic update
    }
  }

  // Effect for real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('offer_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offer_messages',
          filter: `offer_id=eq.${offerId}`,
        },
        (payload) => {
          if (payload.new.user_id === user?.id) return
          setMessages((prev) => [...prev, payload.new as OfferMessage])
          setCommentCount((prev) => prev + 1)
        },
      )
      .subscribe()

    setPage(1)
    fetchMessages(1)

    return () => {
      channel.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId, user?.id])

  // Effect for initial scroll
  useEffect(() => {
    if (initialFetchComplete && isInitialLoad && messages.length > 0) {
      requestAnimationFrame(() => {
        scrollToBottom()
        setIsInitialLoad(false)
      })
    }
  }, [initialFetchComplete, isInitialLoad, messages])

  // Effect for new message scroll
  useEffect(() => {
    if (!isInitialLoad && wasNearBottom) {
      scrollToBottom()
    }
  }, [messages.length, isInitialLoad, wasNearBottom])

  return {
    messages,
    newMessage,
    loading,
    hasMore,
    page,
    commentCount,
    commentsContainerRef,
    setNewMessage,
    setPage,
    fetchMessages,
    submitMessage,
    checkIfNearBottom,
  }
}
