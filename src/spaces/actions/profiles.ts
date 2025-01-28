'use server'

import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { revalidatePath } from 'next/cache'
import { CollectionSlugs } from '@/spaces/types'

export async function updateProfile(profileId: string, data: { name: string; imageUrl: string }) {
  try {
    const payload = await getPayloadClient()

    await payload.update({
      collection: CollectionSlugs.PROFILES,
      id: profileId,
      data: {
        name: data.name,
      },
    })

    revalidatePath('/spaces')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

export async function getProfile(userId: string) {
  try {
    const payload = await getPayloadClient()

    const profile = await payload.findByID({
      collection: CollectionSlugs.PROFILES,
      id: userId,
    })

    return { success: true, profile }
  } catch (error) {
    console.error('Error getting profile:', error)
    return { success: false, error: 'Failed to get profile' }
  }
}
