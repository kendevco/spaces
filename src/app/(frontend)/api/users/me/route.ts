import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const payload = await getPayloadClient()
    const { user } = await payload.auth({
      headers: new Headers({
        Authorization: `JWT ${token}`,
      }),
    })

    if (!user) {
      return new NextResponse('Invalid token', { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[USERS_ME]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
