'use client'

import { Space } from '@/payload-types'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { transformPayloadSpace } from '@/spaces/utilities/transforms/space'
import { useEffect } from 'react'

interface SpaceSettingsContentProps {
  space: Space
}

export function SpaceSettingsContent({ space }: SpaceSettingsContentProps) {
  const { onOpen } = useModal()

  useEffect(() => {
    onOpen('editSpace', { space })
  }, [space, onOpen])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-500 dark:text-zinc-400">Loading space settings...</p>
      </div>
    </div>
  )
}
