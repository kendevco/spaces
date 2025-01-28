'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-foreground">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground">The page you are looking for does not exist.</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}
