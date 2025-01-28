'use server'

import { getPayloadClient } from '../utilities/payload/getPayloadClient'
import { CollectionSlugs } from '../types'
import { getCurrentUser } from '../utilities/payload/getCurrentUser'
import { randomUUID } from 'crypto'
import type { Member, User } from '@/payload-types'

type MemberWithUser = Member & {
  user: {
    id: string
  }
}

export async function createMessage({
  content,
  fileUrl,
  spaceId,
  channelId,
}: {
  content?: string
  fileUrl?: string
  spaceId: string
  channelId: string
}) {
  try {
    const userResponse = await getCurrentUser()
    const userId = userResponse?.user?.id
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const payload = await getPayloadClient()
    const space = await payload.find({
      collection: CollectionSlugs.SPACES,
      where: {
        id: { equals: spaceId },
        'members.user.id': { equals: userId },
      },
      depth: 3,
    })

    if (!space.docs.length || !space.docs?.[0]?.members) {
      return { success: false, error: 'Space not found' }
    }

    const member = (space.docs[0].members as MemberWithUser[]).find((m) => m.user?.id === userId)

    if (!member?.id) {
      return { success: false, error: 'Member not found' }
    }

    const message = await payload.create({
      collection: CollectionSlugs.MESSAGES,
      data: {
        id: randomUUID(),
        content: content || '',
        attachments: fileUrl ? [fileUrl] : undefined,
        channel: channelId,
        member: member.id,
        sender: userId,
        role: 'user',
        deleted: 'false',
        updatedAt: new Date().toISOString(),
      },
    })

    return { success: true, message }
  } catch (error) {
    console.error('[CREATE_MESSAGE]', error)
    return { success: false, error: 'Failed to create message' }
  }
}

export async function updateMessage({
  messageId,
  content,
  spaceId,
  channelId,
}: {
  messageId: string
  content: string
  spaceId: string
  channelId: string
}) {
  try {
    const userResponse = await getCurrentUser()
    if (!userResponse?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const payload = await getPayloadClient()
    const message = await payload.find({
      collection: CollectionSlugs.MESSAGES,
      where: {
        id: { equals: messageId },
        channel: { equals: channelId },
      },
      depth: 2,
    })

    if (!message.docs?.[0] || message.docs[0].deleted === 'true') {
      return { success: false, error: 'Message not found' }
    }

    const updatedMessage = await payload.update({
      collection: CollectionSlugs.MESSAGES,
      id: messageId,
      data: {
        content,
      },
    })

    return { success: true, message: updatedMessage }
  } catch (error) {
    console.error('[UPDATE_MESSAGE]', error)
    return { success: false, error: 'Failed to update message' }
  }
}

export async function deleteMessage({
  messageId,
  spaceId,
  channelId,
}: {
  messageId: string
  spaceId: string
  channelId: string
}) {
  try {
    const userResponse = await getCurrentUser()
    if (!userResponse?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const payload = await getPayloadClient()
    const message = await payload.find({
      collection: CollectionSlugs.MESSAGES,
      where: {
        id: { equals: messageId },
        channel: { equals: channelId },
      },
      depth: 2,
    })

    if (!message.docs?.[0] || message.docs[0].deleted === 'true') {
      return { success: false, error: 'Message not found' }
    }

    const updatedMessage = await payload.update({
      collection: CollectionSlugs.MESSAGES,
      id: messageId,
      data: {
        attachments: [],
        content: 'This message has been deleted',
        deleted: 'true',
      },
    })

    return { success: true, message: updatedMessage }
  } catch (error) {
    console.error('[DELETE_MESSAGE]', error)
    return { success: false, error: 'Failed to delete message' }
  }
}
