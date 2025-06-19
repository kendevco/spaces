import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')

    if (!token?.value) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { user } = await payload.auth({
      headers: new Headers({
        cookie: `payload-token=${token.value}`,
      }),
    })

    if (!user) {
      return new NextResponse('Invalid token', { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.log('[AUTH_SESSION]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
