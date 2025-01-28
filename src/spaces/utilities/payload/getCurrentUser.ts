import type { User } from '@/payload-types'
import { cookies } from 'next/headers'
import { getClientSideURL } from '@/utilities/getURL'

export async function getCurrentUser(args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  user: User | null
  token: string | null
}> {
  try {
    const { nullUserRedirect, validUserRedirect } = args || {}
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return { user: null, token: null }
    }

    const meUserReq = await fetch(`${getClientSideURL()}/api/users/me`, {
      headers: {
        Authorization: `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (!meUserReq.ok) {
      return { user: null, token: null }
    }

    const data = await meUserReq.json()
    const user = data.user || data.doc || data

    if (!user?.id) {
      return { user: null, token: null }
    }

    return { user, token }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { user: null, token: null }
  }
}

// Alias for server components that need user data
export const getCurrentUserServer = getCurrentUser
