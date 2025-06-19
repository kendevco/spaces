'use client'

import { useEffect, useRef, useState } from 'react'

interface TypingUser {
  userId: string
  userName: string
}

interface UseTypingSSEProps {
  chatId: string
  chatType: 'channel' | 'conversation'
  spaceId: string
}

export function useTypingSSE({ chatId, chatType, spaceId }: UseTypingSSEProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  const maxRetries = 3
  const maxRetryDelay = 5000

  const connect = () => {
    if (!mountedRef.current || eventSourceRef.current) return

    try {
      const params = new URLSearchParams({
        spaceId,
        ...(chatType === 'channel' ? { channelId: chatId } : { conversationId: chatId }),
      })

      const url = `/api/typing/sse?${params.toString()}`
      console.log(`[TYPING_SSE_HOOK] Connecting to ${url}`)

      const eventSource = new EventSource(url, { withCredentials: true })
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log(`[TYPING_SSE_HOOK] Connected to typing SSE for ${chatType} ${chatId}`)
        setError(null)
        retryCountRef.current = 0
      }

      eventSource.onmessage = (event) => {
        if (!mountedRef.current) return

        try {
          const data = JSON.parse(event.data)
          console.log(`[TYPING_SSE_HOOK] Received message:`, data)

          switch (data.type) {
            case 'connected':
              console.log(`[TYPING_SSE_HOOK] SSE connection established`)
              break

            case 'typing_update':
              if (data.chatId === chatId) {
                setTypingUsers(data.typingUsers || [])
                console.log(
                  `[TYPING_SSE_HOOK] Updated typing users:`,
                  data.typingUsers?.length || 0,
                )
              }
              break

            case 'health':
              console.log(`[TYPING_SSE_HOOK] Health check received`)
              break

            default:
              console.log(`[TYPING_SSE_HOOK] Unknown message type:`, data.type)
          }
        } catch (error) {
          console.error(`[TYPING_SSE_HOOK] Error parsing SSE message:`, error)
        }
      }

      eventSource.onerror = (error) => {
        console.error(`[TYPING_SSE_HOOK] SSE error:`, error)

        if (!mountedRef.current) return

        // Clean up current connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          eventSourceRef.current = null
        }

        // Set error state
        setError('Connection lost')
        setTypingUsers([]) // Clear typing users on error

        // Attempt reconnection with exponential backoff
        if (retryCountRef.current < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), maxRetryDelay)
          retryCountRef.current++

          console.log(
            `[TYPING_SSE_HOOK] Retrying connection in ${delay}ms (attempt ${retryCountRef.current}/${maxRetries})`,
          )

          retryTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect()
            }
          }, delay)
        } else {
          console.error(`[TYPING_SSE_HOOK] Max retries reached, giving up`)
          setError('Unable to connect to typing indicators')
        }
      }
    } catch (error) {
      console.error(`[TYPING_SSE_HOOK] Error creating SSE connection:`, error)
      setError('Failed to connect')
    }
  }

  const disconnect = () => {
    console.log(`[TYPING_SSE_HOOK] Disconnecting from typing SSE`)

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setTypingUsers([])
    setError(null)
    retryCountRef.current = 0
  }

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      disconnect()
    }
  }, [chatId, chatType, spaceId])

  // Format typing users for display
  const formatTypingText = (): string => {
    if (typingUsers.length === 0) return ''

    if (typingUsers.length === 1) {
      return `${typingUsers[0]?.userName || 'Someone'} is typing...`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]?.userName || 'Someone'} and ${typingUsers[1]?.userName || 'someone'} are typing...`
    } else {
      return `${typingUsers[0]?.userName || 'Someone'} and ${typingUsers.length - 1} others are typing...`
    }
  }

  return {
    typingUsers,
    typingText: formatTypingText(),
    isTyping: typingUsers.length > 0,
    error,
    reconnect: connect,
  }
}
