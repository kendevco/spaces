import { NextResponse } from 'next/server'
import { updateMessage } from '@/spaces/actions/messages'

export async function POST(request: Request) {
  const data = await request.json()
  try {
    const { messageId, content, spaceId, channelId } = data
    // Call your server action method from messages.ts
    const result = await updateMessage({
      messageId,
      content,
      spaceId,
      channelId,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[UPDATE_MESSAGE_ERROR]', error)
    return NextResponse.json({ success: false, error: 'Failed to update message' }, { status: 500 })
  }
}
