import { toast as payloadToast } from '@payloadcms/ui'
import { track } from '../analytics'

export const toast = {
  success: (message: string, eventName?: string) => {
    if (eventName) {
      track(eventName)
    }
    payloadToast.success(message)
  },
  error: (message: string, eventName?: string) => {
    if (eventName) {
      track(eventName)
    }
    payloadToast.error(message)
  },
  info: (message: string, eventName?: string) => {
    if (eventName) {
      track(eventName)
    }
    payloadToast.info(message)
  },
  warning: (message: string, eventName?: string) => {
    if (eventName) {
      track(eventName)
    }
    payloadToast.warning(message)
  },
  promise: async <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    },
    eventName?: string
  ) => {
    if (eventName) {
      track(eventName)
    }

    return payloadToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    })
  }
}
