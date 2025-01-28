import { messageQueue } from '@/spaces/utilities/socket/messageQueue'
import { getCurrentUser } from '@/spaces/utilities/payload/getCurrentUser.server'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { NextResponse } from 'next/server'

const MESSAGES_BATCH = 10

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      console.error('[MESSAGES_POST] Unauthorized - No user found')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content, channelId, conversationId } = await req.json()

    if (!channelId && !conversationId) {
      console.error('[MESSAGES_POST] Bad request - No channel or conversation ID')
      return new NextResponse('Channel or conversation ID required', { status: 400 })
    }

    const payload = await getPayloadClient()

    // Create the message based on whether it's a channel or conversation message
    const messageData = {
      content,
      member: user.id,
      sender: user.id,
      role: 'user' as const,
      deleted: null,
    }

    if (channelId) {
      const message = await payload.create({
        collection: 'messages',
        data: {
          ...messageData,
          channel: channelId,
        },
      })
      messageQueue.enqueue(message, channelId)
      return NextResponse.json(message)
    } else {
      const message = await payload.create({
        collection: 'direct-messages',
        data: {
          ...messageData,
          conversation: conversationId,
        },
      })
      messageQueue.enqueue(message, undefined, conversationId)
      return NextResponse.json(message)
    }
  } catch (error) {
    console.error('[MESSAGES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      console.error('[MESSAGES_GET] Unauthorized - No user found')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get('channelId')
    const conversationId = searchParams.get('conversationId')
    const cursor = searchParams.get('cursor')
    const since = searchParams.get('since')

    if (!channelId && !conversationId) {
      console.error('[MESSAGES_GET] Bad request - No channel or conversation ID')
      return new NextResponse('Channel or conversation ID required', { status: 400 })
    }

    // If since parameter exists, get messages from queue
    if (since) {
      const queuedMessages = messageQueue.getMessages(
        channelId || undefined,
        conversationId || undefined,
        parseInt(since),
      )
      return NextResponse.json(queuedMessages)
    }

    // Otherwise, fetch from database
    const payload = await getPayloadClient()

    if (channelId) {
      console.info('[MESSAGES_GET] Fetching channel messages for channel:', channelId)

      // First verify the channel exists and user has access
      const channel = await payload.findByID({
        collection: 'channels',
        id: channelId,
      })

      if (!channel) {
        console.error('[MESSAGES_GET] Channel not found:', channelId)
        return new NextResponse('Channel not found', { status: 404 })
      }

      const messages = await payload.find({
        collection: 'messages',
        where: {
          channel: { equals: channelId },
          deleted: { equals: 'false' },
          ...(cursor ? { id: { less_than: cursor } } : {}),
        },
        sort: '-createdAt',
        limit: MESSAGES_BATCH,
        depth: 2,
      })

      let nextCursor: string | null = null
      if (messages.docs.length === MESSAGES_BATCH && messages.docs[MESSAGES_BATCH - 1]) {
        nextCursor = messages.docs[MESSAGES_BATCH - 1]!.id
      }

      console.info('[MESSAGES_GET] Found messages:', messages.docs.length)
      return NextResponse.json({
        items: messages.docs,
        nextCursor: nextCursor,
        hasNextPage: messages.docs.length === MESSAGES_BATCH,
      })
    } else {
      console.info('[MESSAGES_GET] Fetching direct messages for conversation:', conversationId)
      const messages = await payload.find({
        collection: 'direct-messages',
        where: {
          conversation: { equals: conversationId },
          deleted: { equals: 'false' },
          ...(cursor ? { id: { less_than: cursor } } : {}),
        },
        sort: '-createdAt',
        limit: MESSAGES_BATCH,
        depth: 3,
      })

      let nextCursor: string | null = null
      if (messages.docs.length === MESSAGES_BATCH && messages.docs[MESSAGES_BATCH - 1]) {
        nextCursor = messages.docs[MESSAGES_BATCH - 1]!.id
      }

      return NextResponse.json({
        items: messages.docs,
        nextCursor,
      })
    }
  } catch (error) {
    console.error('[MESSAGES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
