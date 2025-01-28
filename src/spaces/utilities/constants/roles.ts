export const MemberRoles = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export type MemberRole = typeof MemberRoles[keyof typeof MemberRoles];
