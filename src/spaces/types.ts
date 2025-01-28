import type { Channel, Member as PayloadMember, Space, User } from '@/payload-types'

export type { PayloadMember as Member }

// Auth types
export interface AuthUser extends User {
  imageUrl: string | null
  profile?: {
    id: string
    firstName: string
    lastName: string
    name: string
    imageUrl: string | null
    email: string
    role: MemberRole
  }
}

// Media types
export const MediaCategory = {
  PROFILE: 'profile',
  SPACE: 'space',
  MESSAGE: 'message',
} as const

export type MediaCategory = (typeof MediaCategory)[keyof typeof MediaCategory]

export const MEDIA_CATEGORIES = {
  [MediaCategory.PROFILE]: MediaCategory.PROFILE,
  [MediaCategory.SPACE]: MediaCategory.SPACE,
  [MediaCategory.MESSAGE]: MediaCategory.MESSAGE,
} as const

export type MediaCategoryKey = keyof typeof MEDIA_CATEGORIES

// Channel types
export const ChannelType = {
  TEXT: 'text',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const

export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType]

// Member types
export const MemberRole = {
  ADMIN: 'admin',
  GUEST: 'guest',
  MODERATOR: 'moderator',
  MEMBER: 'member',
} as const

export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole]

export type Profile = {
  id: string
  name: string
  email: string
  imageUrl?: string | null
  image?: { url: string } | null
  createdAt: string
  updatedAt: string
}

export type ExtendedMember = PayloadMember & {
  profile: Profile
}

export type ExtendedChannel = Channel & {
  type: ChannelType
  spaceId: string
}

// Modal types
export const ModalType = {
  CREATE_SPACE: 'createSpace',
  EDIT_SPACE: 'editSpace',
  DELETE_SPACE: 'deleteSpace',
  LEAVE_SPACE: 'leaveSpace',
  INVITE: 'invite',
  MEMBERS: 'members',
  CREATE_CHANNEL: 'createChannel',
  EDIT_CHANNEL: 'editChannel',
  DELETE_CHANNEL: 'deleteChannel',
  MESSAGE_FILE: 'messageFile',
  DELETE_MESSAGE: 'deleteMessage',
} as const

export type ModalType = (typeof ModalType)[keyof typeof ModalType]

export interface ModalData {
  space?: Space
  channel?: Channel
  spaceId?: string
  channelId?: string
  apiUrl?: string
  query?: Record<string, any>
  channelType?: ChannelType
}

export interface ModalStore {
  type: ModalType | null
  data: ModalData
  isOpen: boolean
  onOpen: (type: ModalType, data?: ModalData) => void
  onClose: () => void
}

// Collection slugs
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
