'use client'

import { Fragment, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Member, Message as MessageType } from '@/payload-types'
import { useChatScroll } from '@/spaces/hooks/use-chat-scroll'
import { useMessages } from '@/spaces/hooks/use-messages'
import { ExtendedMember } from '@/spaces/types'
import { Loader2, ServerCrash } from 'lucide-react'
import { ChatMessageList } from '@/components/ui/chat-message-list'
import { Button } from '@/components/ui/button'
import { ModernChatItem } from './modern-chat-item'
import { ChatWelcome } from './chat-welcome'

const DATE_FORMAT = 'd MMM yyyy, HH:mm'

interface ModernChatMessagesProps {
  name: string
  member: ExtendedMember
  chatId: string
  type: 'channel' | 'conversation'
  socketQuery: Record<string, string>
}

export const ModernChatMessages = ({
  name,
  member,
  chatId,
  type,
  socketQuery,
}: ModernChatMessagesProps) => {
  const chatRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, error } = useMessages({
    chatId,
    type,
    spaceId: socketQuery.spaceId || '',
  })

  const { scrollToBottom } = useChatScroll({
    chatRef,
    bottomRef,
    shouldLoadMore: false,
    loadMore: () => {
      // Implement load more logic here
      console.log('Loading more messages...')
    },
    count: messages.length,
  })

  useEffect(() => {
    // Auto-scroll to bottom for new messages
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  if (error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666]">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Something went wrong!</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] relative">
      <ChatMessageList ref={chatRef} className="flex-1 overflow-y-auto pb-4 bg-transparent">
        {/* Welcome message */}
        <div className="pt-2 pb-4">
          <ChatWelcome name={name} type={type} />
        </div>

        {/* Messages */}
        <div className="space-y-1">
          {messages.map((message) => {
            return (
              <Fragment key={message.id}>
                <ModernChatItem
                  id={message.id}
                  content={message.content ?? undefined}
                  contentJson={(message as any).contentJson}
                  messageType={(message as any).messageType}
                  attachments={message.attachments ?? undefined}
                  member={(message as any).member as ExtendedMember}
                  timestamp={message.createdAt}
                  fileUrl={(message as any).fileUrl}
                  deleted={Boolean(message.deleted)}
                  currentMember={member}
                  isUpdated={message.updatedAt !== message.createdAt}
                  socketQuery={socketQuery}
                />
              </Fragment>
            )
          })}
        </div>

        {/* Bottom anchor for auto-scroll */}
        <div ref={bottomRef} />
      </ChatMessageList>

      {/* Scroll to bottom button */}
      <div className="absolute bottom-4 right-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="opacity-75 hover:opacity-100 transition-opacity"
        >
          Scroll to bottom
        </Button>
      </div>
    </div>
  )
}
