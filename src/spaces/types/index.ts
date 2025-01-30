import type { Channel, Member, Space, User } from '@/payload-types'

// Space types
export type { Space } from '@/payload-types'

// Transformed Space type
export interface TransformedSpace {
  id: string
  name: string
  owner: string | User
  createdBy: string | User
  members?: (string | Member)[]
  channels?: (string | Channel)[]
  createdAt: string
  updatedAt: string
}

// Channel Types
export const ChannelType = {
  TEXT: 'text',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const

export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType]

// Member Roles
export enum MemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
  GUEST = 'guest'
}

// Modal Types
export const ModalType = {
  CREATE_CHANNEL: 'createChannel',
  INVITE_PEOPLE: 'invitePeople',
  EDIT_CHANNEL: 'editChannel',
  MEMBERS: 'members',
  CREATE_SPACE: 'createSpace',
  LEAVE_SPACE: 'leaveSpace',
  DELETE_SPACE: 'deleteSpace',
  DELETE_CHANNEL: 'deleteChannel',
  EDIT_SPACE: 'editSpace',
  MESSAGE_FILE: 'messageFile',
  DELETE_MESSAGE: 'deleteMessage',
} as const

export type ModalType = (typeof ModalType)[keyof typeof ModalType]

// Profile Types
export type Profile = {
  id: string
  name: string
  email: string
  imageUrl?: string | null
  image?: { url: string } | null
  createdAt: string
  updatedAt: string
}

// Extended Types
export type ExtendedMember = Member & {
  profile: Profile
}

export type ExtendedChannel = Channel & {
  type: ChannelType
  spaceId: string
}

export type SpaceWithMembersWithProfiles = Space & {
  members: ExtendedMember[]
  channels: ExtendedChannel[]
}

export type SafeUser = User & {
  id: string
  name: string
  email: string
  imageUrl?: string | null
  image?: { url: string } | null
  createdAt: string
  updatedAt: string
}

export { transformPayloadSpace as transformSpace } from '../utilities/transforms/space'

export interface ModalData {
  channel?: Channel
  channelType?: ChannelType
  space?: Space | TransformedSpace
  spaceId?: string
  apiUrl?: string
  query?: Record<string, any>
  messageId?: string
}
