'use client'

import { Button } from '@/components/ui/button'

export default function Error500() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-foreground">Server Error</h1>
      <p className="text-lg text-muted-foreground">Something went wrong on our servers.</p>
      <Button onClick={() => window.location.reload()}>Try again</Button>
    </div>
  )
}
