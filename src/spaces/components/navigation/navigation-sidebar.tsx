// path: src/components/Spaces/navigation/navigation-sidebar.tsx

'use client'

import { useEffect, useState } from 'react'
import { NavigationAction } from './navigation-action'
import { NavigationItem } from './navigation-item'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NavigationMenu } from './navigation-menu'
import { Space } from '@/payload-types'
import { spaceService } from '@/spaces/services/spaceService.client'

export const NavigationSidebar = () => {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userSpaces = await spaceService.getUserSpaces()
        setSpaces(userSpaces)
      } catch (error) {
        console.error('[NAV_SIDEBAR] Error in navigation sidebar:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return null
  }

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-white w-full bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {spaces.map((space) => {
          // Handle both string and object image types
          const imageUrl = space.image
            ? typeof space.image === 'string'
              ? space.image.startsWith('http')
                ? space.image
                : `/media/${space.image}`
              : space.image.url
                ? space.image.url.startsWith('http')
                  ? space.image.url
                  : `/media/${space.image.url}`
                : null
            : null

          return (
            <div key={space.id} className="mb-4">
              <NavigationItem id={space.id} name={space.name} imageUrl={imageUrl} />
            </div>
          )
        })}
      </ScrollArea>
      <div className="flex pb-3 mt-auto items-center flex-col gap-y-4">
        <NavigationMenu />
      </div>
    </div>
  )
}
