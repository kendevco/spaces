import type { User, Space as PayloadSpace, Media } from '@/payload-types'
import type { ChannelTypes, MemberRoles, MediaCategories, CollectionSlugs } from "../constants"

// Payload relationship type
export interface PayloadRelation<T extends string> {
  relationTo: T
  value: string
}

// Core types
export interface Space {
  id: string
  name: string
  description?: string | null
  icon?: Media | string | null
  owner: string | User
  members?: (string | Member)[]
  channels?: (string | Channel)[]
  createdBy: string | User
  createdAt: string
  updatedAt: string
}

export interface Member {
  id: string
  user: string | User
  space: string | Space
  role: MemberRole
  profile?: Profile | null
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: string
  name: string
  imageUrl: string | null
  email: string
  userId: string
  createdAt: string
  updatedAt: string
}

// Enum types
export type ChannelType = typeof ChannelTypes[keyof typeof ChannelTypes]
export type MemberRole = typeof MemberRoles[keyof typeof MemberRoles]
export type MediaCategory = typeof MediaCategories[keyof typeof MediaCategories]
export type CollectionSlug = typeof CollectionSlugs[keyof typeof CollectionSlugs]

// Message type
export interface Message {
  id: string
  content: {
    root: {
      type: string
      children: Array<{
        type: string
        text?: string
        version: number
        [key: string]: unknown
      }>
      direction: 'ltr' | 'rtl' | null
      format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'
      indent: number
      version: number
    }
  }
  channel: string | Channel
  author: string | User
  attachments?: Array<{
    file?: Media | string | null
    id?: string | null
  }> | null
  createdAt: string
  updatedAt: string
}

// Add a type for Payload's response
export interface PayloadMember extends Omit<Member, 'profile'> {
  profile: Profile | null
  user: User  // In populated response, user is always populated
}

// Add Channel interface
export interface Channel {
  id: string
  name: string
  type: ChannelType
  space: string | Space
  messages?: (string | Message)[]
  createdAt: string
  updatedAt: string
}

// Add SearchResult type
export interface SearchResult {
  id: string
  name: string
  email: string
  imageUrl?: string  // Make imageUrl optional instead of nullable
}
