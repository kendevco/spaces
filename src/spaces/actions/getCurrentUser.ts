'use server'

import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import type { User } from '@/payload-types'

export async function getCurrentUser(): Promise<User | null> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'users',
      limit: 1,
      depth: 2
    })
    return docs[0] || null
  } catch (error) {
    console.error('[GET_CURRENT_USER]', error)
    return null
  }
}
