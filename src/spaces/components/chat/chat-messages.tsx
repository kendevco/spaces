// path: src/components/Spaces/chat/chat-messages.tsx
'use client'

import { Fragment, useRef, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Message, User } from '@/payload-types'
import { ExtendedMember } from '@/spaces/types'
import { useMessages } from '@/spaces/hooks/use-messages'
import { Loader2 } from 'lucide-react'
import { useInfiniteScroll } from '@/spaces/hooks/use-infinite-scroll'

import { ChatItem } from './chat-item'
import { ChatWelcome } from './chat-welcome'
import { LoadMoreButton } from './load-more-button'

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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const prevMessageLengthRef = useRef(0)

  const { messages, hasMore, isLoading, loadMore, error } = useMessages({
    chatId,
    type,
    spaceId: socketQuery?.spaceId || '',
  })

  // Force scroll to bottom on initial load only
  useEffect(() => {
    if (messages.length > 0 && !initialLoadComplete) {
      setInitialLoadComplete(true)
      // Force immediate scroll to bottom on initial load
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' })
      }, 100)
    }
  }, [messages.length, initialLoadComplete])

  // Auto-scroll only for new messages from current user
  useEffect(() => {
    if (!initialLoadComplete || isLoadingMore) return;

    // Only scroll if we have new messages (not from loading more)
    if (messages.length > prevMessageLengthRef.current) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && typeof lastMessage.sender === 'object' && lastMessage.sender?.id === member?.user?.id) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    prevMessageLengthRef.current = messages.length;
  }, [messages, member?.user?.id, initialLoadComplete, isLoadingMore])

  // Custom load more handler to preserve scroll position
  const handleLoadMoreMessages = async () => {
    if (!hasMore || isLoading || isLoadingMore) return;

    setIsLoadingMore(true);

    // Get current scroll position and height
    const chatContainer = chatRef.current;
    const scrollPos = chatContainer?.scrollTop;
    const scrollHeight = chatContainer?.scrollHeight;

    // Load more messages
    await loadMore();

    // After loading, restore scroll position while accounting for new content height
    setTimeout(() => {
      if (chatContainer && scrollPos !== undefined && scrollHeight !== undefined) {
        const newScrollHeight = chatContainer.scrollHeight;
        const heightDifference = newScrollHeight - scrollHeight;
        chatContainer.scrollTop = heightDifference + (scrollPos || 0);
      }
      setIsLoadingMore(false);
    }, 100);
  };

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
        {!isLoadingMore && <ChatWelcome name={name} type={type} />}
        <LoadMoreButton
          onClick={handleLoadMoreMessages}
          loading={isLoadingMore}
          hasMore={hasMore}
        />
        <div className="flex flex-col-reverse gap-4 py-4">
          {messages.map((message) => {
            const user = message.sender && typeof message.sender === 'object' ? message.sender : null

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
                  };
                }

                // For channel messages, which might have a member property
                // Check if the message has a member property before accessing it
                const hasMember = 'member' in message;

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
                  };
                }

                // Now we know message has a member property
                const messageMember = (message as any).member;

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
                    };
              })(),
            }

            return (
              <ChatItem
                key={message.id}
                id={message.id}
                currentMember={member}
                member={messageWithProfile.member}
                content={message.content}
                fileUrl={(() => {
                  // Check if fileUrl exists on this message type
                  if ('fileUrl' in message) {
                    return (message as any).fileUrl ?? null;
                  }
                  return null;
                })()}
                deleted={message.deleted === 'true'}
                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                isUpdated={(() => {
                  // Check if isUpdated exists on this message type
                  if ('isUpdated' in message) {
                    return (message as any).isUpdated ?? false;
                  }
                  return false;
                })()}
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
        <div ref={bottomRef} className="h-0" />
      </div>
    </div>
  )
}
