export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { messageQueue } from '@/spaces/utilities/socket/messageQueue'
import { getCurrentUser } from '@/spaces/utilities/payload/getCurrentUser.server'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { NextResponse } from 'next/server'
import { CollectionSlugs } from '@/spaces/types'
import { Where } from 'payload'

const MESSAGES_BATCH = 10

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      console.log('[DIRECT_MESSAGES_POST] Unauthorized - No user found')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content, conversationId } = await req.json()
    if (!conversationId) {
      console.log('[DIRECT_MESSAGES_POST] Bad request - No conversation ID')
      return new NextResponse('Conversation ID required', { status: 400 })
    }

    const payload = await getPayloadClient()
    const message = await payload.create({
      collection: CollectionSlugs.DIRECT_MESSAGES,
      data: {
        content,
        conversation: conversationId,
        sender: user.id,
        role: 'user',
        deleted: 'false',
      },
    })

    console.log(
      `[DIRECT_MESSAGES_POST] Created message ${message.id} for conversation ${conversationId}`,
    )
    messageQueue.enqueue(message, undefined, conversationId)
    console.log(
      `[DIRECT_MESSAGES_POST] Enqueued message ${message.id} for conversation ${conversationId}`,
    )

    return NextResponse.json(message)
  } catch (error) {
    console.error('[DIRECT_MESSAGES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      console.log('[DIRECT_MESSAGES_GET] Unauthorized - No user found')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')
    const cursor = searchParams.get('cursor')

    if (!conversationId) {
      console.log('[DIRECT_MESSAGES_GET] Bad request - No conversation ID')
      return new NextResponse('Conversation ID required', { status: 400 })
    }

    const payload = await getPayloadClient()
    const query = {
      collection: CollectionSlugs.DIRECT_MESSAGES,
      where: {
        and: [
          { conversation: { equals: conversationId } } as Where,
          ...(cursor ? [{ id: { less_than: cursor } } as Where] : []),
        ],
      },
      sort: '-createdAt',
      limit: MESSAGES_BATCH,
      depth: 2,
    }

    const messages = await payload.find(query)
    const items = messages.docs

    let nextCursor: string | undefined = undefined
    const lastItem = items.at(-1)
    if (items.length === MESSAGES_BATCH && lastItem) {
      nextCursor = lastItem.id
    }

    return NextResponse.json({
      items: messages.docs,
      nextCursor: nextCursor,
      hasNextPage: messages.docs.length === MESSAGES_BATCH,
    })
  } catch (error) {
    console.error('[DIRECT_MESSAGES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
