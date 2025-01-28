'use client'

import { Button } from '@/components/ui/button'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { cn } from '@/utilities/ui'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        'h-full flex flex-col items-center justify-center gap-4 bg-background',
      )}
    >
      <h1 className="text-4xl font-bold text-foreground">Something went wrong!</h1>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
