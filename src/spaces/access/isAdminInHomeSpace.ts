import type { User } from '@/payload-types'
import { getPayloadClient } from '../utilities/payload/getPayloadClient'

export async function isAdminInHomeSpace(user: User): Promise<boolean> {
  if (!user) return false

  try {
    const payload = await getPayloadClient()

    const membersResponse = await payload.find({
      collection: 'members',
      where: {
        and: [
          {
            user: {
              equals: user.id
            }
          },
          {
            role: {
              equals: 'admin'
            }
          }
        ]
      },
      depth: 1
    })

    return membersResponse.docs.length > 0
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
