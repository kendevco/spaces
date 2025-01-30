import { User as PayloadUser } from '@/payload-types'
import { MemberRole } from '@/spaces/types'

export interface User extends PayloadUser {
  role: MemberRole
  authorized: boolean
}

// Use this type in your Users collection
export type { User as UserType }
