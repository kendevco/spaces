'use server'

import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import type { Space } from '@/payload-types'

export type CreateSpaceData = {
  name: string
  icon?: string | null
  description?: string | null
  userId: string
}

export async function createSpace(data: CreateSpaceData) {
  try {
    const payload = await getPayloadClient()

    const space = await payload.create({
      collection: 'spaces',
      data: {
        name: data.name,
        image: data.icon || null,
        owner: data.userId,
        members: [],
        channels: [],
      },
    })

    return {
      success: true,
      data: space,
    }
  } catch (error) {
    console.error('[CREATE_SPACE_ERROR]', error)
    return {
      success: false,
      error: 'Failed to create space',
    }
  }
}
