import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const headersList = new Headers(await headers())
    headersList.set('Content-Type', 'text/event-stream')
    headersList.set('Connection', 'keep-alive')
    headersList.set('Cache-Control', 'no-cache, no-transform')
    headersList.set('X-Accel-Buffering', 'no')

    // Return a single health check message
    return new NextResponse(
      `data: ${JSON.stringify({ type: 'health', status: 'connected' })}\n\n`,
      {
        headers: headersList,
      },
    )
  } catch (error) {
    console.error('[MESSAGES_SSE_HEALTH] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
