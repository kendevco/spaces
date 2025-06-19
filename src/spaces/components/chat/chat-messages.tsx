// path: src/components/Spaces/chat/chat-messages.tsx
'use client'

import { Fragment, useRef, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Message, User } from '@/payload-types'
import { ExtendedMember } from '@/spaces/types'
import { useMessages } from '@/spaces/hooks/use-messages'
import { useChatScroll } from '@/spaces/hooks/use-chat-scroll'
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InfiniteScroll from '@/components/ui/infinite-scroll'

import { ChatItem } from './chat-item'
import { ChatWelcome } from './chat-welcome'
import { LoadMoreButton } from './load-more-button'
import { useTypingSSE } from '@/spaces/hooks/use-typing-sse'
import { CustomChatMessageList } from './custom-chat-message-list'

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

  // Use the improved chat scroll hook
  const { isNearBottom, scrollToBottom, hasInitialized } = useChatScroll({
    chatRef,
    bottomRef,
    shouldLoadMore: hasMore && !isLoading,
    loadMore,
    count: messages.length,
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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] relative">
      <CustomChatMessageList
        ref={chatRef}
        showTypingIndicator={isTyping}
        typingText={typingText}
        className="flex-1"
      >
        {/* Welcome message */}
        <div className="pt-2">
          <ChatWelcome name={name} type={type} />
        </div>

        {/* Infinite scroll wrapper for seamless loading */}
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isLoading}
          next={loadMore}
          threshold={0.8}
          reverse={true}
          rootMargin="100px"
        >
          {/* Clean loading indicator */}
          {hasMore && (
            <div className="flex justify-center py-3">
              {isLoading ? (
                <div className="flex items-center gap-2 text-zinc-300 text-sm bg-black/20 px-4 py-2 rounded-full">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading messages...
                </div>
              ) : (
                <div className="text-zinc-400 text-xs bg-black/20 px-3 py-1 rounded-full">
                  Scroll up for older messages
                </div>
              )}
            </div>
          )}
        </InfiniteScroll>

        {/* Messages container with proper spacing */}
        <div className="flex flex-col space-y-0 pb-1">
          {messages.length === 0 && !isLoading && (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-sm text-zinc-400 bg-black/20 px-4 py-3 rounded-md">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}

          {messages
            .slice()
            .reverse()
            .map((message, index) => {
              const user =
                message.sender && typeof message.sender === 'object' ? message.sender : null

              const messageWithProfile = {
                ...message,
                member: (() => {
                  // For direct messages, which don't have a member property
                  if (type === 'conversation') {
                    return {
                      id: message.id,
                      user: message.sender,
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

                  // For channel messages, which might have a member property
                  // Check if the message has a member property before accessing it
                  const hasMember = 'member' in message

                  if (!hasMember) {
                    // Fallback for messages without member property
                    return {
                      id: message.id,
                      user: message.sender,
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

                  // Now we know message has a member property
                  const messageMember = (message as any).member

                  return typeof messageMember === 'string'
                    ? member
                    : {
                        ...(messageMember || {}),
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
              }

              return (
                <div key={message.id} className="px-0">
                  <ChatItem
                    id={message.id}
                    currentMember={member}
                    member={messageWithProfile.member}
                    content={message.content || undefined}
                    fileUrl={(() => {
                      // Extract URL from attachments array
                      if (
                        'attachments' in message &&
                        message.attachments &&
                        Array.isArray(message.attachments) &&
                        message.attachments.length > 0
                      ) {
                        const firstAttachment = message.attachments[0]

                        // Handle populated Media/SpacesMedia objects
                        if (typeof firstAttachment === 'object' && firstAttachment !== null) {
                          // Check for url property (standard Media objects)
                          if ('url' in firstAttachment && firstAttachment.url) {
                            return firstAttachment.url as string
                          }

                          // Handle nested file structure for Messages collection
                          if ('file' in firstAttachment && firstAttachment.file) {
                            const file = firstAttachment.file
                            if (
                              typeof file === 'object' &&
                              file !== null &&
                              'url' in file &&
                              file.url
                            ) {
                              return file.url as string
                            }
                          }
                        }

                        // Handle string IDs (unpopulated references)
                        if (typeof firstAttachment === 'string') {
                          // Would need to fetch the media object, but for now return null
                          return null
                        }
                      }
                      return null
                    })()}
                    deleted={message.deleted === 'true'}
                    timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                    isUpdated={(() => {
                      // Check if isUpdated exists on this message type
                      if ('isUpdated' in message) {
                        return (message as any).isUpdated ?? false
                      }
                      return false
                    })()}
                    isLast={index === messages.length - 1}
                    socketUrl={
                      type === 'channel' ? process.env.NEXT_PUBLIC_SOCKET_URL || '' : undefined
                    }
                    socketQuery={
                      type === 'channel'
                        ? { spaceId: currentSpace!.id, channelId: currentChannel!.id }
                        : undefined
                    }
                  />
                </div>
              )
            })}
        </div>

        {/* Bottom reference for scroll detection */}
        <div ref={bottomRef} />
      </CustomChatMessageList>

      {/* Scroll to bottom button - cleaner positioning */}
      {!isNearBottom && hasInitialized && (
        <div className="absolute bottom-20 right-4 z-20">
          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToBottom}
            className="h-10 w-10 p-0 rounded-full shadow-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600 transition-all duration-200"
          >
            <ChevronDown className="h-5 w-5 text-zinc-300" />
          </Button>
        </div>
      )}
    </div>
  )
}
