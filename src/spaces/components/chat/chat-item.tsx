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
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { UserAvatar } from '@/spaces/components/user-avatar'
import { ActionTooltip } from '@/spaces/components/action-tooltip'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { RichContentRenderer } from './rich-content-renderer'
import { ExpandableMessage } from './expandable-message'
import { MessageAttachments } from './message-attachments'
import { Media } from '@/components/Media'

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  [MemberRole.GUEST]: null,
  [MemberRole.MEMBER]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="w-4 h-4 ml-1 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="w-4 h-4 ml-1 text-rose-500" />,
}

interface MessageFormatOptions {
  textWrap?: boolean
  maxLines?: number
  allowExpand?: boolean
}

interface ChatItemProps {
  id: string
  content?: string
  contentJson?: any
  messageType?: 'text' | 'image' | 'file' | 'rich'
  formatOptions?: MessageFormatOptions
  attachments?: any[]
  member: ExtendedMember
  timestamp: string
  fileUrl?: string | null // Legacy support
  deleted: boolean
  currentMember: ExtendedMember
  isUpdated: boolean
  isLast?: boolean
  socketUrl?: string
  socketQuery?: Record<string, string>
  isCompact?: boolean
}

// Define a simple Zod schema for editing message content
const formSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
})

export const ChatItem = ({
  id,
  content,
  contentJson,
  messageType = 'text',
  formatOptions,
  attachments = [],
  member,
  timestamp,
  fileUrl, // Legacy support
  deleted,
  currentMember,
  isUpdated,
  isLast,
  socketUrl,
  socketQuery,
  isCompact,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false)

  // Handle both new and legacy content structure
  const getInitialContent = () => {
    if (typeof content === 'string') {
      return content
    }
    if (content && typeof content === 'object' && 'root' in content) {
      const contentWithRoot = content as { root: { children: Array<{ text?: string }> } }
      return contentWithRoot.root.children.map((child: any) => child.text || '').join('')
    }
    return ''
  }

  const [localContent, setLocalContent] = useState(getInitialContent())
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
      setLocalContent(getInitialContent())
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
  const memberEmail = typeof member?.user !== 'string' ? member?.user?.email : null
  const memberInitial = memberName?.[0] || '?'

  // Check if message has content (text or JSON)
  const hasTextContent = content && content.toString().trim().length > 0
  const hasJsonContent = contentJson && Object.keys(contentJson).length > 0
  const hasContent = hasTextContent || hasJsonContent

  // Handle legacy fileUrl or new attachments
  const messageAttachments = fileUrl
    ? [{ url: fileUrl, filename: 'attachment', mimeType: 'application/octet-stream' }]
    : attachments || []

  // Permissions Checks
  const isAdmin = currentMember.role === MemberRole.ADMIN
  const isModerator = currentMember.role === MemberRole.MODERATOR
  const isOwner = currentMember.id === member.id
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
  const canEditMessage = !deleted && isOwner && messageAttachments.length === 0

  return (
    <div className="relative group flex items-start hover:bg-black/5 px-4 py-1.5 transition w-full">
      <div className="group flex gap-x-3 items-start w-full">
        <div
          onClick={onMemberClick}
          className="cursor-pointer hover:drop-shadow-md transition flex-shrink-0"
        >
          <UserAvatar
            src={memberImageUrl}
            email={memberEmail}
            className="h-8 w-8"
            fallback={memberInitial}
          />
        </div>
        <div className="flex flex-col w-full min-w-0">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                onClick={onMemberClick}
                className="font-semibold text-sm hover:underline cursor-pointer text-zinc-200"
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
            <div className="mt-1">
              <p className="text-sm italic text-zinc-500">This message has been deleted</p>
            </div>
          ) : (
            <div className="mt-1">
              {/* Message Content */}
              {hasContent && !isEditing && (
                <div className="mb-3">
                  <ExpandableMessage
                    content={hasTextContent ? content?.toString() : undefined}
                    contentJson={hasJsonContent ? contentJson : undefined}
                    formatOptions={formatOptions}
                    className="text-zinc-200 dark:text-zinc-300"
                  />
                  {isUpdated && !deleted && (
                    <span className="text-[10px] ml-2 text-zinc-500 dark:text-zinc-400">
                      (edited)
                    </span>
                  )}
                </div>
              )}

              {/* Editing Form */}
              {hasContent && isEditing && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex items-center gap-x-2 w-full pt-1"
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
                  <span className="text-[10px] mt-0.5 text-zinc-400">
                    Press escape to cancel, enter to save
                  </span>
                </Form>
              )}

              {/* Message Attachments */}
              {messageAttachments.length > 0 && (
                <MessageAttachments attachments={messageAttachments} messageId={id} />
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {canDeleteMessage && (
          <div className="hidden group-hover:flex items-center gap-x-1 absolute p-1 -top-1 right-2 bg-white dark:bg-zinc-800 border rounded-sm">
            {canEditMessage && (
              <ActionTooltip label="Edit">
                <Edit
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
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
                className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          </div>
        )}
      </div>
    </div>
  )
}
