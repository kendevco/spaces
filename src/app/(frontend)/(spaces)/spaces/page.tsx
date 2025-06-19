// src/app/(spaces)/spaces/page.tsx
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { getAuthenticatedUser } from './actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SpaceCard } from './components/space-card'

export const dynamic = 'force-dynamic'

export default async function SpacesPage() {
  try {
    const { user } = await getAuthenticatedUser()

    if (!user) {
      return redirect('/login')
    }

    const payload = await getPayloadClient()
    const { docs: spaces } = await payload.find({
      collection: 'spaces',
      depth: 2,
      where: {
        or: [
          {
            owner: {
              equals: user.id,
            },
          },
          {
            'members.user': {
              equals: user.id,
            },
          },
        ],
      },
      user,
    })

    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666]" />
        <div className="relative flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight text-white">Your Spaces</h2>
              <p className="text-zinc-400">Manage your spaces and communities</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <p className="text-sm text-zinc-400">
                  Total Spaces: <span className="text-white">{spaces.length}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/spaces/create"
              className="group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-8 text-center hover:border-zinc-600 hover:bg-zinc-900/80 transition-all duration-300"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] group-hover:scale-105 transition-transform duration-300">
                <Plus className="h-10 w-10 text-white" />
              </div>
              <h3 className="mt-6 text-xl font-medium text-white group-hover:text-zinc-300 transition-colors">
                Create Space
              </h3>
              <p className="mt-2 text-sm text-zinc-400 group-hover:text-zinc-300">
                Start a new community
              </p>
            </Link>
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('[SPACES_PAGE] Error:', error)
    return redirect('/login')
  }
}
