import type { Access } from 'payload'
import type { User } from '@/payload-types'
import { MemberRole } from '@/spaces/types'

// For Payload access control
export const isAdmin: Access = async ({ req: { user } }) => {
  if (!user) return false
  return user.role === MemberRole.ADMIN
}

// For direct user checks
export const isUserAdmin = async (user: User | null) => {
  if (!user) return false
  return user.role === MemberRole.ADMIN
}
