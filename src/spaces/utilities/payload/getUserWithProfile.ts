import { getPayloadClient } from './getPayloadClient'
import { User } from '@/payload-types'

export async function getUserWithProfile(userId: string): Promise<User | null> {
  try {
    const payload = await getPayloadClient()

    const user = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 2,
    })

    return user
  } catch (error) {
    console.error('Error getting user with profile:', error)
    return null
  }
}
