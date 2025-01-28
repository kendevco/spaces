export const ChannelTypes = {
  TEXT: 'text',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const;

export type ChannelType = typeof ChannelTypes[keyof typeof ChannelTypes];
