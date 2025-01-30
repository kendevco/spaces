// /app/api/livekit/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get('room')
  const username = req.nextUrl.searchParams.get('username')

  if (!room) {
    return NextResponse.json({ error: 'Missing "room" query parameter' }, { status: 400 })
  } else if (!username) {
    return NextResponse.json({ error: 'Missing "username" query parameter' }, { status: 400 })
  }

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey || !apiSecret || !wsUrl) {
    console.error('[LIVEKIT] Missing environment variables:', {
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      hasWsUrl: !!wsUrl,
    })
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    // Create access token with identity
    const at = new AccessToken(apiKey, apiSecret, { identity: username })

    // Add video grant
    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    })

    // Generate JWT token
    const token = await at.toJwt()

    console.log('[LIVEKIT] Generated token:', {
      room,
      username,
      tokenLength: token.length,
      tokenStart: token.substring(0, 10) + '...',
      wsUrl,
    })

    // Return token as plain text
    return new Response(token, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    console.error('[LIVEKIT] Error generating token:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
