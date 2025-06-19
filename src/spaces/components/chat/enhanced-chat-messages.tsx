'use client'

import { Fragment, useRef, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Message, User } from '@/payload-types'
import { ExtendedMember } from '@/spaces/types'
import { useMessages } from '@/spaces/hooks/use-messages'
import { Loader2, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InfiniteScroll from '@/components/ui/infinite-scroll'

import { ChatItem } from './chat-item'
import { ChatWelcome } from './chat-welcome'
import { useTypingSSE } from '@/spaces/hooks/use-typing-sse'

const DATE_FORMAT = 'd MMM yyyy, HH:mm'

export interface EnhancedChatMessagesProps {
  name: string
  member: any
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

export const EnhancedChatMessages = ({
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
}: EnhancedChatMessagesProps) => {
  const chatRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)

  const { messages, hasMore, isLoading, loadMore, error } = useMessages({
    chatId,
    type,
    spaceId: socketQuery?.spaceId || '',
  })

  // Add real-time typing indicator functionality
  const {
    typingUsers,
    typingText,
    isTyping,
    error: typingError,
  } = useTypingSSE({
    chatId,
    chatType: type,
    spaceId: socketQuery?.spaceId || '',
  })

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (shouldScrollToBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, shouldScrollToBottom])

  // Handle scroll events to determine if user is at bottom
  const handleScroll = () => {
    if (!chatRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = chatRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    setShouldScrollToBottom(isAtBottom)
  }

  if (type === 'channel' && (!socketQuery?.spaceId || !currentSpace || !currentChannel)) {
    return null
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-zinc-500">{error}</p>
      </div>
    )
  }

  if (isLoading && !messages?.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
      </div>
    )
  }

  const processedMessages = messages
    .slice()
    .reverse()
    .map((message, index) => {
      const user = message.sender && typeof message.sender === 'object' ? message.sender : null

      const messageWithProfile = {
        ...message,
        // Handle type conversion for MessageWithMember interface
        channel: (message as any).channel || null,
        member: (() => {
          // For direct messages, which don't have a member property
          if (type === 'conversation') {
            return {
              id: message.id,
              user: message.sender,
              email: user?.email || '',
              role: 'MEMBER' as any,
              space: currentSpace?.id || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              profile: {
                id: user?.id || 'unknown',
                name: user?.name || 'Unknown User',
                email: user?.email || '',
                imageUrl: null,
                userId: user?.id || 'unknown',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }
          }

          // For channel messages with member fallback
          return {
            id: message.id,
            user: message.sender,
            email: user?.email || '',
            role: 'MEMBER' as any,
            space: currentSpace?.id || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profile: {
              id: user?.id || 'unknown',
              name: user?.name || 'Unknown User',
              email: user?.email || '',
              imageUrl: null,
              userId: user?.id || 'unknown',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        })(),
        deleted: message.deleted || false,
        fileUrl: (message as any).fileUrl || undefined,
        isUpdated: (message as any).isUpdated || false,
      } as unknown as MessageWithMember

      return messageWithProfile
    })

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] relative">
      <div
        ref={chatRef}
        className="flex-1 flex flex-col overflow-y-auto scrollbar-hide px-4"
        onScroll={handleScroll}
      >
        {/* Welcome message */}
        <div className="pt-2">
          <ChatWelcome name={name} type={type} />
        </div>

        {/* Infinite scroll wrapper for loading older messages */}
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isLoading}
          next={loadMore}
          threshold={0.8}
          reverse={true}
          rootMargin="100px"
        >
          {/* Loading indicator at top when loading more */}
          {hasMore && (
            <div className="flex justify-center py-3">
              <div className="text-zinc-300 text-sm bg-black/20 px-3 py-2 rounded-full">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading messages...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ChevronUp className="h-4 w-4" />
                    Scroll up for more
                  </div>
                )}
              </div>
            </div>
          )}
        </InfiniteScroll>

        {/* Messages container with dense spacing */}
        <div className="flex flex-col space-y-1 pb-2">
          {processedMessages.length === 0 && !isLoading && (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-sm text-zinc-400 bg-black/20 px-4 py-3 rounded-md">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}

          {processedMessages.map((message, index) => {
            const previousMessage = index > 0 ? processedMessages[index - 1] : null
            const nextMessage =
              index < processedMessages.length - 1 ? processedMessages[index + 1] : null

            const isCompact =
              previousMessage &&
              previousMessage.member?.profile?.id === message.member?.profile?.id &&
              new Date(message.createdAt).getTime() -
                new Date(previousMessage.createdAt).getTime() <
                5 * 60 * 1000

            return (
              <Fragment key={message.id}>
                <ChatItem
                  key={message.id}
                  id={message.id}
                  currentMember={member}
                  member={message.member}
                  content={message.content || undefined}
                  fileUrl={message.fileUrl}
                  deleted={Boolean(message.deleted)}
                  timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                  isUpdated={Boolean(message.isUpdated)}
                  socketUrl={socketUrl}
                  socketQuery={socketQuery}
                  isCompact={Boolean(isCompact)}
                />
              </Fragment>
            )
          })}
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div className="px-2 py-1">
            <div className="text-xs text-zinc-400 bg-black/20 px-3 py-2 rounded-md">
              {typingText}
            </div>
          </div>
        )}

        {/* Bottom anchor for auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {!shouldScrollToBottom && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setShouldScrollToBottom(true)
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="shadow-lg"
          >
            <ChevronUp className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      )}
    </div>
  )
}
