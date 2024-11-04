import { useCallback, useEffect, useRef } from 'react'

export default function useChatScroll(dependencies: unknown[] = []) {
  // const chatEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [])

  const isNearBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      return scrollHeight - scrollTop - clientHeight < 100 // within 100px of bottom
    }
    return false
  }, [])

  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom()
    }
  }, dependencies)

  useEffect(() => {
    scrollToBottom()

    // Add a slight delay to ensure all content is rendered
    const timeoutId = setTimeout(scrollToBottom, 500)

    return () => clearTimeout(timeoutId)
  }, []) // Empty dependency array ensures this runs only once on mount

  return { chatContainerRef, scrollToBottom, isNearBottom }
}
