import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient()
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        {
          errors: [{ message: 'Email and password are required' }],
        },
        { status: 400 },
      )
    }

    try {
      const result = await payload.login({
        collection: 'users',
        data: {
          email,
          password,
        },
      })

      // Return the response with the cookie set
      const response = NextResponse.json({ user: result.user })

      if (result.token) {
        // Set the cookie from the login result
        response.cookies.set('payload-token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        })
      }

      return response
    } catch (loginError: any) {
      console.error('[USERS_LOGIN] Login attempt failed:', loginError.message)
      return NextResponse.json(
        {
          errors: [{ message: 'Invalid email or password' }],
        },
        { status: 401 },
      )
    }
  } catch (error: any) {
    console.error('[USERS_LOGIN] Unexpected error:', error)
    return NextResponse.json(
      {
        errors: [{ message: 'An unexpected error occurred' }],
      },
      { status: 500 },
    )
  }
}
