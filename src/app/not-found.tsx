'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Page Not Found</h1>
      <p className="text-lg text-muted-foreground">Could not find requested resource</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}
