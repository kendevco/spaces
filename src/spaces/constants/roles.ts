export const MemberRoles = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
} as const

export type MemberRole = (typeof MemberRoles)[keyof typeof MemberRoles]

// Role permissions map (if needed)
export const rolePermissions = {
  [MemberRoles.ADMIN]: ['manage', 'write', 'read'],
  [MemberRoles.MODERATOR]: ['write', 'read'],
  [MemberRoles.MEMBER]: ['write', 'read'],
} as const
