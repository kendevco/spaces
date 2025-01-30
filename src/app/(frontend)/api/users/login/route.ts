import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient()
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { errors: [{ message: 'Email and password are required' }] },
        { status: 400 },
      )
    }

    try {
      // Attempt login first
      const result = await payload.login({
        collection: 'users',
        data: { email, password },
      })

      // Add success logging
      console.log('[USERS_LOGIN] Login successful for:', email)

      const response = NextResponse.json({ user: result.user })

      if (result.token) {
        response.cookies.set('payload-token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        })
      }

      return response
    } catch (loginError: any) {
      console.error('[USERS_LOGIN] Login attempt failed:', {
        email,
        error: loginError.message,
        stack: loginError.stack,
        code: loginError.code,
      })

      // Handle specific error cases
      if (loginError.message?.includes('credentials')) {
        return NextResponse.json(
          {
            errors: [
              {
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS',
              },
            ],
          },
          { status: 401 },
        )
      }

      if (loginError.message?.includes('not authorized')) {
        return NextResponse.json(
          {
            errors: [
              {
                message: 'Your account is pending authorization. Please contact an administrator.',
                code: 'UNAUTHORIZED_ACCOUNT',
              },
            ],
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          errors: [
            {
              message: loginError.message || 'An unexpected error occurred',
              code: 'AUTH_ERROR',
            },
          ],
        },
        { status: 401 },
      )
    }
  } catch (error: any) {
    console.error('[USERS_LOGIN] Unexpected error:', error)
    return NextResponse.json(
      { errors: [{ message: 'An unexpected error occurred' }] },
      { status: 500 },
    )
  }
}
