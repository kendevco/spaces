import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface LoadMoreButtonProps {
  onClick: () => void
  loading: boolean
  hasMore: boolean
}

export const LoadMoreButton = ({ onClick, loading, hasMore }: LoadMoreButtonProps) => {
  if (!hasMore) return null

  return (
    <div className="flex justify-center mt-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={loading || !hasMore}
        className="text-xs bg-background/20 hover:bg-background/40 border-0"
      >
        {loading ? (
          <>
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          'Load older messages'
        )}
      </Button>
    </div>
  )
}
