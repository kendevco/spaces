import { cookies } from 'next/headers'
import { getPayloadClient } from '@/spaces/utilities/payload'
import { redirect } from 'next/navigation'

export async function getAuthenticatedPayload() {
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get('payload-token')

    if (!tokenCookie?.value) {
      console.log('No token found, redirecting to login')
      redirect('/login')
    }

    // Get Payload instance
    const payload = await getPayloadClient()

    try {
      // Authenticate using the token
      const { user } = await payload.auth({
        headers: new Headers({
          Authorization: `JWT ${tokenCookie.value}`,
        }),
      })

      if (!user?.id) {
        console.error('Invalid user data received:', user)
        throw new Error('Invalid token: no user data')
      }

      return payload
    } catch (error) {
      // Token is invalid or expired
      console.error('Auth error:', error)
      redirect('/login')
    }
  } catch (error) {
    console.error('Payload client error:', error)
    redirect('/login')
  }
}
