import { AccessToken } from 'livekit-server-sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const room = searchParams.get('room')
  const username = searchParams.get('username')

  if (!room || !username) {
    return NextResponse.json(
      { error: 'Missing room or username' },
      { status: 400 }
    )
  }

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'LiveKit credentials not configured' },
      { status: 500 }
    )
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    name: username,
  })

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  })

  return NextResponse.json({ token: at.toJwt() })
}
