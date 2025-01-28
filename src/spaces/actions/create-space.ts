'use server'

import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { MemberRole } from '@/spaces/types'
import type { Space } from '@/spaces/collections/types'

interface CreateSpaceParams {
  name: string
  imageUrl: string // This is actually the SpacesMedia ID
  userId: string
}

export async function createSpace(params: CreateSpaceParams) {
  try {
    const payload = await getPayloadClient()
    const { name, imageUrl, userId } = params

    // Create space with image relationship
    const newSpace = await payload.create({
      collection: 'spaces',
      data: {
        name,
        owner: userId,
        image: imageUrl, // This is already the SpacesMedia ID from the upload
      },
    })

    // Create member
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    const member = await payload.create({
      collection: 'members',
      data: {
        user: userId,
        email: user.email,
        role: MemberRole.ADMIN,
        space: newSpace.id,
      },
    })

    // Update space with member
    return await payload.update({
      collection: 'spaces',
      id: newSpace.id,
      data: {
        members: [member.id],
      },
    })
  } catch (error) {
    console.error('[CREATE_SPACE_ACTION]', error)
    throw new Error('Failed to create space')
  }
}
