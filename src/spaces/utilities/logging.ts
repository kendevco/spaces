type LogLevel = 'info' | 'error' | 'warn' | 'debug'

interface LogContext {
  [key: string]: any
}

const formatMessage = (
  level: LogLevel,
  service: string,
  message: string,
  context?: LogContext
) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    ...(context && { context }),
  }
}

export const logInfo = (service: string, message: string, context?: LogContext) => {
  const logData = formatMessage('info', service, message, context)
  if (process.env.NODE_ENV === 'development') {
    console.log(JSON.stringify(logData, null, 2))
  }
}

export const logError = (context: string, error: any) => {
  console.error(`[${context.toUpperCase()}_ERROR]`, {
    message: error.message,
    stack: error.stack,
    details: error.details || error.response?.data,
    timestamp: new Date().toISOString(),
  })
}

export const logWarn = (service: string, message: string, context?: LogContext) => {
  const logData = formatMessage('warn', service, message, context)
  console.warn(JSON.stringify(logData, null, 2))
}

export const logDebug = (service: string, message: string, context?: LogContext) => {
  if (process.env.NODE_ENV === 'development') {
    const logData = formatMessage('debug', service, message, context)
    console.debug(JSON.stringify(logData, null, 2))
  }
}
