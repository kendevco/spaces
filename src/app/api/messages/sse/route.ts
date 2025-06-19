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
    console.log(`[MESSAGES_SSE][${requestId}] New SSE connection request`)

    const headersList = await headers()
    const lastEventId = headersList.get('last-event-id')
    const user = await getCurrentUser()

    if (!user) {
      console.error(`[MESSAGES_SSE][${requestId}] Unauthorized - No user found`)
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log(`[MESSAGES_SSE][${requestId}] User authenticated:`, { userId: user.id })

    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
      console.error(`[MESSAGES_SSE][${requestId}] Bad request - No channel ID`)
      return new NextResponse('Bad request - Missing channel ID', { status: 400 })
    }

    console.log(`[MESSAGES_SSE][${requestId}] Starting stream for channel ${channelId}`)

    let lastMessageTime = lastEventId ? parseInt(lastEventId, 10) : Date.now()
    let lastHealthCheck = Date.now()
    let messageCount = 0
    let pollCount = 0
    const encoder = new TextEncoder()
    const payload = await getPayloadClient()
    let isStreamClosed = false

    const stream = new ReadableStream({
      start: async (controller) => {
        console.log(
          `[MESSAGES_SSE][${requestId}] Initializing stream controller for channel ${channelId}`,
        )

        // Send initial connection message with retry directive
        if (!isStreamClosed) {
          controller.enqueue(encoder.encode('retry: 3000\n'))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`))
          console.log(
            `[MESSAGES_SSE][${requestId}] Sent connected message for channel ${channelId}`,
          )
        }

        // Set up polling interval for messages with dynamic delay
        let pollDelay = 1000 // Start with 1 second
        const maxPollDelay = 5000 // Max 5 seconds
        let lastPollTime = Date.now()

        const pollMessages = async () => {
          if (isStreamClosed) {
            console.log(`[MESSAGES_SSE][${requestId}] Stream closed, stopping poll`)
            return
          }

          const now = Date.now()
          const timeSinceLastPoll = now - lastPollTime

          // Adjust poll delay based on message activity
          if (messageCount > 0) {
            pollDelay = Math.max(1000, pollDelay - 500) // Decrease delay if messages found
          } else {
            pollDelay = Math.min(maxPollDelay, pollDelay + 500) // Increase delay if no messages
          }

          // Reset message count for next interval
          messageCount = 0
          lastPollTime = now

          pollCount++
          console.log(`[MESSAGES_SSE][${requestId}] Polling for messages (${pollCount})`)

          try {
            // Find messages newer than last check
            const messages = await payload.find({
              collection: 'messages',
              where: {
                and: [
                  {
                    channel: { equals: channelId },
                  },
                  {
                    createdAt: {
                      greater_than: new Date(lastMessageTime - 5000).toISOString(),
                    },
                  },
                ],
              },
              sort: '-createdAt',
              depth: 2,
            })

            if (messages.docs.length > 0) {
              // Send each message individually with event ID
              for (const message of messages.docs) {
                if (isStreamClosed) break

                const messageTime = new Date(message.createdAt).getTime()
                if (messageTime <= lastMessageTime) continue

                const messageToSend = {
                  type: 'message',
                  message: {
                    ...message,
                    type: 'channel',
                  },
                }

                try {
                  controller.enqueue(encoder.encode(`id: ${messageTime}\n`))
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(messageToSend)}\n\n`))
                  messageCount++
                  lastMessageTime = messageTime
                } catch (enqueueError) {
                  console.error(`[MESSAGES_SSE][${requestId}] Failed to enqueue message:`, {
                    error: enqueueError,
                    messageId: message.id,
                  })
                }
              }
            }
          } catch (error) {
            console.error(`[MESSAGES_SSE][${requestId}] Error polling messages:`, error)
          }

          // Schedule next poll with dynamic delay
          setTimeout(pollMessages, pollDelay)
        }

        // Start polling
        pollMessages()

        // Set up health check interval (every 15 seconds)
        const healthInterval = setInterval(() => {
          if (isStreamClosed) {
            clearInterval(healthInterval)
            return
          }

          try {
            const now = Date.now()
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'health',
                  timestamp: now,
                  lastMessageTime,
                })}\n\n`,
              ),
            )
            lastHealthCheck = now
          } catch (error) {
            console.error(`[MESSAGES_SSE][${requestId}] Error sending health check:`, error)
            isStreamClosed = true
            clearInterval(healthInterval)
          }
        }, 15000)

        // Cleanup on abort
        req.signal.addEventListener('abort', () => {
          console.log(`[MESSAGES_SSE][${requestId}] Connection aborted, cleaning up`)
          isStreamClosed = true
          clearInterval(healthInterval)
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
    console.error('[MESSAGES_SSE] Error in SSE handler:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
