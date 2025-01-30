// path: src/app/(spaces)/spaces/layout.tsx
import type { Metadata } from 'next'
import { NavigationSidebar } from '@/spaces/components/navigation/navigation-sidebar'
import { Analytics } from '@vercel/analytics/react'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from './spaces/actions'

export default async function SpacesLayout({ children }: { children: React.ReactNode }) {
  console.log('\n[SPACES_LAYOUT] Starting spaces layout render')
  try {
    const { user } = await getAuthenticatedUser()
    console.log('[SPACES_LAYOUT] User authenticated:', { userId: user?.id })

    if (!user) {
      return redirect(`/login?redirect=${encodeURIComponent('/spaces')}`)
    }

    return (
      <div className="relative flex min-h-screen flex-col">
        <div className="flex-1">
          <div className="h-full">
            <div className="h-full flex w-[72px] z-30 flex-col fixed inset-y-0">
              <NavigationSidebar />
            </div>
            <main className="h-full w-full pl-[72px]">{children}</main>
          </div>
        </div>
        <Analytics />
      </div>
    )
  } catch (error) {
    console.error('[SPACES_LAYOUT] Error in spaces layout:', error)
    throw error
  }
}

export const metadata: Metadata = {
  title: {
    default: 'Spaces - Payload CMS Discordant',
    template: '%s | Spaces',
  },
  description: 'Discord Clone written in TypeScript with Next.js 15 Payload CMS 3.0',
  robots: {
    index: false,
    follow: false,
  },
}
