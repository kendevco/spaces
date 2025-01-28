import type { User } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'
import { cache } from 'react'

// Cache the session check for 30 seconds
export const checkSession = cache(async (): Promise<User | null> => {
  try {
    const res = await fetch(`${getClientSideURL()}/api/users/me`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 30, // Revalidate every 30 seconds
        tags: ['session'],
      },
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data.user || data.doc || null
  } catch (error) {
    console.log('[CHECK_SESSION]', error)
    return null
  }
})
