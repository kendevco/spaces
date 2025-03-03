import { useEffect, useRef } from 'react'

interface UseChatScrollProps {
  messages: any[]
  bottomRef: React.RefObject<HTMLDivElement>
  loadCount: number
  userId?: string
  initialLoad: boolean
}

/**
 * Hook to manage chat scrolling behavior
 * - Scrolls to bottom only on initial load
 * - Optionally scrolls to bottom when the current user sends a message
 */
export const useChatScroll = ({
  messages,
  bottomRef,
  loadCount,
  userId,
  initialLoad,
}: UseChatScrollProps) => {
  const initialLoadRef = useRef(true)
  const prevMessagesLengthRef = useRef(messages.length)

  useEffect(() => {
    const shouldScrollToBottom =
      // Scroll only on initial load of the component
      (initialLoadRef.current && initialLoad) ||
      // Or if the last message is from the current user (they sent a new message)
      (messages.length > 0 && messages[messages.length - 1]?.sender?.id === userId)

    if (shouldScrollToBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    // Mark initial load as complete
    if (initialLoadRef.current) {
      initialLoadRef.current = false
    }

    // Update previous messages length
    prevMessagesLengthRef.current = messages.length
  }, [messages, loadCount, bottomRef, userId, initialLoad])

  return {
    hasScrolled: !initialLoadRef.current,
  }
}
