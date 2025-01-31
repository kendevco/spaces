import { cookies, headers } from 'next/headers'
import { getPayloadClient } from './getPayloadClient'
import { User } from '@/payload-types'
import { logError } from '@/spaces/utilities/logging'

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')

    if (!token?.value) {
      return null
    }

    const headersList = new Headers(await headers())
    headersList.set('Authorization', `JWT ${token.value}`)

    const payload = await getPayloadClient()

    try {
      const { user } = await payload.auth({
        headers: headersList,
      })
      return user || null
    } catch (authError: any) {
      // Handle invalid/expired token
      if (authError?.message?.includes('JSON')) {
        cookieStore.delete('payload-token')
      }
      return null
    }
  } catch (error: any) {
    if (!error.message?.includes('No token') && !error.message?.includes('Invalid token')) {
      logError('getCurrentUser', error)
    }
    return null
  }
}
