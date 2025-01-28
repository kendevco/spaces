'use client'

import { track } from '@/spaces/utilities/analytics'

export const useAnalytics = () => {
  const trackEvent = (event: string, properties?: Record<string, any>) => {
    track(event, properties)
  }

  return { trackEvent }
}
