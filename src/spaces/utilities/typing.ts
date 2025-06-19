// Utility functions for typing indicator API calls

interface TypingParams {
  chatId: string
  chatType: 'channel' | 'conversation'
  spaceId: string
}

export async function startTyping({ chatId, chatType, spaceId }: TypingParams): Promise<boolean> {
  try {
    const response = await fetch('/api/typing/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        chatId,
        chatType,
        spaceId,
      }),
    })

    if (!response.ok) {
      console.error('[TYPING_API] Failed to start typing:', response.statusText)
      return false
    }

    const result = await response.json()
    console.log('[TYPING_API] Started typing:', result)
    return true
  } catch (error) {
    console.error('[TYPING_API] Error starting typing:', error)
    return false
  }
}

export async function stopTyping({ chatId, chatType, spaceId }: TypingParams): Promise<boolean> {
  try {
    const response = await fetch('/api/typing/stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        chatId,
        chatType,
        spaceId,
      }),
    })

    if (!response.ok) {
      console.error('[TYPING_API] Failed to stop typing:', response.statusText)
      return false
    }

    const result = await response.json()
    console.log('[TYPING_API] Stopped typing:', result)
    return true
  } catch (error) {
    console.error('[TYPING_API] Error stopping typing:', error)
    return false
  }
}

// Debounced typing handler to prevent excessive API calls
export class TypingManager {
  private isTyping = false
  private typingTimeout: NodeJS.Timeout | null = null
  private readonly debounceDelay = 3000 // 3 seconds
  private readonly params: TypingParams

  constructor(params: TypingParams) {
    this.params = params
  }

  async handleTyping(): Promise<void> {
    // If not already typing, start typing
    if (!this.isTyping) {
      this.isTyping = true
      await startTyping(this.params)
    }

    // Clear existing timeout and set new one
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
    }

    this.typingTimeout = setTimeout(async () => {
      if (this.isTyping) {
        this.isTyping = false
        await stopTyping(this.params)
      }
    }, this.debounceDelay)
  }

  async handleStopTyping(): Promise<void> {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
      this.typingTimeout = null
    }

    if (this.isTyping) {
      this.isTyping = false
      await stopTyping(this.params)
    }
  }

  cleanup(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
      this.typingTimeout = null
    }

    if (this.isTyping) {
      this.isTyping = false
      // Fire and forget the stop typing call
      stopTyping(this.params).catch(console.error)
    }
  }
}
