import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get token from cookie
  const token = request.cookies.get('payload-token')?.value

  // If accessing spaces routes without a token, redirect to login
  if (request.nextUrl.pathname.startsWith('/spaces') && !token) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle other routes normally
  if (request.nextUrl.pathname === '/sign-in') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Skip middleware for admin routes completely
export const config = {
  matcher: [
    // Skip admin routes completely, but include spaces routes
    '/((?!admin|api|_next/static|_next/image|favicon.ico).*)',
    '/spaces/:path*',
  ],
}
