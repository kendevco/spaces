'use server'

import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { messageQueue } from '@/spaces/utilities/socket/messageQueue'

export async function sendMessage({
  content,
  channelId,
  spaceId,
}: {
  content: string
  channelId: string
  spaceId: string
}) {
  try {
    const headersList = await headers()
    const payload = await getPayloadClient()

    // Get the user from the current request
    const { user } = await payload.auth({ headers: headersList })

    if (!user?.id) {
      throw new Error('Unauthorized')
    }

    // Find the member for the current user in this space
    const memberResult = await payload.find({
      collection: 'members',
      where: {
        space: { equals: spaceId },
        user: { equals: user.id },
      },
      depth: 1,
    })

    if (!memberResult.docs.length) {
      throw new Error('Member not found')
    }

    const member = memberResult.docs[0]

    // Create the message
    const message = await payload.create({
      collection: 'messages',
      data: {
        content,
        channel: channelId,
        member: member?.id || '',
        sender: user.id,
        role: 'user',
        deleted: 'false' as const,
        attachments: [],
      },
    })

    // Add message to queue
    messageQueue.enqueue(message, channelId)

    // Revalidate the messages path
    revalidatePath(`/spaces/${spaceId}/channels/${channelId}`)

    return { success: true, message }
  } catch (error) {
    console.error('[SEND_MESSAGE_ACTION]', error)
    return { success: false, error: 'Failed to send message' }
  }
}

export async function sendDirectMessage({
  content,
  conversationId,
  spaceId,
}: {
  content: string
  conversationId: string
  spaceId: string
}) {
  try {
    const headersList = await headers()
    const payload = await getPayloadClient()

    // Get the user from the current request
    const { user } = await payload.auth({ headers: headersList })

    if (!user?.id) {
      throw new Error('Unauthorized')
    }

    // Find the member for the current user in this space
    const memberResult = await payload.find({
      collection: 'members',
      where: {
        space: { equals: spaceId },
        user: { equals: user.id },
      },
      depth: 1,
    })

    if (!memberResult.docs.length) {
      throw new Error('Member not found')
    }

    const member = memberResult.docs[0]

    // Create the direct message
    const message = await payload.create({
      collection: 'direct-messages',
      data: {
        content,
        conversation: conversationId,
        sender: user.id,
        role: 'user',
        deleted: 'false' as const,
        attachments: [],
      },
    })

    // Add message to queue only
    messageQueue.enqueue(message, undefined, conversationId)

    // Revalidate the conversation path
    revalidatePath(`/spaces/${spaceId}/conversations/${conversationId}`)

    return { success: true, message }
  } catch (error) {
    console.error('[SEND_DIRECT_MESSAGE_ACTION]', error)
    return { success: false, error: 'Failed to send direct message' }
  }
}
