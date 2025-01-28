export const CollectionSlugs = {
  USERS: 'users',
  MEDIA: 'media',
  SPACES: 'spaces',
  CHANNELS: 'channels',
  MEMBERS: 'members',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  DIRECT_MESSAGES: 'direct-messages',
  PROFILES: 'profiles',
  SPACES_MEDIA: 'spaces-media',
} as const

export type CollectionSlug = (typeof CollectionSlugs)[keyof typeof CollectionSlugs]
