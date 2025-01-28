// path: src/components/Spaces/Space/space-header.tsx
'use client'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
  Edit,
} from 'lucide-react'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { MemberRole } from '@/spaces/types'
import { Space as PayloadSpace } from '@/payload-types'

interface SpaceHeaderProps {
  space: PayloadSpace
  role?: MemberRole
}

export const SpaceHeader = ({ space, role }: SpaceHeaderProps) => {
  const { onOpen } = useModal()

  if (!space) {
    return null
  }

  const isAdmin = role === MemberRole.ADMIN
  const isModerator = isAdmin || role === MemberRole.MODERATOR

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <button
          className="w-full text-zinc-200 font-semibold flex items-center h-12 px-3
          border-b-2 border-zinc-800
          bg-gradient-to-br from-[#7364c0] to-[#02264a]
          dark:from-[#000C2F] dark:to-[#003666]
          hover:from-[#7364c0]/90 hover:to-[#02264a]/90
          dark:hover:from-[#000C2F]/90 dark:hover:to-[#003666]/90
          transition"
        >
          {space.name}
          <ChevronDown className="h-5 w-5 ml-auto" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 text-xs font-medium
          bg-gradient-to-br from-[#7364c0] to-[#02264a]
          dark:from-[#000C2F] dark:to-[#003666]
          border border-zinc-700/50
          shadow-lg shadow-black/40"
      >
        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen('invite', { space })}
            className="text-indigo-300 hover:text-indigo-200 hover:bg-zinc-700/50 text-sm cursor-pointer px-3 py-2 transition"
          >
            Invite People
            <UserPlus className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen('editSpace', { space })}
            className="text-zinc-200 hover:bg-zinc-700/50 text-sm cursor-pointer px-3 py-2 transition"
          >
            Edit Space
            <Edit className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen('members', { space })}
            className="text-zinc-200 hover:bg-zinc-700/50 text-sm cursor-pointer px-3 py-2 transition"
          >
            Manage Members
            <Users className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen('createChannel', { space })}
            className="text-zinc-200 hover:bg-zinc-700/50 text-sm cursor-pointer px-3 py-2 transition"
          >
            Create Channel
            <PlusCircle className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isModerator && <DropdownMenuSeparator className="bg-zinc-700/50" />}

        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen('deleteSpace', { space })}
            className="text-rose-500 hover:bg-rose-500/10 text-sm cursor-pointer px-3 py-2 transition"
          >
            Delete Space
            <Trash className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {!isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen('leaveSpace', { space })}
            className="text-rose-500 hover:bg-rose-500/10 text-sm cursor-pointer px-3 py-2 transition"
          >
            Leave Space
            <LogOut className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
