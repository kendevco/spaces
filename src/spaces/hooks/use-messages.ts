'use client'

import { Message, DirectMessage } from '@/payload-types'
import { useEffect, useState, useRef, useCallback } from 'react'

type ChatType = 'channel' | 'conversation'
type MessageType = Message | DirectMessage

interface UseMessagesProps {
  chatId: string
  type: ChatType
  spaceId: string
}

interface MessagesResponse {
  items?: MessageType[]
  docs?: MessageType[]
}

export const useMessages = ({ chatId, type, spaceId }: UseMessagesProps) => {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const retryCount = useRef(0)
  const maxRetries = 3
  const connectionId = useRef(Math.random().toString(36).substring(7))
  const messageSet = useRef(new Set<string>())
  const lastCursor = useRef<string | null>(null)
  const pageSize = 50
  const latestMessageTime = useRef<number>(Date.now())

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore) return

    try {
      setIsLoadingMore(true)
      console.log('[useMessages] Loading more messages:', {
        chatId,
        type,
        lastCursor: lastCursor.current,
        currentMessageCount: messageSet.current.size,
        latestMessageTime: new Date(latestMessageTime.current).toISOString(),
      })

      const params = new URLSearchParams({
        ...(type === 'channel' ? { channelId: chatId } : { conversationId: chatId }),
        ...(lastCursor.current ? { cursor: lastCursor.current } : {}),
        limit: pageSize.toString(),
      })

      const response = await fetch(`/api/messages?${params}`)
      if (!response.ok) throw new Error('Failed to load messages')

      const data = await response.json()
      if (!data || !data.items) {
        console.log('[useMessages] No messages found:', {
          chatId,
          type,
          timestamp: new Date().toISOString(),
        })
        setHasMore(false)
        return
      }

      console.log('[useMessages] Loaded messages:', {
        count: data.items.length,
        hasNextPage: !!data.nextCursor,
        nextCursor: data.nextCursor,
        firstMessageTime: data.items[0]?.createdAt,
        lastMessageTime: data.items[data.items.length - 1]?.createdAt,
      })

      // Update messages
      setMessages((prev) => {
        const newMessages = [...prev]
        let addedCount = 0

        data.items.forEach((message: MessageType) => {
          if (!messageSet.current.has(message.id)) {
            messageSet.current.add(message.id)
            newMessages.push(message)
            addedCount++

            // Update latestMessageTime if this message is newer
            const messageTime = new Date(message.createdAt).getTime()
            if (messageTime > latestMessageTime.current) {
              latestMessageTime.current = messageTime
            }
          }
        })

        console.log('[useMessages] Updated message state:', {
          previousCount: prev.length,
          newCount: newMessages.length,
          addedMessages: addedCount,
          latestMessageTime: new Date(latestMessageTime.current).toISOString(),
        })

        return newMessages.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      })

      // Update pagination state
      setHasMore(!!data.nextCursor)
      lastCursor.current = data.nextCursor || null
    } catch (err) {
      console.error('[useMessages] Error loading more messages:', err)
      setError('Failed to load more messages')
    } finally {
      setIsLoadingMore(false)
    }
  }, [chatId, type, hasMore])

  // Reset state when chat changes
  useEffect(() => {
    console.log('[useMessages] Chat changed, resetting state:', {
      chatId,
      type,
      timestamp: new Date().toISOString(),
    })
    messageSet.current.clear()
    lastCursor.current = null
    latestMessageTime.current = Date.now()
    setHasMore(true)
    setMessages([])
    setError(null) // Reset error state

    // Wrap loadMoreMessages in try-catch for initial load
    const loadInitialMessages = async () => {
      try {
        await loadMoreMessages()
      } catch (err) {
        console.error('[useMessages] Error loading initial messages:', err)
        setError('Failed to load messages')
      }
    }

    loadInitialMessages()
  }, [chatId, type])

  useEffect(() => {
    console.log(`[useMessages][${connectionId.current}] Hook initialized`, {
      chatId,
      type,
      timestamp: new Date().toISOString(),
    })

    const setupSSE = () => {
      // Validate required parameters
      if (!spaceId || !chatId) {
        console.error(`[useMessages][${connectionId.current}] Missing required parameters:`, {
          spaceId,
          chatId,
          type,
          timestamp: new Date().toISOString(),
        })
        setError('Missing required connection parameters')
        return null
      }

      const sseEndpoint = type === 'channel' ? '/api/messages/sse' : '/api/direct-messages/sse'
      const sseParams = new URLSearchParams({
        ...(type === 'channel' ? { channelId: chatId } : { conversationId: chatId }),
        spaceId,
      })

      const url = `${sseEndpoint}?${sseParams}`
      console.log(`[useMessages][${connectionId.current}] Setting up SSE:`, {
        endpoint: url,
        type,
        chatId,
        spaceId,
        timestamp: new Date().toISOString(),
        retryAttempt: retryCount.current,
      })

      try {
        const eventSource = new EventSource(url, {
          withCredentials: true,
        })

        // Log readyState changes
        const logReadyState = () => {
          const states = ['CONNECTING', 'OPEN', 'CLOSED']
          console.log(`[useMessages][${connectionId.current}] EventSource state:`, {
            state: states[eventSource.readyState],
            readyState: eventSource.readyState,
            url: eventSource.url,
            timestamp: new Date().toISOString(),
            spaceId,
            chatId,
          })
        }

        // Initial state logging
        logReadyState()

        // Set up reconnection timer
        let reconnectTimer: NodeJS.Timeout | null = null

        const clearReconnectTimer = () => {
          if (reconnectTimer) {
            console.log(`[useMessages][${connectionId.current}] Clearing reconnect timer:`, {
              spaceId,
              chatId,
              timestamp: new Date().toISOString(),
            })
            clearTimeout(reconnectTimer)
            reconnectTimer = null
          }
        }

        eventSource.onopen = () => {
          console.log(`[useMessages][${connectionId.current}] Connection opened:`, {
            url,
            spaceId,
            chatId,
            timestamp: new Date().toISOString(),
          })
        }

        eventSource.onmessage = (event) => {
          logReadyState()
          if (!event.data) {
            console.warn(`[useMessages][${connectionId.current}] Empty message received`, {
              timestamp: new Date().toISOString(),
            })
            return
          }

          try {
            const data = JSON.parse(event.data)
            console.log(`[useMessages][${connectionId.current}] Message received:`, {
              type: data.type,
              messageId: data.message?.id,
              readyState: eventSource.readyState,
              timestamp: new Date().toISOString(),
              rawLength: event.data.length,
            })

            switch (data.type) {
              case 'message':
              case 'direct-message':
                if (!data.message) {
                  console.warn(`[useMessages][${connectionId.current}] Invalid message format:`, {
                    data,
                    timestamp: new Date().toISOString(),
                  })
                  return
                }

                // Deduplicate messages
                if (messageSet.current.has(data.message.id)) {
                  console.log(`[useMessages][${connectionId.current}] Duplicate message skipped:`, {
                    messageId: data.message.id,
                    content: data.message.content,
                    timestamp: data.message.createdAt,
                  })
                  return
                }

                messageSet.current.add(data.message.id)
                console.log(`[useMessages][${connectionId.current}] Adding new message to state:`, {
                  messageId: data.message.id,
                  content: data.message.content,
                  sender: data.message.sender,
                  timestamp: data.message.createdAt,
                  currentSize: messageSet.current.size,
                })

                // Update latest message time for better ordering
                const messageTime = new Date(data.message.createdAt).getTime()
                if (messageTime > latestMessageTime.current) {
                  latestMessageTime.current = messageTime
                }

                setMessages((prev) => {
                  // Insert message in correct chronological order
                  const newMessage = data.message
                  const insertIndex = prev.findIndex(
                    (msg) => new Date(msg.createdAt).getTime() < messageTime,
                  )

                  let newMessages
                  if (insertIndex === -1) {
                    // Message is oldest, add to end
                    newMessages = [...prev, newMessage]
                  } else {
                    // Insert at correct position
                    newMessages = [
                      ...prev.slice(0, insertIndex),
                      newMessage,
                      ...prev.slice(insertIndex),
                    ]
                  }

                  console.log(`[useMessages][${connectionId.current}] State updated:`, {
                    newCount: newMessages.length,
                    previousCount: prev.length,
                    insertIndex,
                    latestMessageId: newMessage.id,
                    timestamp: new Date().toISOString(),
                  })
                  return newMessages
                })
                break

              case 'connected':
                console.log(`[useMessages][${connectionId.current}] Connection established:`, {
                  readyState: eventSource.readyState,
                  timestamp: new Date().toISOString(),
                  url: eventSource.url,
                  retryCount: retryCount.current,
                })
                setIsReconnecting(false)
                setError(null)
                retryCount.current = 0
                clearReconnectTimer()
                break

              case 'health':
                console.log(`[useMessages][${connectionId.current}] Health check received:`, {
                  timestamp: data.timestamp,
                  messageCount: data.messageCount,
                  pollCount: data.pollCount,
                  readyState: eventSource.readyState,
                  currentTime: new Date().toISOString(),
                  timeSinceLastHealth: Date.now() - data.timestamp,
                  messageSetSize: messageSet.current.size,
                })
                clearReconnectTimer()
                break

              default:
                console.warn(`[useMessages][${connectionId.current}] Unknown message type:`, {
                  type: data.type,
                  timestamp: new Date().toISOString(),
                })
            }
          } catch (error) {
            console.error(`[useMessages][${connectionId.current}] Message parse error:`, {
              error,
              rawData: event.data,
              readyState: eventSource.readyState,
              timestamp: new Date().toISOString(),
            })
          }
        }

        eventSource.onerror = (error) => {
          logReadyState()
          console.error(`[useMessages][${connectionId.current}] Connection error:`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            retryCount: retryCount.current,
            readyState: eventSource.readyState,
            timestamp: new Date().toISOString(),
            url: eventSource.url,
          })
          setIsReconnecting(true)

          if (retryCount.current >= maxRetries) {
            console.error(`[useMessages][${connectionId.current}] Max retries reached:`, {
              maxRetries,
              readyState: eventSource.readyState,
              timestamp: new Date().toISOString(),
            })
            setError('Connection lost. Please refresh the page.')
            eventSource.close()
            return
          }

          // Set up reconnection timer
          clearReconnectTimer()
          const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000)
          console.log(`[useMessages][${connectionId.current}] Setting reconnect timer:`, {
            delay,
            retryCount: retryCount.current,
          })

          reconnectTimer = setTimeout(() => {
            console.log(`[useMessages][${connectionId.current}] Attempting reconnection:`, {
              retryCount: retryCount.current,
              timestamp: new Date().toISOString(),
            })
            eventSource.close()
            setupSSE()
          }, delay)

          retryCount.current += 1
        }

        return eventSource
      } catch (err) {
        console.error(`[useMessages][${connectionId.current}] Failed to create EventSource:`, {
          error: err instanceof Error ? err.message : 'Unknown error',
          url,
          spaceId,
          chatId,
          timestamp: new Date().toISOString(),
        })
        setError('Failed to establish connection')
        return null
      }
    }

    const eventSource = setupSSE()
    if (!eventSource) {
      return
    }

    return () => {
      console.log(`[useMessages][${connectionId.current}] Cleaning up:`, {
        chatId,
        type,
        spaceId,
        timestamp: new Date().toISOString(),
        messageSetSize: messageSet.current.size,
      })
      eventSource.close()
    }
  }, [chatId, type, spaceId])

  return {
    messages,
    isLoading: isLoadingMore,
    hasMore,
    loadMore: loadMoreMessages,
    error,
    isReconnecting,
  }
}
