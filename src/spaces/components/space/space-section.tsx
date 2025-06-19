// path: src/components/Spaces/Space/space-section.tsx
'use client'

import { ChannelType, MemberRole, ModalType } from '@/spaces/types'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { Plus, Settings } from 'lucide-react'
import { ActionTooltip } from '@/spaces/components/action-tooltip'
import { Separator } from '@/components/ui/separator'
import { Space } from '@/payload-types'

interface SpaceSectionProps {
  label: string
  role?: MemberRole
  sectionType: 'channels' | 'members'
  channelType?: ChannelType
  space?: Space
  children: React.ReactNode
}

export const SpaceSection = ({
  label,
  role,
  sectionType,
  channelType,
  space,
  children,
}: SpaceSectionProps) => {
  const { onOpen } = useModal()

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between py-2">
        <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
        {role !== MemberRole.GUEST && sectionType === 'channels' && (
          <ActionTooltip label="Create Channel" side="top">
            <button
              onClick={() => onOpen(ModalType.CREATE_CHANNEL, { channelType, space })}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
              aria-label="Create Channel"
              title="Create Channel"
            >
              <Plus className="h-4 w-4" />
            </button>
          </ActionTooltip>
        )}
        {role === MemberRole.ADMIN && sectionType === 'members' && (
          <ActionTooltip label="Manage Members" side="top">
            <button
              onClick={() => onOpen(ModalType.MEMBERS, { space, spaceId: space?.id })}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
              aria-label="Manage Members"
              title="Manage Members"
            >
              <Settings className="h-4 w-4" />
            </button>
          </ActionTooltip>
        )}
      </div>
      <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
      {children}
    </div>
  )
}
