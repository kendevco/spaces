import { EventEmitter } from 'events'

// Create a singleton instance with consistent state
class MessageEmitterService {
  protected emitter: EventEmitter
  private activeConnections: Map<
    string,
    {
      type: 'message' | 'direct-message'
      lastSeen: number
      cleanup?: () => void
    }
  >
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    this.emitter = new EventEmitter()
    this.emitter.setMaxListeners(100)
    this.activeConnections = new Map()

    // Log status and cleanup stale connections periodically
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      let cleaned = 0

      // Clean up stale connections (older than 2 minutes)
      for (const [id, conn] of Array.from(this.activeConnections.entries())) {
        if (now - conn.lastSeen > 120000) {
          // 2 minutes
          console.log(
            `[EMITTER-SERVER] Connection ${id} last seen ${(now - conn.lastSeen) / 1000}s ago`,
          )
          console.log(`[EMITTER-SERVER] Cleaning up stale connection ${id}`)
          conn.cleanup?.()
          this.activeConnections.delete(id)
          cleaned++
        }
      }

      if (cleaned > 0) {
        console.log(`[EMITTER-SERVER] Cleaned up ${cleaned} stale connections`)
      }

      // Log all active connections and their last seen times
      for (const [id, conn] of Array.from(this.activeConnections.entries())) {
        console.debug(
          `[EMITTER-SERVER] Connection ${id} last active ${(now - conn.lastSeen) / 1000}s ago`,
        )
      }

