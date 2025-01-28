// Debug levels for different types of messages
export type DebugLevel = 'info' | 'warn' | 'error' | 'debug'

interface DebugMessage {
  stage: string
  details: any
  level?: DebugLevel
  component?: string
  connectionId?: string
}

// Enable debug mode based on environment or localStorage
const isDebugMode = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('SPACES_DEBUG') === 'true'
  }
  return process.env.NODE_ENV === 'development'
}

export const debugMessage = ({
  stage,
  details,
  level = 'debug',
  component = 'SSE',
  connectionId,
}: DebugMessage) => {
  if (!isDebugMode()) return

  const timestamp = new Date().toISOString()
  const prefix = `[${component}][${timestamp}]${connectionId ? `[${connectionId}]` : ''}`
  const message = `${prefix} ${stage}`

  switch (level) {
    case 'error':
      console.error(message, details)
      break
    case 'warn':
      console.warn(message, details)
      break
    case 'info':
      console.info(message, details)
      break
    default:
      console.debug(message, details)
  }

  // If we have Redux DevTools or another debug extension, we could log there too
  if (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    ;(window as any).__REDUX_DEVTOOLS_EXTENSION__.send(
      {
        type: `${component}/${stage}`,
        payload: details,
      },
      undefined,
    )
  }
}

// Helper to start debug mode
export const enableDebug = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('SPACES_DEBUG', 'true')
    console.log('🔍 Spaces debug mode enabled')
  }
}

// Helper to stop debug mode
export const disableDebug = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('SPACES_DEBUG')
    console.log('🔍 Spaces debug mode disabled')
  }
}

// Track message lifecycle
interface MessageLifecycle {
  id: string
  stages: Array<{
    stage: string
    timestamp: number
    details?: any
  }>
}

const messageLifecycles = new Map<string, MessageLifecycle>()

export const trackMessage = (messageId: string, stage: string, details?: any) => {
  if (!isDebugMode()) return

  let lifecycle = messageLifecycles.get(messageId)
  if (!lifecycle) {
    lifecycle = {
      id: messageId,
      stages: [],
    }
    messageLifecycles.set(messageId, lifecycle)
  }

  lifecycle.stages.push({
    stage,
    timestamp: Date.now(),
    details,
  })

  debugMessage({
    stage: `Message Lifecycle: ${stage}`,
    details: {
      messageId,
      lifecycle: lifecycle.stages,
      ...details,
    },
    component: 'MessageTracker',
  })
}

// Get the full lifecycle of a message
export const getMessageLifecycle = (messageId: string) => {
  return messageLifecycles.get(messageId)
}

// Clear old message lifecycles (call periodically)
export const cleanupMessageLifecycles = () => {
  const maxAge = 5 * 60 * 1000 // 5 minutes
  const now = Date.now()

  messageLifecycles.forEach((lifecycle, id) => {
    const lastStage = lifecycle.stages[lifecycle.stages.length - 1]
    if (!lastStage) return
    if (now - lastStage.timestamp > maxAge) {
      messageLifecycles.delete(id)
    }
  })
}
