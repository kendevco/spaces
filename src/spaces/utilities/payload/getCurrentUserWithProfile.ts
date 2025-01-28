import { getPayloadClient } from './getPayloadClient'
import type { User } from '@/payload-types'

export async function getCurrentUserWithProfile() {
  try {
    const payload = await getPayloadClient()

    // Get current user using find with auth check
    const { docs } = await payload.find({
      collection: 'users',
      where: {
        auth: {
          exists: true
        }
      },
      limit: 1
    })

    const currentUser = docs[0]
    if (!currentUser) return null

    // Get full user with profile
    const userWithProfile = await payload.findByID({
      collection: 'users',
      id: currentUser.id,
      depth: 2
    })

    return userWithProfile as User | null
  } catch (error) {
    console.error('[GET_CURRENT_USER]', error)
    return null
  }
}
