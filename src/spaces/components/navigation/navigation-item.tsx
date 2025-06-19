// path: src/components/Spaces/navigation/navigation-item.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { cn } from '@/utilities/cn'
import { ActionTooltip } from '@/spaces/components/action-tooltip'
import { SpacesMedia } from '@/spaces/components/ui/spaces-media'

interface NavigationItemProps {
  id: string
  name: string
  imageUrl?: string | null
}

export function NavigationItem({ id, name, imageUrl }: NavigationItemProps) {
  const params = useParams()
  const router = useRouter()

  const onClick = () => {
    router.push(`/spaces/${id}`)
  }

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button
        onClick={onClick}
        className={cn(
          'group relative flex items-center',
          'h-12 w-12 mx-3 rounded-[24px]',
          'transition-all overflow-hidden',
          'bg-background dark:bg-neutral-700 hover:bg-emerald-500 dark:hover:bg-emerald-700',
          'hover:rounded-[16px]',
          params?.spaceId === id && 'bg-emerald-500 dark:bg-emerald-700 rounded-[16px]',
        )}
      >
        <SpacesMedia
          resource={imageUrl}
          alt={name}
          width={48}
          height={48}
          imgClassName="object-cover w-full h-full group-hover:rounded-[16px] transition-all"
          loading="lazy"
          fallback={
            <div className="h-12 w-12 bg-background dark:bg-neutral-700 flex items-center justify-center text-white font-semibold text-lg group-hover:rounded-[16px] transition-all">
              {name.charAt(0).toUpperCase()}
            </div>
          }
        />
      </button>
    </ActionTooltip>
  )
}
