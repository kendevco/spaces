import {
  getPayloadClient,
  getCurrentUser,
  getCurrentUserWithProfile,
  getUserWithProfile,
} from './payload'

import {
  logError,
  logInfo,
  logWarn,
  logDebug,
} from './logging'

export {
  // Payload utilities
  getPayloadClient,
  getCurrentUser,
  getCurrentUserWithProfile,
  getUserWithProfile,

  // Logging utilities
  logError,
  logInfo,
  logWarn,
  logDebug,
}

// Export namespace if needed
export const SpaceUtilities = {
  payload: {
    getPayloadClient,
    getCurrentUser,
    getCurrentUserWithProfile,
    getUserWithProfile,
  },
  logging: {
    logError,
    logInfo,
    logWarn,
    logDebug,
  },
}
