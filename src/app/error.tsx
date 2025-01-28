'use client'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-foreground">Something went wrong!</h1>
      <p className="text-lg text-muted-foreground">{error.message}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
