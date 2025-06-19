'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { track } from '@vercel/analytics'
import { toast } from '@payloadcms/ui'
import { addMember, removeMember, updateMemberRole } from '@/spaces/actions/members'
import { MemberRole } from '@/spaces/types'
import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/spaces/hooks/use-user'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Helper functions
const getRoleDisplayName = (role: MemberRole): string => {
  switch (role) {
    case MemberRole.ADMIN:
      return 'Admin'
    case MemberRole.MODERATOR:
      return 'Moderator'
    case MemberRole.MEMBER:
      return 'Member'
    case MemberRole.GUEST:
      return 'Guest'
    default:
      return 'Unknown'
  }
}

const canUserPerformAction = (
  userRole: MemberRole,
  targetRole: MemberRole,
  action: string,
): boolean => {
  // Simple permission check - admins can do everything, moderators can manage members/guests
  if (userRole === MemberRole.ADMIN) return true
  if (userRole === MemberRole.MODERATOR && targetRole !== MemberRole.ADMIN) return true
  return false
}

// UserAvatar component replacement
const UserAvatar = ({
  src,
  email,
  className = '',
}: {
  src: string
  email: string
  className?: string
}) => (
  <Avatar className={`h-8 w-8 ${className}`}>
    <AvatarImage src={src} />
    <AvatarFallback className="text-white bg-[#7364c0]">
      {email.charAt(0).toUpperCase()}
    </AvatarFallback>
  </Avatar>
)

import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldCheck,
  ShieldQuestion,
  UserPlus,
  Search,
  Plus,
  Users,
  Star,
  UserCheck,
  UserMinus,
} from 'lucide-react'

interface SearchUser {
  id: string
  name: string
  email: string
  imageUrl?: string
}

interface SpaceMember {
  id: string
  role: MemberRole
  user: {
    id: string
    name: string
    email: string
    imageUrl?: string
  }
  createdAt: string
  updatedAt: string
}

interface ModalData {
  spaceId: string
  space?: {
    id: string
    name: string
    members: SpaceMember[]
  }
}

const roleIconMap = {
  [MemberRole.ADMIN]: <ShieldCheck className="h-4 w-4 text-red-400 ml-2" />,
  [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 text-blue-400 ml-2" />,
  [MemberRole.MEMBER]: null,
  [MemberRole.GUEST]: null,
}

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
})

