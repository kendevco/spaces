// Shared typing store for SSE and API endpoints
// In production, this would be Redis or similar distributed store

export interface TypingUser {
  userId: string
  timestamp: number
  userName: string
}

export type TypingStore = Map<string, Map<string, TypingUser>>

// Global typing store instance
export const typingStore: TypingStore = new Map()

// Helper functions for typing store management
export function addTypingUser(chatId: string, userId: string, userName: string): void {
  if (!typingStore.has(chatId)) {
    typingStore.set(chatId, new Map())
  }

  const chatTyping = typingStore.get(chatId)!
  chatTyping.set(userId, {
    userId,
    timestamp: Date.now(),
    userName,
  })
}

export function removeTypingUser(chatId: string, userId: string): void {
  const chatTyping = typingStore.get(chatId)
  if (chatTyping) {
    chatTyping.delete(userId)

    // Clean up empty maps
    if (chatTyping.size === 0) {
      typingStore.delete(chatId)
    }
  }
}

export function getTypingUsers(chatId: string, excludeUserId?: string): TypingUser[] {
  const chatTyping = typingStore.get(chatId)
  if (!chatTyping) return []

  return Array.from(chatTyping.values()).filter((user) =>
    excludeUserId ? user.userId !== excludeUserId : true,
  )
}

export function cleanupStaleTyping(maxAge: number = 10000): void {
  const now = Date.now()

  // Convert Map entries to array for compatibility
  const chatEntries = Array.from(typingStore.entries())

  for (const [chatId, chatTyping] of chatEntries) {
    const userEntries = Array.from(chatTyping.entries())

    for (const [userId, userData] of userEntries) {
      if (now - userData.timestamp > maxAge) {
        chatTyping.delete(userId)
      }
    }

    // Clean up empty chat maps
    if (chatTyping.size === 0) {
      typingStore.delete(chatId)
    }
  }
}
