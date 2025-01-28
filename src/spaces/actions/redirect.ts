'use server'

import { getPayloadClient } from '../utilities/payload/getPayloadClient'
import { CollectionSlugs } from '../types'
import type { Channel } from '@/payload-types'
import { getCurrentUser } from '../utilities/payload/getCurrentUser'

export async function getSpaceRedirect(userId: string) {
  try {
    // First verify the current user matches the requested userId
    const { user: currentUser } = await getCurrentUser()
    if (!currentUser?.id || currentUser.id !== userId) {
      console.error('[GET_SPACE_REDIRECT] User ID mismatch or not authenticated')
      return { success: false, error: 'Unauthorized' }
    }

    const payload = await getPayloadClient()
    const spaces = await payload.find({
      collection: CollectionSlugs.SPACES,
      where: {
        'members.user.id': {
          equals: userId,
        },
      },
      depth: 2,
      user: currentUser,
    })

    if (spaces.docs?.[0]) {
      const space = spaces.docs[0]
      const channels = space.channels || []
      const generalChannel = channels.find(
        (channel): channel is Channel & { id: string } =>
          typeof channel !== 'string' && channel.name === 'general' && 'id' in channel,
      )

      if (generalChannel) {
        return {
          success: true,
          redirectUrl: `/spaces/${space.id}/channels/${generalChannel.id}`,
        }
      }
    }

    return { success: false }
  } catch (error) {
    console.error('[GET_SPACE_REDIRECT]', error)
    return { success: false }
  }
}
