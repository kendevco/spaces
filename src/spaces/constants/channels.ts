export const ChannelTypes = {
  TEXT: 'text',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const

export type ChannelType = (typeof ChannelTypes)[keyof typeof ChannelTypes]

// Icon map for channel types (if needed)
export const channelIconMap = {
  [ChannelTypes.TEXT]: 'hash',
  [ChannelTypes.AUDIO]: 'mic',
  [ChannelTypes.VIDEO]: 'video',
} as const
