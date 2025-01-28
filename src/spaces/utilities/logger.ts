export const logError = (context: string, error: any, additionalInfo?: any) => {
  console.error(`[${context}] Error:`, {
    error: error?.message || error,
    stack: error?.stack,
    ...additionalInfo
  })
}

export const logInfo = (context: string, message: string, additionalInfo?: any) => {
  console.log(`[${context}] Info:`, message, additionalInfo || '')
}

export const logWarning = (context: string, message: string, additionalInfo?: any) => {
  console.warn(`[${context}] Warning:`, message, additionalInfo || '')
}

export const logDebug = (context: string, message: string, additionalInfo?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[${context}] Debug:`, message, additionalInfo || '')
  }
} 