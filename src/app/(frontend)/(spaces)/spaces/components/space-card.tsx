'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import { SpacesMedia } from '@/spaces/components/ui/spaces-media'
import type { Space } from '@/payload-types'

interface SpaceCardProps {
  space: Space
}

export function SpaceCard({ space }: SpaceCardProps) {
  // Handle members count safely
  const memberCount = Array.isArray(space.members) ? space.members.length : 0

  return (
    <Link
      key={space.id}
      href={`/spaces/${space.id}`}
      className="group relative flex flex-col rounded-lg bg-zinc-900/50 p-6 hover:bg-zinc-900/80 transition-all duration-300 border border-zinc-800 hover:border-zinc-600"
    >
      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-zinc-800/50 border border-zinc-700">
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3 text-zinc-400" />
          <span className="text-xs text-zinc-400">{memberCount}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Space Image */}
        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] opacity-20 group-hover:opacity-30 transition-opacity z-10" />
          <SpacesMedia
            resource={space.image}
            alt={space.name}
            fill
            imgClassName="object-cover"
            loading="lazy"
            fallback={
              <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-zinc-300 font-semibold text-2xl">
                {space.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            }
          />
        </div>

        {/* Space Info */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            {space.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-zinc-300 transition-colors">
              {space.name}
            </h3>
            <p className="text-sm text-zinc-400 group-hover:text-zinc-300">{memberCount} members</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
