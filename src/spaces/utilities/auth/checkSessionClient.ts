import type { User } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'
import { getCookie } from 'cookies-next'

// Create a simple cache for the client side
let cachedUser: { user: User | null; timestamp: number } | null = null
const CACHE_DURATION = 30 * 1000 // 30 seconds in milliseconds

export async function checkSessionClient(): Promise<{
  user: User | null
  error?: Error
}> {
  try {
    // Check cache first
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_DURATION) {
      return { user: cachedUser.user }
    }

    const token = getCookie('payload-token')
    if (!token) {
      cachedUser = { user: null, timestamp: Date.now() }
      return { user: null }
    }

    const res = await fetch(`${getClientSideURL()}/api/auth/session`, {
      headers: {
        'Content-Type': 'application/json',
        cookie: `payload-token=${token}`,
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      if (res.status === 401) {
        cachedUser = { user: null, timestamp: Date.now() }
        return { user: null }
      }
      throw new Error('Failed to fetch session')
    }

    const user = await res.json()

    // Update cache
    cachedUser = { user, timestamp: Date.now() }
    return { user }
  } catch (error) {
    console.error('[CHECK_SESSION_CLIENT]', error)
    return { user: null, error: error as Error }
  }
}
