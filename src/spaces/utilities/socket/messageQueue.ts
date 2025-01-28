import { Message, DirectMessage } from '@/payload-types'

type QueuedMessage = {
  message: Message | DirectMessage
  timestamp: number
  channelId?: string
  conversationId?: string
}

type MessageHandler = (message: Message | DirectMessage) => void

class MessageQueue {
  private messages: QueuedMessage[] = []
  private subscribers = new Map<string, Set<MessageHandler>>()
  private readonly maxSize = 100
  private readonly maxAge = 5 * 60 * 1000 // 5 minutes

  private getSubscriberKey(channelId?: string, conversationId?: string) {
    return `${channelId || ''}-${conversationId || ''}`
  }

  subscribe(
    channelId: string | undefined,
    conversationId: string | undefined,
    handler: MessageHandler,
  ) {
    const key = this.getSubscriberKey(channelId, conversationId)
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key)?.add(handler)
  }

  unsubscribe(
    channelId: string | undefined,
    conversationId: string | undefined,
    handler?: MessageHandler,
  ) {
    const key = this.getSubscriberKey(channelId, conversationId)
    if (handler) {
      this.subscribers.get(key)?.delete(handler)
    } else {
      this.subscribers.delete(key)
    }
  }

  enqueue(message: Message | DirectMessage, channelId?: string, conversationId?: string) {
    // Remove old messages
    const now = Date.now()
    this.messages = this.messages.filter((m) => now - m.timestamp < this.maxAge)

    // Add new message
    this.messages.push({
      message,
      timestamp: now,
      channelId,
      conversationId,
    })

    // Maintain max size
    if (this.messages.length > this.maxSize) {
      this.messages = this.messages.slice(-this.maxSize)
    }

    // Notify subscribers
    const key = this.getSubscriberKey(channelId, conversationId)
    this.subscribers.get(key)?.forEach((handler) => handler(message))
  }

  getMessages(channelId?: string, conversationId?: string, since?: number) {
    return this.messages
      .filter((m) => {
        if (since && m.timestamp < since) return false
        if (channelId && m.channelId !== channelId) return false
        if (conversationId && m.conversationId !== conversationId) return false
        return true
      })
      .map((m) => m.message)
  }

  // Cleanup old messages periodically
  startCleanup() {
    setInterval(() => {
      const now = Date.now()
      this.messages = this.messages.filter((m) => now - m.timestamp < this.maxAge)
    }, 60000) // Run every minute
  }
}

// Create a singleton instance
export const messageQueue = new MessageQueue()
messageQueue.startCleanup()
