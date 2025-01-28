// path: src/components/Spaces/Space/space-channel.tsx
'use client'

import { cn } from '@/utilities/cn'
import { Edit, Hash, Lock, Mic, Trash, Video } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { ActionTooltip } from '../action-tooltip'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { track } from '@vercel/analytics'
import { CollectionSlugs, ModalData, ModalType, ChannelType } from '@/spaces/types'
import { Space, User, Channel } from '@/payload-types'
import { transformPayloadSpace } from '@/spaces/utilities/transforms/space'

// Define a type that extends PayloadChannel with our additional properties
interface ExtendedChannel extends Omit<Channel, 'type'> {
  type: ChannelType
  spaceId: string
}

interface SpaceChannelProps {
  channel: ExtendedChannel
  space: Space
  role?: string
}

const iconMap: Record<ChannelType, any> = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
}

export const SpaceChannel = ({ channel, space, role }: SpaceChannelProps) => {
  const { onOpen } = useModal()
  const params = useParams()
  const router = useRouter()

  const Icon = iconMap[channel.type] || Hash

  const onClick = () => {
    track('Channel Clicked', {
      channelId: channel.id,
      channelType: channel.type,
      spaceId: typeof space === 'string' ? space : space.id,
    })
    router.push(
      `/${CollectionSlugs.SPACES}/${params?.spaceId}/${CollectionSlugs.CHANNELS}/${channel.id}`,
    )
  }

  const onAction = (e: React.MouseEvent, action: ModalType) => {
    e.stopPropagation()

    // Transform the payload Space to match our internal space type
    const transformedSpace = transformPayloadSpace(space)

    const modalData: ModalData = {
      channel: {
        ...channel,
        space: space,
      },
      space: transformedSpace,
      spaceId: space.id,
    }

    onOpen(action, modalData)
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
        params?.channelId === channel.id && 'bg-zinc-700/20 dark:bg-zinc-700',
      )}
    >
      <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
      <p
        className={cn(
          'line-clamp-1 font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition',
          params?.channelId === channel.id &&
            'text-primary dark:text-zinc-200 dark:group-hover:text-white',
        )}
      >
        {channel.name}
      </p>
      {channel.name !== 'general' && role !== 'guest' && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit">
            <Edit
              onClick={(e) => onAction(e, ModalType.EDIT_CHANNEL)}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Delete">
            <Trash
              onClick={(e) => onAction(e, ModalType.DELETE_CHANNEL)}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
      {channel.name === 'general' && (
        <Lock className="ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400" />
      )}
    </button>
  )
}
