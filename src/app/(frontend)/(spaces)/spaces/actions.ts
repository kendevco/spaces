'use server'

import { cookies } from 'next/headers'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import type { User } from '@/payload-types'

export async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')

  if (!token?.value) {
    return { user: null }
  }

  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({
      headers: new Headers({
        cookie: `payload-token=${token.value}`,
      }),
    })

    return { user }
  } catch (error) {
    console.error('[AUTH] Error:', error)
    return { user: null }
  }
}

export async function getUserSpaces() {
  const { user } = await getAuthenticatedUser()

  if (!user) {
    return { docs: [] }
  }

  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'spaces',
      depth: 2,
      where: {
        or: [
          {
            owner: {
              equals: user.id,
            },
          },
          {
            'members.user': {
              equals: user.id,
            },
          },
        ],
      },
      user,
    })

    return { docs }
  } catch (error) {
    console.error('[SPACES] Error:', error)
    return { docs: [] }
  }
}
