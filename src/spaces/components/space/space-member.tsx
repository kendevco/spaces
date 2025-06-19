// path: src/components/Spaces/Space/space-member.tsx
'use client'

import { cn } from '@/utilities/cn'
import { Member, Profile, Space } from '@/payload-types'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { track } from '@vercel/analytics'
import { MemberRole } from '@/spaces/types'
import { toast } from '@/spaces/utilities/toast'
import { getGravatarUrlOrNull } from '@/spaces/utilities/gravatar'

interface SpaceMemberProps {
  member: Member & {
    profile: Profile & {
      imageUrl?: string | null
      image?: { url: string } | null
    }
  }
  spaceId: string
}

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 text-rose-500" />,
  [MemberRole.MEMBER]: null,
}

export const SpaceMember = ({ member, spaceId }: SpaceMemberProps) => {
  const params = useParams()
  const router = useRouter()

  const profile = member?.profile
  const user = member?.user

  // Get user info from the member
  const userEmail = user && typeof user !== 'string' ? user.email : null
  const name =
    user && typeof user !== 'string'
      ? user.name || // Try name first
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || // Then first+last
        user.email?.split('@')[0] || // Then email username
        'Unnamed User'
      : 'Unnamed User'

  // Get image URL with Gravatar fallback
  const imageUrl =
    profile?.imageUrl || profile?.image?.url || getGravatarUrlOrNull(userEmail, 80) || null

  const nameInitial = name?.[0] || '?'

  const icon = roleIconMap[member.role as MemberRole]

  const onClick = () => {
    track('Member Clicked', { memberId: member.id })
    router.push(`/spaces/${spaceId}/conversations/${member.id}`)
  }

  const className = cn(
    'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
    params?.memberId === member.id && 'bg-zinc-700/20 dark:bg-zinc-700',
  )

  const textClassName = cn(
    'font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition',
    params?.memberId === member.id && 'text-primary dark:text-zinc-200 dark:group-hover:text-white',
  )

  return (
    <button onClick={onClick} className={className}>
      <Avatar className="h-8 w-8 md:h-8 md:w-8">
        <AvatarImage src={imageUrl || ''} />
        <AvatarFallback>{nameInitial}</AvatarFallback>
      </Avatar>
      <p className={textClassName}>{name}</p>
      {icon}
    </button>
  )
}
