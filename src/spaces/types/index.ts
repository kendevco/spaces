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

// Member Roles - Enhanced role hierarchy for multi-tenant system
export enum MemberRole {
  // Global/Host level roles
  HOST_USER = 'host_user', // Host server user (highest level)

  // Space level roles
  SPACE_ADMIN = 'space_admin', // Space owner/administrator
  SPACE_USER = 'space_user', // Space employee/team member
  SPACE_CLIENT = 'space_client', // Space client/customer

  // Legacy/backward compatibility roles
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
  GUEST = 'guest',
}

// Role hierarchy and permissions mapping
export const RoleHierarchy = {
  [MemberRole.HOST_USER]: 100,
  [MemberRole.SPACE_ADMIN]: 80,
  [MemberRole.ADMIN]: 70,
  [MemberRole.MODERATOR]: 60,
  [MemberRole.SPACE_USER]: 50,
  [MemberRole.MEMBER]: 40,
  [MemberRole.SPACE_CLIENT]: 30,
  [MemberRole.GUEST]: 10,
} as const

// Role permissions
export const RolePermissions = {
  [MemberRole.HOST_USER]: {
    canManageServer: true,
    canManageAllSpaces: true,
    canInviteUsers: true,
    canDeleteSpaces: true,
    canEditChannels: true,
    canOverrideWorkflow: true,
  },
  [MemberRole.SPACE_ADMIN]: {
    canManageServer: false,
    canManageAllSpaces: false,
    canManageSpace: true,
    canInviteUsers: true,
    canDeleteChannels: true,
    canEditChannels: true,
    canOverrideWorkflow: true,
  },
  [MemberRole.SPACE_USER]: {
    canManageServer: false,
    canManageAllSpaces: false,
    canManageSpace: false,
    canInviteUsers: true,
    canDeleteChannels: false,
    canEditChannels: false,
    canOverrideWorkflow: false,
  },
  [MemberRole.SPACE_CLIENT]: {
    canManageServer: false,
    canManageAllSpaces: false,
    canManageSpace: false,
    canInviteUsers: false,
    canDeleteChannels: false,
    canEditChannels: false,
    canOverrideWorkflow: false,
  },
  // Legacy role permissions
  [MemberRole.ADMIN]: {
    canManageServer: false,
    canManageAllSpaces: false,
    canManageSpace: true,
    canInviteUsers: true,
    canDeleteChannels: true,
    canEditChannels: true,
    canOverrideWorkflow: true,
  },
  [MemberRole.MODERATOR]: {
    canManageServer: false,
    canManageAllSpaces: false,
    canManageSpace: false,
    canInviteUsers: true,
    canDeleteChannels: false,
    canEditChannels: true,
    canOverrideWorkflow: false,
  },
  [MemberRole.MEMBER]: {
    canManageServer: false,
    canManageAllSpaces: false,
    canManageSpace: false,
    canInviteUsers: false,
    canDeleteChannels: false,
    canEditChannels: false,
    canOverrideWorkflow: false,
  },
  [MemberRole.GUEST]: {
    canManageServer: false,
    canManageAllSpaces: false,
    canManageSpace: false,
    canInviteUsers: false,
    canDeleteChannels: false,
    canEditChannels: false,
    canOverrideWorkflow: false,
  },
} as const

// Modal Types
export const ModalType = {
  CREATE_CHANNEL: 'createChannel',
  INVITE_PEOPLE: 'invitePeople',
  INVITE: 'invite',
  EDIT_CHANNEL: 'editChannel',
  MEMBERS: 'members',
  CREATE_SPACE: 'createSpace',
  LEAVE_SPACE: 'leaveSpace',
  DELETE_SPACE: 'deleteSpace',
  DELETE_CHANNEL: 'deleteChannel',
  EDIT_SPACE: 'editSpace',
  MESSAGE_FILE: 'messageFile',
  DELETE_MESSAGE: 'deleteMessage',
  IMAGE_VIEWER: 'imageViewer',
  // New modal types for enhanced functionality
  MANAGE_USERS: 'manageUsers',
  CHANNEL_SETTINGS: 'channelSettings',
  WORKFLOW_OVERRIDE: 'workflowOverride',
  INVITE_EMAIL: 'inviteEmail',
  USER_PROFILE: 'userProfile',
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

// Utility functions for role management
export const hasPermission = (
  userRole: MemberRole,
  permission: keyof (typeof RolePermissions)[MemberRole],
) => {
  return RolePermissions[userRole]?.[permission] || false
}

export const canUserPerformAction = (
  userRole: MemberRole,
  targetRole: MemberRole,
  action: string,
) => {
  const userLevel = RoleHierarchy[userRole] || 0
  const targetLevel = RoleHierarchy[targetRole] || 0

  // Users can only manage users with lower hierarchy levels
  return userLevel > targetLevel
}

export const getRoleDisplayName = (role: MemberRole): string => {
  const roleNames = {
    [MemberRole.HOST_USER]: 'Host User',
    [MemberRole.SPACE_ADMIN]: 'Space Admin',
    [MemberRole.SPACE_USER]: 'Space User',
    [MemberRole.SPACE_CLIENT]: 'Space Client',
    [MemberRole.ADMIN]: 'Admin',
    [MemberRole.MODERATOR]: 'Moderator',
    [MemberRole.MEMBER]: 'Member',
    [MemberRole.GUEST]: 'Guest',
  }
  return roleNames[role] || 'Unknown'
}

export const getRoleColor = (role: MemberRole): string => {
  const colors = {
    [MemberRole.HOST_USER]: 'text-purple-500',
    [MemberRole.SPACE_ADMIN]: 'text-red-500',
    [MemberRole.SPACE_USER]: 'text-blue-500',
    [MemberRole.SPACE_CLIENT]: 'text-green-500',
    [MemberRole.ADMIN]: 'text-red-400',
    [MemberRole.MODERATOR]: 'text-blue-400',
    [MemberRole.MEMBER]: 'text-gray-400',
    [MemberRole.GUEST]: 'text-gray-500',
  }
  return colors[role] || 'text-gray-400'
}
