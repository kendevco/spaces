// path: src/components/Spaces/chat/chat-messages.tsx
'use client'

import { Fragment, useRef } from 'react'
import { format } from 'date-fns'
import { Message, User } from '@/payload-types'
import { ExtendedMember } from '@/spaces/types'
import { useMessages } from '@/spaces/hooks/use-messages'
import { useChatScroll } from '@/spaces/hooks/use-chat-scroll'
import { Loader2 } from 'lucide-react'

import { ChatItem } from './chat-item'
import { ChatWelcome } from './chat-welcome'

const DATE_FORMAT = 'd MMM yyyy, HH:mm'

export interface ChatMessagesProps {
  name: string
  member: any // update with actual type
  chatId: string
  type: 'channel' | 'conversation'
  apiUrl: string
  paramKey: string
  paramValue: string
  currentSpace?: { id: string; [key: string]: any }
  currentChannel?: { id: string; [key: string]: any }
  socketUrl?: string
  socketQuery?: Record<string, string>
}

interface MessageWithMember extends Omit<Message, 'member'> {
  member: ExtendedMember
  fileUrl?: string | null
  isUpdated?: boolean
  deleted: string | null
}

export const ChatMessages = ({
  name,
  member,
  chatId,
  type,
  apiUrl,
  paramKey,
  paramValue,
  currentSpace,
  currentChannel,
  socketUrl,
  socketQuery,
}: ChatMessagesProps) => {
  const chatRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, hasMore, isLoading, loadMore, error } = useMessages({
    chatId,
    type,
    spaceId: socketQuery?.spaceId || '',
  })

  useChatScroll({
    chatRef,
    bottomRef,
    shouldLoadMore: hasMore,
    loadMore,
    count: messages?.length ?? 0,
    initialLoad: true,
  })

  if (type === 'channel' && (!socketQuery?.spaceId || !currentSpace || !currentChannel)) {
    return null
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-zinc-500">{error}</p>
      </div>
    )
  }

  if (isLoading && !messages?.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666]">
      <div ref={chatRef} className="flex-1 overflow-y-auto">
        {!hasMore && <ChatWelcome name={name} type={type} />}
        {hasMore && (
          <div className="flex justify-center">
            {isLoading ? (
              <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
            ) : (
              <button
                onClick={() => loadMore()}
                className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
              >
                Load previous messages
              </button>
            )}
          </div>
        )}
        <div className="flex flex-col-reverse gap-4 py-4 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666]">
          {(messages as MessageWithMember[])?.map((message) => {
            const user =
              message.sender && typeof message.sender === 'object' ? message.sender : null

            const messageWithProfile = {
              ...message,
              member:
                typeof message.member === 'string'
                  ? member
                  : {
                      ...message.member,
                      profile: {
                        id: user?.id || 'unknown',
                        name: user?.name || 'Unknown User',
                        email: user?.email || '',
                        imageUrl: null,
                        userId: user?.id || 'unknown',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      },
                    },
            }

            return (
              <ChatItem
                key={message.id}
                id={message.id}
                currentMember={member}
                member={messageWithProfile.member}
                content={message.content}
                fileUrl={message.fileUrl ?? null}
                deleted={message.deleted === 'true'}
                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                isUpdated={message.isUpdated ?? false}
                isLast={false}
                socketUrl={
                  type === 'channel' ? process.env.NEXT_PUBLIC_SOCKET_URL || '' : undefined
                }
                socketQuery={
                  type === 'channel'
                    ? { spaceId: currentSpace!.id, channelId: currentChannel!.id }
                    : undefined
                }
              />
            )
          })}
        </div>
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
