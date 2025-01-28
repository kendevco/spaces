import { useEffect, useRef } from 'react'

interface UseInfiniteScrollProps {
  hasMore: boolean
  loadMore: () => void
  shouldLoadMore: boolean
  count: number
}

export const useInfiniteScroll = ({
  hasMore,
  loadMore,
  shouldLoadMore,
  count,
}: UseInfiniteScrollProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.length) return
        const first = entries[0]!
        if (first.isIntersecting && shouldLoadMore) {
          loadMore()
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
  }, [shouldLoadMore, loadMore])

  return {
    ref,
    messages: count,
  }
}
