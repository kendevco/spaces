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
  const isLoadingMoreRef = useRef(false)
  const loadMoreClickedRef = useRef(false)

  // Handle infinite scroll up and button click
  useEffect(() => {
    const topDiv = chatRef?.current
    if (!topDiv) return

    const handleScroll = () => {
      const scrollTop = topDiv.scrollTop
      const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight

      // Set userScrolled to true when user scrolls up
      if (!userScrolledRef.current && distanceFromBottom > 100) {
        userScrolledRef.current = true
      }

      // Reset userScrolled when user scrolls back to bottom
      if (userScrolledRef.current && distanceFromBottom <= 100) {
        userScrolledRef.current = false
      }

      if (scrollTop === 0 && shouldLoadMore && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true
        loadMoreClickedRef.current = false
        const currentHeight = topDiv.scrollHeight
        const currentScrollTop = topDiv.scrollTop

        loadMore()

        // After loading, maintain scroll position
        setTimeout(() => {
          const newHeight = topDiv.scrollHeight
          const heightDifference = newHeight - currentHeight
          topDiv.scrollTop = heightDifference + currentScrollTop
          isLoadingMoreRef.current = false
        }, 100)
      }
    }

    topDiv.addEventListener('scroll', handleScroll)
    return () => topDiv.removeEventListener('scroll', handleScroll)
  }, [shouldLoadMore, loadMore, chatRef])

  // Handle auto-scroll for new messages
  useEffect(() => {
    const bottomDiv = bottomRef?.current
    const topDiv = chatRef?.current
    if (!topDiv || !bottomDiv || isLoadingMoreRef.current || loadMoreClickedRef.current) return

    const shouldAutoScroll = () => {
      // Always scroll on initial load
      if (initialLoad) return true

      // Don't auto-scroll if user has scrolled up and is reading history
      if (userScrolledRef.current) return false

      // Auto-scroll if user is near bottom
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

  // Expose a function to handle load more button clicks
  const handleLoadMoreClick = () => {
    if (!isLoadingMoreRef.current && shouldLoadMore) {
      isLoadingMoreRef.current = true
      loadMoreClickedRef.current = true
      loadMore()
      setTimeout(() => {
        isLoadingMoreRef.current = false
      }, 100)
    }
  }

  return { handleLoadMoreClick }
}
