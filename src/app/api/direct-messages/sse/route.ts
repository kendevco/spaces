import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getCurrentUser } from '@/spaces/utilities/payload/getCurrentUser.server'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max duration

export async function GET(req: Request) {
  try {
    const requestId = Math.random().toString(36).substring(7)
    console.log(`[DIRECT_MESSAGES_SSE][${requestId}] New SSE connection request`)

    const headersList = headers()
    const user = await getCurrentUser()

    if (!user) {
      console.error(`[DIRECT_MESSAGES_SSE][${requestId}] Unauthorized - No user found`)
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      console.error(`[DIRECT_MESSAGES_SSE][${requestId}] Bad request - No conversation ID`)
      return new NextResponse('Bad request - Missing conversation ID', { status: 400 })
    }

    console.log(
      `[DIRECT_MESSAGES_SSE][${requestId}] Starting stream for conversation ${conversationId}`,
    )

    let lastMessageTime = Date.now()
    let lastHealthCheck = Date.now()
    let messageCount = 0
    const encoder = new TextEncoder()
    const payload = await getPayloadClient()
    let isStreamClosed = false

    const stream = new ReadableStream({
      start: async (controller) => {
        console.log(
          `[DIRECT_MESSAGES_SSE][${requestId}] Initializing stream controller for conversation ${conversationId}`,
        )

        // Send initial connection message
        if (!isStreamClosed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`))
          console.log(
            `[DIRECT_MESSAGES_SSE][${requestId}] Sent connected message for conversation ${conversationId}`,
          )
        }

        // Set up polling interval for messages
        const pollInterval = setInterval(async () => {
          if (isStreamClosed) {
            clearInterval(pollInterval)
            return
          }

          try {
            // Find messages newer than last check
            const messages = await payload.find({
              collection: 'direct-messages',
              where: {
                and: [
                  {
                    conversation: { equals: conversationId },
                  },
                  {
                    createdAt: { greater_than: new Date(lastMessageTime).toISOString() },
                  },
                ],
              },
              sort: '-createdAt',
              depth: 2,
            })

            if (messages.docs.length > 0) {
              console.log(
                `[DIRECT_MESSAGES_SSE][${requestId}] Found ${messages.docs.length} new messages`,
              )

              // Send each message individually
              for (const message of messages.docs) {
                if (isStreamClosed) break

                const messageToSend = {
                  type: 'direct-message',
                  message: {
                    ...message,
                    type: 'direct',
                  },
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(messageToSend)}\n\n`))
                messageCount++
                console.log(
                  `[DIRECT_MESSAGES_SSE][${requestId}] Sent message ${messageCount}: ${message.id}`,
                )
              }

              lastMessageTime = Date.now()
            }
          } catch (error) {
            console.error(`[DIRECT_MESSAGES_SSE][${requestId}] Error polling messages:`, error)
          }
        }, 1000) // Poll every second

        // Set up health check interval
        const healthInterval = setInterval(async () => {
          if (isStreamClosed) {
            clearInterval(healthInterval)
            return
          }

          try {
            const now = Date.now()
            const timeSinceLastHealth = now - lastHealthCheck
            console.log(
              `[DIRECT_MESSAGES_SSE][${requestId}] Health check - Time since last: ${timeSinceLastHealth}ms`,
            )

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'health',
                  timestamp: now,
                  timeSinceLastHealth,
                  messageCount,
                })}\n\n`,
              ),
            )

            lastHealthCheck = now
          } catch (error) {
            console.error(`[DIRECT_MESSAGES_SSE][${requestId}] Error sending health check:`, error)
            isStreamClosed = true
            clearInterval(healthInterval)
          }
        }, 30000) // Health check every 30 seconds

        // Cleanup on abort
        req.signal.addEventListener('abort', () => {
          console.log(
            `[DIRECT_MESSAGES_SSE][${requestId}] Connection aborted, cleaning up intervals`,
          )
          isStreamClosed = true
          clearInterval(pollInterval)
          clearInterval(healthInterval)
          controller.close()
        })
      },

      cancel() {
        console.log(
          `[DIRECT_MESSAGES_SSE][${requestId}] Stream cancelled for conversation ${conversationId}`,
        )
        isStreamClosed = true
      },
    })

    console.log(`[DIRECT_MESSAGES_SSE][${requestId}] Setting response headers`)

    const responseHeaders = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': req.headers.get('origin') || 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Accel-Buffering': 'no',
    }

    console.log(`[DIRECT_MESSAGES_SSE][${requestId}] Returning stream response`)
    return new Response(stream, {
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('[DIRECT_MESSAGES_SSE] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
