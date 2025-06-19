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
import { MemberRole, ModalType } from '@/spaces/types'
import { Space as PayloadSpace } from '@/payload-types'
import { SpacesMedia } from '@/spaces/components/ui/spaces-media'

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
          transition group"
        >
          <div className="flex items-center gap-x-2 flex-1 min-w-0">
            {/* Space Image */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700 relative">
                <SpacesMedia
                  resource={space.image}
                  alt={space.name}
                  width={32}
                  height={32}
                  imgClassName="object-cover w-full h-full"
                  loading="eager"
                  fallback={
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 font-semibold text-sm">
                      {space.name.charAt(0).toUpperCase()}
                    </div>
                  }
                />
              </div>
            </div>

            {/* Space Name */}
            <h1 className="font-semibold text-md text-zinc-200 truncate">{space.name}</h1>
          </div>

          {/* Dropdown Arrow */}
          <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]"
        side="bottom"
        align="start"
      >
        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen(ModalType.INVITE, { space })}
            className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer"
          >
            Invite People
            <UserPlus className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen(ModalType.EDIT_SPACE, { space })}
            className="px-3 py-2 text-sm cursor-pointer"
          >
            Space Settings
            <Settings className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen(ModalType.MEMBERS, { space })}
            className="px-3 py-2 text-sm cursor-pointer"
          >
            Manage Members
            <Users className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen(ModalType.CREATE_CHANNEL, { space })}
            className="px-3 py-2 text-sm cursor-pointer"
          >
            Create Channel
            <PlusCircle className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isModerator && <DropdownMenuSeparator />}

        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen(ModalType.DELETE_SPACE, { space })}
            className="text-rose-500 px-3 py-2 text-sm cursor-pointer"
          >
            Delete Space
            <Trash className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {!isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen(ModalType.LEAVE_SPACE, { space })}
            className="text-rose-500 px-3 py-2 text-sm cursor-pointer"
          >
            Leave Space
            <LogOut className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
