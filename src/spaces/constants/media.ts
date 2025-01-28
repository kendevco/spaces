export const MediaCategories = {
  SPACE: 'space',
  PROFILE: 'profile',
  MESSAGE: 'message',
  CHANNEL: 'channel',
} as const


export type MediaCategory = (typeof MediaCategories)[keyof typeof MediaCategories]
