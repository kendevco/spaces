import { cookies, headers } from 'next/headers'
import { getPayloadClient } from './getPayloadClient'
import { User } from '@/payload-types'
import { logError } from '@/spaces/utilities/logging'

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')

    if (!token) {
      logError('getCurrentUser', 'No token found')
      return null
    }

    const headersList = new Headers(await headers())
    headersList.set('Authorization', `JWT ${token.value}`)

    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      logError('getCurrentUser', 'No user found with token')
      return null
    }

    return user
  } catch (error) {
    logError('getCurrentUser', error)
    return null
  }
}
