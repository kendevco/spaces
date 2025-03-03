import { useEffect, useRef, useState } from 'react'

interface UseInfiniteScrollProps {
  hasMore: boolean
  loadMore: () => void
  shouldLoadMore: boolean
  count: number
  manualLoading?: boolean
}

export const useInfiniteScroll = ({
  hasMore,
  loadMore,
  shouldLoadMore,
  count,
  manualLoading = false,
}: UseInfiniteScrollProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (manualLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.length) return
        const first = entries[0]!
        if (first.isIntersecting && shouldLoadMore && !loadingMore) {
          setLoadingMore(true)
          loadMore()
          setTimeout(() => setLoadingMore(false), 500)
        }
      },
      {
        threshold: 0.1,
      },
    )

    const currentRef = ref.current

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [shouldLoadMore, loadMore, manualLoading, loadingMore])

  const handleLoadMore = () => {
    if (hasMore && shouldLoadMore && !loadingMore) {
      setLoadingMore(true)
      loadMore()
      setTimeout(() => setLoadingMore(false), 500)
    }
  }

  return {
    ref,
    messages: count,
    loadingMore,
    handleLoadMore,
  }
}