export const MembersModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const router = useRouter()
  const { user } = useUser()

  const [loadingId, setLoadingId] = useState('')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAddingMembers, setIsAddingMembers] = useState(false)
  const [memberFilter, setMemberFilter] = useState<'all' | 'admin' | 'member' | 'guest'>('all')
  const [memberSearchQuery, setMemberSearchQuery] = useState('')

  const isModalOpen = isOpen && type === 'members'
  const { spaceId, space } = data as ModalData

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  const fetchUsers = async (query: string) => {
    setIsLoading(true)
    setError('')

    try {
      if (!spaceId) return

      const response = await fetch(
        `/api/users/search?query=${encodeURIComponent(query)}&spaceId=${spaceId}`,
      )

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const users = await response.json()
      setSearchResults(users)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) return

    setIsAddingMembers(true)

    try {
      for (const userId of selectedUserIds) {
        const result = await addMember({
          spaceId,
          userId,
          role: MemberRole.MEMBER,
        })

        if (!result.success) {
          throw new Error(result.error)
        }
      }

      setSelectedUserIds([])
      setSearchResults([])
      setSearchQuery('')
      setIsInviteModalOpen(false)
      router.refresh()
      toast.success('Members added successfully!')
      track('Members Added', { spaceId, count: selectedUserIds.length })
    } catch (error) {
      console.error('Error adding members:', error)
      setError('Failed to add members')
      toast.error('Failed to add members')
    } finally {
      setIsAddingMembers(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      setLoadingId(memberId)
      const result = await removeMember(memberId)

      if (result.success) {
        router.refresh()
        toast.success('Member removed successfully')
        track('Member Removed', { spaceId, memberId })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Failed to remove member')
    } finally {
      setLoadingId('')
    }
  }

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId)
      const result = await updateMemberRole({ memberId, role })

      if (result.success) {
        router.refresh()
        toast.success('Member role updated')
        track('Member Role Updated', { spaceId, memberId, role })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update member role')
    } finally {
      setLoadingId('')
    }
  }

  const toggleMember = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((memberId) => memberId !== id) : [...prev, id],
    )
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const result = await addMember({
        spaceId,
        userId: values.email,
        role: MemberRole.MEMBER,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      form.reset()
      router.refresh()
      onClose()
      toast.success('Member added successfully!')
      track('Member Added', { spaceId })
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error('Failed to add member')
    }
  }

  const handleClose = () => {
    track('Members Modal Closed')
    form.reset()
    setIsInviteModalOpen(false)
    setSearchQuery('')
    setSelectedUserIds([])
    setError('')
    onClose()
  }

  // Debounced search for user search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(() => {
      fetchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Filter members based on search query and role filter
  const filteredMembers =
    space?.members?.filter((member) => {
      // Role filter
      let matchesRole = true
      if (memberFilter !== 'all') {
        switch (memberFilter) {
          case 'admin':
            matchesRole = member.role === MemberRole.ADMIN
            break
          case 'member':
            matchesRole = member.role === MemberRole.MEMBER || member.role === MemberRole.MODERATOR
            break
          case 'guest':
            matchesRole = member.role === MemberRole.GUEST
            break
        }
      }

      // Search query filter
      let matchesSearch = true
      if (memberSearchQuery.trim()) {
        const query = memberSearchQuery.toLowerCase()
        matchesSearch =
          member.user.name.toLowerCase().includes(query) ||
          member.user.email.toLowerCase().includes(query)
      }

      return matchesRole && matchesSearch
    }) || []

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-4xl text-center font-bold text-zinc-200">
              Manage Members
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              {filteredMembers.length} of {space?.members?.length || 0} Members
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pt-4 space-y-4">
            <Button
              variant="outline"
              className="w-full text-zinc-200 bg-zinc-700/50 hover:bg-zinc-700 hover:text-zinc-100 border-0 transition-colors"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Add Members
            </Button>

            {/* Search Members */}
            <div className="flex items-center gap-x-2">
              <Search className="h-4 w-4 text-zinc-400" />
              <Input
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="bg-zinc-700/50 border-0 focus-visible:ring-0 text-zinc-200 focus-visible:ring-offset-0 placeholder:text-zinc-400"
              />
            </div>

            {/* Filter by Role */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={memberFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMemberFilter('all')}
                className={
                  memberFilter === 'all'
                    ? 'bg-[#7364c0] hover:bg-[#6356a8] text-white border-0'
                    : 'text-zinc-300 bg-zinc-700/50 hover:bg-zinc-700 border-0'
                }
              >
                All
              </Button>
              <Button
                variant={memberFilter === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMemberFilter('admin')}
                className={
                  memberFilter === 'admin'
                    ? 'bg-[#7364c0] hover:bg-[#6356a8] text-white border-0'
                    : 'text-zinc-300 bg-zinc-700/50 hover:bg-zinc-700 border-0'
                }
              >
                <Shield className="h-3 w-3 mr-1" />
                Admins
              </Button>
              <Button
                variant={memberFilter === 'member' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMemberFilter('member')}
                className={
                  memberFilter === 'member'
                    ? 'bg-[#7364c0] hover:bg-[#6356a8] text-white border-0'
                    : 'text-zinc-300 bg-zinc-700/50 hover:bg-zinc-700 border-0'
                }
              >
                <Star className="h-3 w-3 mr-1" />
                Members
              </Button>
              <Button
                variant={memberFilter === 'guest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMemberFilter('guest')}
                className={
                  memberFilter === 'guest'
                    ? 'bg-[#7364c0] hover:bg-[#6356a8] text-white border-0'
                    : 'text-zinc-300 bg-zinc-700/50 hover:bg-zinc-700 border-0'
                }
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Guests
              </Button>
            </div>
          </div>

          <ScrollArea className="mt-4 max-h-[420px] mx-6 mb-6 bg-black/10 rounded-md p-4">
            {filteredMembers.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-zinc-400">
                  {memberSearchQuery || memberFilter !== 'all'
                    ? 'No members match your search criteria'
                    : 'No members found'}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-x-2 mb-3 last:mb-0">
                  <UserAvatar src={member.user.imageUrl || ''} email={member.user.email} />
                  <div className="flex flex-col gap-y-1">
                    <div className="text-sm font-semibold flex items-center gap-x-1 text-zinc-200">
                      {member.user.name}
                      {roleIconMap[member.role]}
                    </div>
                    <div className="flex items-center gap-x-2">
                      <p className="text-xs text-zinc-400">{member.user.email}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-700/50 text-zinc-300">
                        {getRoleDisplayName(member.role)}
                      </span>
                    </div>
                  </div>
                  {space &&
                    space.members.length > 1 &&
                    loadingId !== member.id &&
                    user?.id !== member.user.id && (
                      <div className="ml-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4 text-zinc-400 hover:text-zinc-200" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="left">
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="flex items-center">
                                <ShieldQuestion className="w-4 h-4 mr-2" />
                                <span>Role</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  {/* Guest Role */}
                                  {canUserPerformAction(
                                    user?.role || MemberRole.GUEST,
                                    MemberRole.GUEST,
                                    'role_change',
                                  ) && (
                                    <DropdownMenuItem
                                      onClick={() => onRoleChange(member.id, MemberRole.GUEST)}
                                    >
                                      <UserMinus className="h-4 w-4 mr-2 text-gray-500" />
                                      {getRoleDisplayName(MemberRole.GUEST)}
                                      {member.role === MemberRole.GUEST && (
                                        <Check className="h-4 w-4 ml-auto" />
                                      )}
                                    </DropdownMenuItem>
                                  )}

                                  {/* Member Role */}
                                  {canUserPerformAction(
                                    user?.role || MemberRole.GUEST,
                                    MemberRole.MEMBER,
                                    'role_change',
                                  ) && (
                                    <DropdownMenuItem
                                      onClick={() => onRoleChange(member.id, MemberRole.MEMBER)}
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      {getRoleDisplayName(MemberRole.MEMBER)}
                                      {member.role === MemberRole.MEMBER && (
                                        <Check className="h-4 w-4 ml-auto" />
                                      )}
                                    </DropdownMenuItem>
                                  )}

                                  {/* Moderator Role */}
                                  {canUserPerformAction(
                                    user?.role || MemberRole.GUEST,
                                    MemberRole.MODERATOR,
                                    'role_change',
                                  ) && (
                                    <DropdownMenuItem
                                      onClick={() => onRoleChange(member.id, MemberRole.MODERATOR)}
                                    >
                                      <ShieldCheck className="h-4 w-4 mr-2 text-blue-400" />
                                      {getRoleDisplayName(MemberRole.MODERATOR)}
                                      {member.role === MemberRole.MODERATOR && (
                                        <Check className="h-4 w-4 ml-auto" />
                                      )}
                                    </DropdownMenuItem>
                                  )}

                                  {/* Admin Role */}
                                  {canUserPerformAction(
                                    user?.role || MemberRole.GUEST,
                                    MemberRole.ADMIN,
                                    'role_change',
                                  ) && (
                                    <DropdownMenuItem
                                      onClick={() => onRoleChange(member.id, MemberRole.ADMIN)}
                                    >
                                      <ShieldCheck className="h-4 w-4 mr-2 text-red-400" />
                                      {getRoleDisplayName(MemberRole.ADMIN)}
                                      {member.role === MemberRole.ADMIN && (
                                        <Check className="h-4 w-4 ml-auto" />
                                      )}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRemoveMember(member.id)}>
                              <Gavel className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  {loadingId === member.id && (
                    <Loader2 className="animate-spin text-zinc-400 ml-auto w-4 h-4" />
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Add Members Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold text-zinc-200">
              Add Members
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              Search and select users to add to your space.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6">
            <div className="flex items-center gap-x-2 mb-4">
              <Search className="h-4 w-4 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="bg-zinc-700/50 border-0 focus-visible:ring-0 text-zinc-200 focus-visible:ring-offset-0 placeholder:text-zinc-400"
              />
            </div>

            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

            <ScrollArea className="max-h-[300px] mb-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/5 transition-colors"
                    >
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => toggleMember(user.id)}
                        className="border-zinc-400"
                      />
                      <UserAvatar
                        src={user.imageUrl || ''}
                        email={user.email}
                        className="h-8 w-8"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">{user.name}</p>
                        <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  ))}
                  {searchQuery && !isLoading && searchResults.length === 0 && (
                    <p className="text-center text-zinc-400 py-8">
                      No users found matching &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="bg-black/10 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
              className="text-zinc-200 bg-transparent border-zinc-600 hover:bg-zinc-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={selectedUserIds.length === 0 || isAddingMembers}
              className="bg-[#7364c0] hover:bg-[#6356a8] text-white"
            >
              {isAddingMembers && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add {selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
