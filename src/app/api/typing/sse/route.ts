import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getCurrentUser } from '@/spaces/utilities/payload/getCurrentUser.server'
import { getTypingUsers, cleanupStaleTyping } from '../store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max duration

export async function GET(req: Request) {
  try {
    const requestId = Math.random().toString(36).substring(7)
    console.log(`[TYPING_SSE][${requestId}] New SSE connection request`)

    const user = await getCurrentUser()
    if (!user) {
      console.error(`[TYPING_SSE][${requestId}] Unauthorized - No user found`)
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log(`[TYPING_SSE][${requestId}] User authenticated:`, { userId: user.id })

    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get('channelId')
    const conversationId = searchParams.get('conversationId')
    const spaceId = searchParams.get('spaceId')

    if (!spaceId || (!channelId && !conversationId)) {
      console.error(`[TYPING_SSE][${requestId}] Bad request - Missing required params`)
      return new NextResponse('Bad request - Missing spaceId and channelId/conversationId', {
        status: 400,
      })
    }

    const chatId = channelId || conversationId
    const chatType = channelId ? 'channel' : 'conversation'

    console.log(`[TYPING_SSE][${requestId}] Starting stream for ${chatType} ${chatId}`)

    const encoder = new TextEncoder()
    let isStreamClosed = false

    const stream = new ReadableStream({
      start: async (controller) => {
        console.log(
          `[TYPING_SSE][${requestId}] Initializing stream controller for ${chatType} ${chatId}`,
        )

        // Send initial connection message
        if (!isStreamClosed) {
          controller.enqueue(encoder.encode('retry: 3000\n'))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`))
          console.log(`[TYPING_SSE][${requestId}] Sent connected message for ${chatType} ${chatId}`)
        }

        // Clean up stale typing indicators (older than 10 seconds)
        const cleanupTyping = () => {
          if (isStreamClosed) return

          const beforeCount = getTypingUsers(chatId!).length
          cleanupStaleTyping(10000) // 10 seconds timeout
          const afterCount = getTypingUsers(chatId!).length

          if (beforeCount !== afterCount) {
            console.log(
              `[TYPING_SSE][${requestId}] Cleaned up stale typing indicators: ${beforeCount} -> ${afterCount}`,
            )
            sendTypingUpdate()
          }
        }

        // Send current typing state to new connection
        const sendTypingUpdate = () => {
          if (isStreamClosed) return

          try {
            const typingUsers = getTypingUsers(chatId!, user.id) // Exclude current user
              .map((data) => ({ userId: data.userId, userName: data.userName }))

            const message = {
              type: 'typing_update',
              chatId: chatId!,
              chatType,
              typingUsers,
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
            console.log(`[TYPING_SSE][${requestId}] Sent typing update:`, {
              typingUsers: typingUsers.length,
            })
          } catch (error) {
            console.error(`[TYPING_SSE][${requestId}] Error sending typing update:`, error)
          }
        }

        // Send initial typing state
        sendTypingUpdate()

        // Set up cleanup interval (every 5 seconds)
        const cleanupInterval = setInterval(cleanupTyping, 5000)

        // Set up health check interval (every 30 seconds)
        const healthInterval = setInterval(() => {
          if (isStreamClosed) {
            clearInterval(healthInterval)
            return
          }

          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'health',
                  timestamp: Date.now(),
                })}\n\n`,
              ),
            )
          } catch (error) {
            console.error(`[TYPING_SSE][${requestId}] Error sending health check:`, error)
            isStreamClosed = true
            clearInterval(healthInterval)
            clearInterval(cleanupInterval)
          }
        }, 30000)

        // Cleanup on abort
        req.signal.addEventListener('abort', () => {
          console.log(`[TYPING_SSE][${requestId}] Connection aborted, cleaning up`)
          isStreamClosed = true
          clearInterval(healthInterval)
          clearInterval(cleanupInterval)
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[TYPING_SSE] Error in SSE handler:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
