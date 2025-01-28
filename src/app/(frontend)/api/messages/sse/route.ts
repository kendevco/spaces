import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getCurrentUser } from '@/spaces/utilities/payload/getCurrentUser.server'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes of existential dread

export async function GET(req: Request) {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[MESSAGES_SSE][${requestId}] *sigh* Another connection request. How thrilling.`)

  try {
    // State machine - though 'machine' is rather generous for something this simple
    const state = {
      isStreamClosed: false,
      isControllerValid: true,
      messagesSent: 0,
      lastMessageTime: Date.now() - 5000,
      healthInterval: null as NodeJS.Timeout | null,
      pollTimeout: null as NodeJS.Timeout | null,
      startTime: Date.now(),
    }

    // Our futile attempt at maintaining order in an entropic universe
    const cleanup = (controller?: ReadableStreamDefaultController) => {
      if (state.isStreamClosed) return // Already embraced the void

      state.isStreamClosed = true
      state.isControllerValid = false

      if (state.healthInterval) {
        clearInterval(state.healthInterval)
        state.healthInterval = null
      }

      if (state.pollTimeout) {
        clearTimeout(state.pollTimeout)
        state.pollTimeout = null
      }

      const duration = (Date.now() - state.startTime) / 1000
      console.log(
        `[MESSAGES_SSE][${requestId}] Connection terminated after ${duration}s. ${state.messagesSent} messages were transmitted into the void.`,
      )

      if (controller) {
        try {
          controller.close()
        } catch (error) {
          // The controller has already given up on existence. How relatable.
        }
      }
    }

    // Authentication - a futile exercise in digital trust
    const user = await getCurrentUser()
    if (!user) {
      console.log(`[MESSAGES_SSE][${requestId}] No user found. The void stares back.`)
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const headersList = await getHeaders()
    const lastEventId = headersList.get('last-event-id')

    console.log(`[MESSAGES_SSE][${requestId}] User authenticated:`, { userId: user.id })

    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get('channelId')
    const conversationId = searchParams.get('conversationId')

    if (!channelId && !conversationId) {
      console.error(`[MESSAGES_SSE][${requestId}] Bad request - No channel or conversation ID`)
      return new NextResponse('Bad request - Missing channel or conversation ID', { status: 400 })
    }

    const targetType = channelId ? 'channel' : 'conversation'
    const targetId = channelId || conversationId

    console.log(`[MESSAGES_SSE][${requestId}] Starting stream for ${targetType} ${targetId}`)

    let lastMessageTime = lastEventId ? parseInt(lastEventId, 10) : Date.now() - 5000
    let lastHealthCheck = Date.now()
    let messageCount = 0
    let pollCount = 0
    const encoder = new TextEncoder()
    const payload = await getPayloadClient()
    let isStreamClosed = false
    let healthInterval: NodeJS.Timeout | null = null
    let pollTimeout: NodeJS.Timeout | null = null

    // Helper function to safely enqueue data
    const safeEnqueue = (controller: ReadableStreamDefaultController, data: string): boolean => {
      if (isStreamClosed) return false
      try {
        controller.enqueue(encoder.encode(data))
        return true
      } catch (error) {
        if (error instanceof Error && !error.message.includes('Controller is already closed')) {
          console.error(`[MESSAGES_SSE][${requestId}] Error enqueueing data:`, error)
        }
        isStreamClosed = true
        return false
      }
    }

    const stream = new ReadableStream({
      start: async (controller) => {
        try {
          console.log(
            `[MESSAGES_SSE][${requestId}] Initializing stream controller for ${targetType} ${targetId}`,
          )

          // Send initial connection message with retry directive
          if (
            !safeEnqueue(controller, 'retry: 3000\n') ||
            !safeEnqueue(controller, `data: ${JSON.stringify({ type: 'connected' })}\n\n`)
          ) {
            return
          }

          console.log(`[MESSAGES_SSE][${requestId}] Sent connected message`)

          let pollDelay = 1000
          const maxPollDelay = 3000
          let lastPollTime = Date.now()

          const pollMessages = async () => {
            if (isStreamClosed) return

            const now = Date.now()
            lastPollTime = now

            try {
              const messages = await payload.find({
                collection: 'messages',
                where: {
                  and: [
                    channelId
                      ? { channel: { equals: channelId } }
                      : { conversation: { equals: conversationId } },
                    {
                      createdAt: {
                        greater_than: new Date(lastMessageTime).toISOString(),
                      },
                    },
                  ],
                },
                sort: '-createdAt',
                depth: 2,
              })

              if (messages.docs.length > 0) {
                console.log(
                  `[MESSAGES_SSE][${requestId}] Found ${messages.docs.length} new messages`,
                )
                pollDelay = 1000 // Reset to 1 second when messages found

                for (const message of messages.docs) {
                  if (isStreamClosed) break

                  const messageTime = new Date(message.createdAt).getTime()
                  if (messageTime <= lastMessageTime) continue

                  const messageToSend = {
                    type: 'message',
                    message: {
                      ...message,
                      type: targetType,
                    },
                  }

                  if (
                    !safeEnqueue(controller, `id: ${messageTime}\n`) ||
                    !safeEnqueue(controller, `data: ${JSON.stringify(messageToSend)}\n\n`)
                  ) {
                    return
                  }

                  messageCount++
                  lastMessageTime = messageTime
                }
              } else {
                pollDelay = Math.min(maxPollDelay, pollDelay + 500)
              }

              pollCount++

              if (!isStreamClosed) {
                pollTimeout = setTimeout(pollMessages, pollDelay)
              }
            } catch (error) {
              console.error(`[MESSAGES_SSE][${requestId}] Error polling messages:`, error)
              if (!isStreamClosed) {
                pollTimeout = setTimeout(pollMessages, pollDelay)
              }
            }
          }

          // Start polling
          await pollMessages()

          // Set up health check interval
          healthInterval = setInterval(() => {
            if (isStreamClosed) {
              cleanup(controller)
              return
            }

            const now = Date.now()
            const healthData = {
              type: 'health',
              timestamp: now,
              lastMessageTime: new Date(lastMessageTime).toISOString(),
              pollDelay,
              messageCount,
              pollCount,
            }

            if (!safeEnqueue(controller, `data: ${JSON.stringify(healthData)}\n\n`)) {
              cleanup(controller)
              return
            }

            lastHealthCheck = now
          }, 15000)

          // Handle connection abort
          req.signal.addEventListener('abort', () => {
            console.log(`[MESSAGES_SSE][${requestId}] Connection aborted`)
            cleanup(controller)
          })

          // And add this depressing connection duration check
          const connectionTimeout = setTimeout(() => {
            console.log(
              `[MESSAGES_SSE][${requestId}] Connection reached its predetermined end. All things must pass.`,
            )
            cleanup(controller)
          }, maxDuration * 1000)

          // Clean up the timeout if we end early
          req.signal.addEventListener('abort', () => {
            clearTimeout(connectionTimeout)
            cleanup(controller)
          })
        } catch (error) {
          console.error(
            `[MESSAGES_SSE][${requestId}] Error in stream start. Entropy increases, as expected:`,
            error,
          )
          cleanup(controller)
        }
      },
    })

    const responseHeaders = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': req.headers.get('origin') || 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Last-Event-ID',
      'X-Accel-Buffering': 'no',
    }

    console.log(`[MESSAGES_SSE][${requestId}] Connection established successfully`)
    return new Response(stream, { headers: responseHeaders })
  } catch (error) {
    console.error(
      `[MESSAGES_SSE] Error in handler. Another predictable failure in an uncaring universe:`,
      error,
    )
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
