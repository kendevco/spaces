'use server'

import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { revalidatePath } from 'next/cache'
import { CollectionSlugs } from '@/spaces/types'

export async function updateSpace(spaceId: string, data: { name: string; image: string }) {
  try {
    const payload = await getPayloadClient()

    await payload.update({
      collection: CollectionSlugs.SPACES,
      id: spaceId,
      data: {
        name: data.name,
        image: data.image,
      },
    })

    revalidatePath('/spaces')
    return { success: true }
  } catch (error) {
    console.error('Error updating space:', error)
    return { success: false, error: 'Failed to update space' }
  }
}

export async function createSpace(data: { name: string; image: string; userId: string }) {
  try {
    const payload = await getPayloadClient()

    const space = await payload.create({
      collection: CollectionSlugs.SPACES,
      data: {
        name: data.name,
        image: data.image,
        owner: data.userId,
      },
    })

    revalidatePath('/spaces')
    return { success: true, spaceId: space.id }
  } catch (error) {
    console.error('Error creating space:', error)
    return { success: false, error: 'Failed to create space' }
  }
}

export async function deleteSpace(spaceId: string) {
  try {
    const payload = await getPayloadClient()

    await payload.delete({
      collection: CollectionSlugs.SPACES,
      id: spaceId,
    })

    revalidatePath('/spaces')
    return { success: true }
  } catch (error) {
    console.error('Error deleting space:', error)
    return { success: false, error: 'Failed to delete space' }
  }
}

export async function getSpaceData(spaceId: string) {
  try {
    const payload = await getPayloadClient()
    const space = await payload.findByID({
      collection: CollectionSlugs.SPACES,
      id: spaceId,
      depth: 2,
    })

    if (!space) {
      return { success: false, error: 'Space not found' }
    }

    const members = await payload.find({
      collection: CollectionSlugs.MEMBERS,
      where: {
        space: {
          equals: spaceId,
        },
      },
      depth: 2,
    })

    const channels = await payload.find({
      collection: CollectionSlugs.CHANNELS,
      where: {
        space: {
          equals: spaceId,
        },
      },
      depth: 1,
    })

    return {
      success: true,
      space,
      members: members.docs,
      channels: channels.docs,
    }
  } catch (error) {
    console.error('[GET_SPACE_DATA]', error)
    return { success: false, error: 'Failed to fetch space data' }
  }
}
