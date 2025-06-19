import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/spaces/utilities/payload/getCurrentUser.server'
import { removeTypingUser, getTypingUsers } from '../store'

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

    // Remove user from typing indicators
    removeTypingUser(chatId, user.id)

    console.log(`[TYPING_STOP] User ${user.id} stopped typing in ${chatType} ${chatId}`)

    return NextResponse.json({
      success: true,
      message: 'Typing stopped',
      typingCount: getTypingUsers(chatId).length,
    })
  } catch (error) {
    console.error('[TYPING_STOP] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}


