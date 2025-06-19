'use client'
import { useEffect, useState, useRef, useCallback } from 'react'

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement | null>
  bottomRef: React.RefObject<HTMLDivElement | null>
  shouldLoadMore: boolean
  loadMore: () => void
  count: number
}

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count,
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const loadingRef = useRef(false)
  const lastCountRef = useRef(count)
  const scrollPositionRef = useRef(0)
  const previousScrollHeight = useRef(0)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fixed scroll to bottom that properly positions messages
  const scrollToBottom = useCallback(
    (force = false, smooth = true) => {
      if (!chatRef.current || (!shouldAutoScroll && !force)) return

      // Prevent multiple simultaneous scroll operations
      if (isScrollingRef.current && !force) return

      isScrollingRef.current = true

      // Clear any existing scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Use setTimeout to defer execution outside the render cycle
      setTimeout(() => {
        if (chatRef.current) {
          const { scrollHeight, clientHeight } = chatRef.current
          // Simply scroll to the very bottom - no need to add input height
          const targetScrollTop = scrollHeight - clientHeight

          if (smooth) {
            chatRef.current.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth',
            })
          } else {
            chatRef.current.scrollTop = Math.max(0, targetScrollTop)
          }
        }
      }, 0)

      // Reset scrolling flag after animation completes
      scrollTimeoutRef.current = setTimeout(
        () => {
          isScrollingRef.current = false
        },
        smooth ? 500 : 100,
      )
    },
    [chatRef, shouldAutoScroll],
  )

  // Improved near-bottom detection
  const checkIfNearBottom = useCallback(() => {
    if (!chatRef.current) return false

    const { scrollTop, scrollHeight, clientHeight } = chatRef.current
    const threshold = 10 // Much smaller threshold for precise detection
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold
    const nearBottom = isAtBottom

    setIsNearBottom(nearBottom)
    setShouldAutoScroll(nearBottom)

    return nearBottom
  }, [chatRef])

  // Scroll handler for load more and bottom detection
  const handleScroll = useCallback(() => {
    if (!chatRef.current || loadingRef.current || isScrollingRef.current) return

    const { scrollTop, scrollHeight } = chatRef.current
    scrollPositionRef.current = scrollTop

    // Check if near bottom for auto-scroll behavior
    checkIfNearBottom()

    // Load more messages when scrolled near top
    const loadThreshold = Math.min(100, scrollHeight * 0.05)
    if (scrollTop < loadThreshold && shouldLoadMore && !loadingRef.current) {
      loadingRef.current = true
      previousScrollHeight.current = scrollHeight

      // Use requestAnimationFrame for smooth loading
      requestAnimationFrame(() => {
        loadMore()
        // Reset loading state after operation completes
        setTimeout(() => {
          loadingRef.current = false
        }, 300)
      })
    }
  }, [chatRef, shouldLoadMore, loadMore, checkIfNearBottom])

  // Maintain scroll position after loading older messages
  useEffect(() => {
    if (!chatRef.current) return

    const currentScrollHeight = chatRef.current.scrollHeight
    const heightDifference = currentScrollHeight - previousScrollHeight.current

    // Only adjust scroll if we loaded new messages and user wasn't at bottom
    if (heightDifference > 0 && !isNearBottom && previousScrollHeight.current > 0) {
      // Restore scroll position to maintain user's view
      const targetScrollTop = scrollPositionRef.current + heightDifference

      // Single adjustment without double verification to prevent accumulation
      requestAnimationFrame(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = targetScrollTop
        }
      })
    }

    previousScrollHeight.current = currentScrollHeight
  }, [count, chatRef, isNearBottom])

  // Auto-scroll behavior for new messages
  useEffect(() => {
    const countChanged = count !== lastCountRef.current
    const previousCount = lastCountRef.current
    lastCountRef.current = count

    if (countChanged && count > 0) {
      if (!hasInitialized) {
        // First load - always scroll to bottom
        setTimeout(() => {
          scrollToBottom(true, false) // Fast initial scroll
          setHasInitialized(true)
        }, 100)
      } else if (isNearBottom || count > previousCount) {
        // New message arrived and user is near bottom, or message count increased
        setTimeout(() => {
          scrollToBottom(false, true) // Smooth scroll for new messages
        }, 50)
      }
    }
  }, [count, hasInitialized, isNearBottom, scrollToBottom])

  // Throttled scroll event listener
  useEffect(() => {
    const chatElement = chatRef.current
    if (!chatElement) return

    let throttleTimer: NodeJS.Timeout | null = null
    let isThrottled = false

    const throttledScrollHandler = () => {
      if (isThrottled) return

      isThrottled = true
      handleScroll()

      throttleTimer = setTimeout(() => {
        isThrottled = false
      }, 16) // ~60fps throttling
    }

    // Use passive listener for better performance
    chatElement.addEventListener('scroll', throttledScrollHandler, { passive: true })

    return () => {
      chatElement.removeEventListener('scroll', throttledScrollHandler)
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
    }
  }, [handleScroll])

  // Simplified intersection observer for bottom detection
  useEffect(() => {
    if (!bottomRef.current || !chatRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          setIsNearBottom(true)
          setShouldAutoScroll(true)
        }
      },
      {
        root: chatRef.current,
        rootMargin: '0px', // Remove all margins to prevent extra spacing
        threshold: [0, 1],
      },
    )

    observer.observe(bottomRef.current)

    return () => observer.disconnect()
  }, [bottomRef, chatRef])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return {
    isNearBottom,
    shouldAutoScroll,
    scrollToBottom: () => scrollToBottom(true, true),
    hasInitialized,
  }
}