      console.debug('[EMITTER-SERVER] Status:', {
        activeConnections: this.activeConnections.size,
        messageListeners: this.emitter.listenerCount('message'),
        directMessageListeners: this.emitter.listenerCount('direct-message'),
        connectionTypes: Array.from(this.activeConnections.values()).reduce(
          (acc, { type }) => {
            acc[type] = (acc[type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      })
    }, 30000)
  }

  updateConnectionTimestamp(connectionId: string) {
    const connection = this.activeConnections.get(connectionId)
    if (connection) {
      connection.lastSeen = Date.now()
      this.activeConnections.set(connectionId, connection)
      console.debug(`[EMITTER-SERVER] Updated last seen for connection ${connectionId}`)
    }
  }

  emitMessage(message: any) {
    const wrappedMessage = { type: 'message', message }
    console.debug('[EMITTER-SERVER] Emitting message:', {
      id: message.id,
      type: 'message',
      channel: message.channel?.id,
      content: message.content,
      sender: message.sender?.id,
      activeConnections: this.getConnectionCountByType('message'),
    })

    // Update timestamps for all message connections before emitting
    for (const [id, conn] of Array.from(this.activeConnections.entries())) {
      if (conn.type === 'message') {
        this.updateConnectionTimestamp(id)
      }
    }

    this.emitter.emit('message', wrappedMessage)
  }

  emitDirectMessage(message: any) {
    const wrappedMessage = { type: 'direct-message', message }
    console.log('[EMITTER-SERVER] Emitting direct message:', {
      id: message.id,
      type: 'direct-message',
      conversation: message.conversation,
      content: message.content,
      sender: message.sender?.id,
      activeConnections: this.getConnectionCountByType('direct-message'),
    })

    // Update timestamps for all direct message connections before emitting
    for (const [id, conn] of Array.from(this.activeConnections.entries())) {
      if (conn.type === 'direct-message') {
        this.updateConnectionTimestamp(id)
      }
    }

    this.emitter.emit('direct-message', wrappedMessage)
  }

  private getConnectionCountByType(type: 'message' | 'direct-message'): number {
    return Array.from(this.activeConnections.values()).filter((conn) => conn.type === type).length
  }

  subscribeToMessages(callback: (message: any) => void) {
    const connectionId = Math.random().toString(36).substring(7)
    console.debug(`[EMITTER-SERVER][${connectionId}] New message subscription added`)

    this.activeConnections.set(connectionId, {
      type: 'message',
      lastSeen: Date.now(),
    })
    console.debug(`[EMITTER-SERVER] Active connections: ${this.activeConnections.size}`)

    const wrappedCallback = (data: any) => {
      const connection = this.activeConnections.get(connectionId)
      if (!connection) return

      // Update last seen timestamp
      this.updateConnectionTimestamp(connectionId)

      console.debug(`[EMITTER-SERVER][${connectionId}] Processing message:`, {
        id: data.message?.id,
        type: data.type,
        channel: data.message?.channel?.id,
      })
      callback(data.message)
    }

    this.emitter.on('message', wrappedCallback)

    const cleanup = () => {
      console.debug(`[EMITTER-SERVER][${connectionId}] Message subscription removed`)
      this.activeConnections.delete(connectionId)
      this.emitter.off('message', wrappedCallback)
    }

    // Store cleanup function
    const connection = this.activeConnections.get(connectionId)
    if (connection) {
      connection.cleanup = cleanup
      this.activeConnections.set(connectionId, connection)
    }

    return cleanup
  }

  subscribeToDirectMessages(callback: (message: any) => void) {
    const connectionId = Math.random().toString(36).substring(7)
    console.log(`[EMITTER-SERVER][${connectionId}] Adding direct-message subscription`)

    // Log connection state before adding
    console.log(`[EMITTER-SERVER] Connection state before add:`, {
      activeConnections: this.activeConnections.size,
      connectionTypes: Array.from(this.activeConnections.values()).reduce(
        (acc, { type }) => {
          acc[type] = (acc[type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    })

    this.activeConnections.set(connectionId, {
      type: 'direct-message',
      lastSeen: Date.now(),
    })

    // Log connection state after adding
    console.log(`[EMITTER-SERVER] Connection state after add:`, {
      activeConnections: this.activeConnections.size,
      connectionTypes: Array.from(this.activeConnections.values()).reduce(
        (acc, { type }) => {
          acc[type] = (acc[type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    })

    const wrappedCallback = (data: any) => {
      const connection = this.activeConnections.get(connectionId)
      if (!connection) {
        console.log(`[EMITTER-SERVER][${connectionId}] Connection not found for message:`, {
          messageId: data.message?.id,
          type: data.type,
        })
        return
      }

      // Update last seen timestamp
      this.updateConnectionTimestamp(connectionId)

      console.log(`[EMITTER-SERVER][${connectionId}] Processing direct message:`, {
        id: data.message?.id,
        type: data.type,
        conversation: data.message?.conversation,
        activeConnections: this.activeConnections.size,
      })

      if (!data.message) {
        console.error(`[EMITTER-SERVER][${connectionId}] No message found in data:`, data)
        return
      }

      callback(data.message)
    }

    this.emitter.on('direct-message', wrappedCallback)

    const cleanup = () => {
      console.log(
        `[EMITTER-SERVER][${connectionId}] Running cleanup for direct-message subscription`,
      )

      // Log connection state before cleanup
      console.log(`[EMITTER-SERVER] Connection state before cleanup:`, {
        activeConnections: this.activeConnections.size,
        connectionTypes: Array.from(this.activeConnections.values()).reduce(
          (acc, { type }) => {
            acc[type] = (acc[type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      })

      this.activeConnections.delete(connectionId)
      this.emitter.off('direct-message', wrappedCallback)

      // Log connection state after cleanup
      console.log(`[EMITTER-SERVER] Connection state after cleanup:`, {
        activeConnections: this.activeConnections.size,
        connectionTypes: Array.from(this.activeConnections.values()).reduce(
          (acc, { type }) => {
            acc[type] = (acc[type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      })
    }

    // Store cleanup function
    const connection = this.activeConnections.get(connectionId)
    if (connection) {
      connection.cleanup = cleanup
      this.activeConnections.set(connectionId, connection)
    }

    return cleanup
  }

  getEmitter() {
    return this.emitter
  }
}

// Export singleton instance
const messageEmitterService = new MessageEmitterService()
export default messageEmitterService
