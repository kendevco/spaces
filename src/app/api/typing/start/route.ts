import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/spaces/utilities/payload/getCurrentUser.server'
import { addTypingUser, getTypingUsers } from '../store'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { chatId, chatType, spaceId } = body

    if (!chatId || !chatType || !spaceId) {
      return new NextResponse('Bad request - Missing required fields', { status: 400 })
    }

    // Add user to typing indicators
    const userName = user.name || user.email || 'Unknown User'
    addTypingUser(chatId, user.id, userName)

    console.log(`[TYPING_START] User ${user.id} started typing in ${chatType} ${chatId}`)

    return NextResponse.json({
      success: true,
      message: 'Typing started',
      typingCount: getTypingUsers(chatId).length,
    })
  } catch (error) {
    console.error('[TYPING_START] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
