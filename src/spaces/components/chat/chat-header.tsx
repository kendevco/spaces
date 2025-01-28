// path: src/components/Spaces/chat/chat-header.tsx

'use client'

import { Hash } from 'lucide-react'
import { MobileToggle } from '../mobile-toggle'
import { UserAvatar } from '../user-avatar'
import { SocketIndicator } from '../socket-indicator'
import { ChatVideoButton } from './chat-video-button'
import type { Space } from '@/payload-types'
import { ExtendedMember, MemberRole } from '@/spaces/types'

type BaseHeaderProps = {
  spaceId: string
  name: string
  imageUrl?: string
}

type ChannelHeaderProps = BaseHeaderProps & {
  type: 'channel'
  space: Space
  channels: {
    text: any[]
    audio: any[]
    video: any[]
  }
  members: ExtendedMember[]
  role?: MemberRole
}

type ConversationHeaderProps = BaseHeaderProps & {
  type: 'conversation'
}

type ChatHeaderProps = ChannelHeaderProps | ConversationHeaderProps

export function ChatHeader(props: ChatHeaderProps) {
  const { spaceId, name, type, imageUrl } = props

  return (
    <div className="text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] shrink-0 sticky top-0 z-10">
      {type === 'channel' && <MobileToggle spaceId={props.space.id} />}
      {type === 'conversation' && <MobileToggle spaceId={spaceId} />}
      {type === 'channel' && <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />}
      {type === 'conversation' && (
        <UserAvatar src={imageUrl} className="h-8 w-8 md:h-8 md:w-8 mr-2" />
      )}
      <p className="font-semibold text-md text-white">{name}</p>
      <div className="ml-auto flex items-center">
        {type === 'conversation' && <ChatVideoButton />}
        <SocketIndicator />
      </div>
    </div>
  )
}
