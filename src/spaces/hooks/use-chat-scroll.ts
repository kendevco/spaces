import { useEffect, RefObject, useRef } from 'react'

interface ChatScrollProps {
  chatRef: RefObject<HTMLDivElement | null>
  bottomRef: RefObject<HTMLDivElement | null>
  shouldLoadMore: boolean
  loadMore: () => void
  count: number
  initialLoad?: boolean
}

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count,
  initialLoad,
}: ChatScrollProps) => {
  const userScrolledRef = useRef(false)

  // Handle infinite scroll up
  useEffect(() => {
    const topDiv = chatRef?.current
    if (!topDiv) return

    const handleScroll = () => {
      const scrollTop = topDiv.scrollTop

      // Set userScrolled to true when user scrolls up
      if (!userScrolledRef.current && scrollTop < topDiv.scrollHeight - topDiv.clientHeight) {
        userScrolledRef.current = true
      }

      if (scrollTop === 0 && shouldLoadMore) {
        const currentHeight = topDiv.scrollHeight
        loadMore()
        // After loading, maintain scroll position
        setTimeout(() => {
          const newHeight = topDiv.scrollHeight
          if (currentHeight && newHeight) {
            topDiv.scrollTop = newHeight - currentHeight
          }
        }, 100)
      }
    }

    topDiv.addEventListener('scroll', handleScroll)
    return () => {
      topDiv.removeEventListener('scroll', handleScroll)
    }
  }, [shouldLoadMore, loadMore, chatRef])

  // Handle auto-scroll for new messages
  useEffect(() => {
    const bottomDiv = bottomRef?.current
    const topDiv = chatRef?.current
    if (!topDiv || !bottomDiv) return

    const shouldAutoScroll = () => {
      // Only auto-scroll if it's initial load or user hasn't scrolled up
      if (initialLoad) return true
      if (userScrolledRef.current) return false

      const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight
      return distanceFromBottom <= 100
    }

    if (shouldAutoScroll()) {
      setTimeout(
        () => {
          bottomDiv.scrollIntoView({
            behavior: initialLoad ? 'auto' : 'smooth',
          })
        },
        initialLoad ? 0 : 100,
      )
    }
  }, [bottomRef, chatRef, count, initialLoad])
}
