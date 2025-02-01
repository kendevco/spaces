// path: src/components/Spaces/chat/chat-item.tsx
'use client'

import { useState, Fragment, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FileIcon, ShieldAlert, ShieldCheck, Edit, Trash } from 'lucide-react'
import { ExtendedMember, MemberRole } from '@/spaces/types'
import { cn } from '@/utilities/cn'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import qs from 'query-string'
import axios from 'axios'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { UserAvatar } from '@/spaces/components/user-avatar'
import { ActionTooltip } from '@/spaces/components/action-tooltip'
import { useModal } from '@/spaces/hooks/use-modal-store'

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  [MemberRole.GUEST]: null,
  [MemberRole.MEMBER]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="w-4 h-4 ml-2 text-rose-500" />,
}

interface ChatItemProps {
  id: string
  content: string | { root: { children: Array<{ text?: string }> } }
  member: ExtendedMember
  timestamp: string
  fileUrl: string | null
  deleted: boolean
  currentMember: ExtendedMember
  isUpdated: boolean
  isLast?: boolean
  socketUrl?: string
  socketQuery?: Record<string, string>
}

// Define a simple Zod schema for editing message content
const formSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
})

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  isLast,
  socketUrl,
  socketQuery,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  // Convert content prop to a string for use in edit forms.
  const initialContentString =
    typeof content === 'string'
      ? content
      : content.root.children.map((child) => child.text || '').join('')
  const [localContent, setLocalContent] = useState(initialContentString)
  const { onOpen } = useModal()
  const router = useRouter()
  const params = useParams()

  // Initialize react-hook-form with our schema and default value.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: localContent },
  })

  // When not editing, update localContent if prop `content` changes.
  useEffect(() => {
    if (!isEditing) {
      setLocalContent(
        typeof content === 'string'
          ? content
          : content.root.children.map((child) => child.text || '').join(''),
      )
    }
  }, [content, isEditing])

  // Update form values when localContent changes.
  useEffect(() => {
    form.reset({ content: localContent })
  }, [localContent, form])

  // Listen for the Escape key to cancel edit mode.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsEditing(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handler for editing submission.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Call the NextJS server action via our API route for updating messages.
    const response = await fetch('/api/messages/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: id,
        content: values.content,
        spaceId: socketQuery?.spaceId,
        channelId: socketQuery?.channelId,
      }),
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to update message')
    }

    // Update local content on success.
    setLocalContent(values.content)
    form.reset({ content: values.content })
    setIsEditing(false)
  }

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return
    }
    router.push(`/spaces/${params?.spaceId}/conversations/${member.id}`)
  }

  const memberName = member?.profile?.name || 'Unknown User'
  const memberImageUrl = member?.profile?.imageUrl || null
  const memberInitial = memberName?.[0] || '?'

  const messageContent = (() => {
    if (typeof content === 'string') {
      return content
    }

    if (content?.root?.children) {
      return content.root.children.map((child) => child.text || '').join('')
    }

    return ''
  })()

  const renderContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    // First split by URLs, then handle line breaks
    const formattedParts = parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline break-all hover:text-white/90"
          >
            {part}
          </a>
        )
      }
      // Split by newlines and join with br tags
      return part.split('\n').map((line, j) => (
        <Fragment key={`${i}-${j}`}>
          {line}
          {j !== part.split('\n').length - 1 && <br />}
        </Fragment>
      ))
    })

    return formattedParts
  }

  // Permissions Checks
  const fileType = fileUrl?.split('.').pop() || undefined
  const isAdmin = currentMember.role === MemberRole.ADMIN
  const isModerator = currentMember.role === MemberRole.MODERATOR
  const isOwner = currentMember.id === member.id
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
  const canEditMessage = !deleted && isOwner && !fileUrl
  const isPDF = fileType === 'pdf' && fileUrl
  const isImage = !isPDF && fileUrl

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div onClick={onMemberClick} className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar
            src={memberImageUrl}
            className="h-8 w-8 md:h-8 md:w-8"
            fallback={memberInitial}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                onClick={onMemberClick}
                className="font-semibold text-sm hover:underline cursor-pointer"
              >
                {memberName}
              </p>
              <ActionTooltip label={member?.role || 'member'}>
                {roleIconMap[(member?.role as MemberRole) || MemberRole.MEMBER]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{timestamp}</span>
          </div>
          {deleted ? (
            <div className="mt-2">
              <p className="text-sm italic text-zinc-500">This message has been deleted</p>
            </div>
          ) : (
            <div className="mt-2">
              {!fileUrl && !isEditing && (
                <p
                  className={cn(
                    'text-sm text-zinc-600 dark:text-zinc-300',
                    deleted && 'italic text-zinc-500 dark:text-zinc-400 text-xs mt-1',
                  )}
                >
                  {renderContent(localContent)}
                  {isUpdated && !deleted && (
                    <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                      (edited)
                    </span>
                  )}
                </p>
              )}
              {!fileUrl && isEditing && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex items-center gap-x-2 w-full pt-2"
                  >
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="relative w-full">
                              <Input
                                disabled={form.formState.isSubmitting}
                                className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                                placeholder="Edited message"
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button disabled={form.formState.isSubmitting} size="sm" variant="default">
                      Save
                    </Button>
                  </form>
                  <span className="text-[10px] mt-1 text-zinc-400">
                    Press escape to cancel, enter to save
                  </span>
                </Form>
              )}
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-x-2 mt-2 text-blue-500 hover:underline"
                >
                  <FileIcon className="h-4 w-4" />
                  Attachment
                </a>
              )}
            </div>
          )}
        </div>
        {canDeleteMessage && (
          <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
            {canEditMessage && (
              <ActionTooltip label="Edit">
                <Edit
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                />
              </ActionTooltip>
            )}
            <ActionTooltip label="Delete">
              <Trash
                onClick={() =>
                  onOpen('deleteMessage', {
                    apiUrl: `${socketUrl}/${id}`,
                    query: { messageId: id, ...socketQuery },
                  })
                }
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          </div>
        )}
      </div>
    </div>
  )
}
