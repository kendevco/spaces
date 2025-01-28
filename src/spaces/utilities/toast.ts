import { toast as payloadToast } from '@payloadcms/ui'

export const toast = {
  success: (message: string) => {
    payloadToast.success(message)
  },
  error: (message: string) => {
    payloadToast.error(message)
  },
  info: (message: string) => {
    payloadToast.info(message)
  },
  warning: (message: string) => {
    payloadToast.warning(message)
  }
}
