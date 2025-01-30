import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    try {
      const payload = await getPayloadClient()
      const { user } = await payload.auth({
        headers: new Headers({
          Authorization: `JWT ${token}`,
        }),
      })

      if (!user) {
        return NextResponse.json({ user: null }, { status: 401 })
      }

      return NextResponse.json({ user })
    } catch (authError) {
      console.error('[USERS_ME] Auth error:', authError)
      // Don't expose internal errors, return 401 for auth failures
      return NextResponse.json({ user: null }, { status: 401 })
    }
  } catch (error) {
    console.error('[USERS_ME]', error)
    // Return 401 instead of 500 for auth-related errors
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
