// path: src/app/(spaces)/spaces/[spaceId]/layout.tsx
import React from 'react'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/app/(frontend)/(spaces)/spaces/actions'
import { SpaceSidebar } from '@/spaces/components/space/space-sidebar'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Space Layout',
  description: 'Layout for Space pages',
}

interface Props {
  children: React.ReactNode
  params: Promise<{ spaceId: string }>
}

export default async function SpaceLayout({ children, params }: Props) {
  try {
    const { spaceId } = await params
    const { user } = await getAuthenticatedUser()

    if (!user) {
      return redirect('/login')
    }

    return (
      <div className="h-full">
        <div className="sidebar hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
          <SpaceSidebar spaceId={spaceId} />
        </div>
        <main className="h-full md:pl-60 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666]">
          {children}
        </main>
      </div>
    )
  } catch (error) {
    // Don't treat redirect "errors" as actual errors
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error // Let Next.js handle the redirect
    }

    console.error('[SPACE_LAYOUT] Error in space layout:', error)
    return redirect('/spaces')
  }
}
