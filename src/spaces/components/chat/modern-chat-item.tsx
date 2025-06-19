'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FileIcon, ShieldAlert, ShieldCheck, Edit, Trash, Copy, Reply } from 'lucide-react'
import { ExtendedMember, MemberRole } from '@/spaces/types'
import { cn } from '@/utilities/cn'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAvatar,
  ChatBubbleAction,
} from '@/components/ui/chat-bubble'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { ActionTooltip } from '@/spaces/components/action-tooltip'
import { RichContentRenderer } from './rich-content-renderer'
import { MessageAttachments } from './message-attachments'

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  [MemberRole.GUEST]: null,
  [MemberRole.MEMBER]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="w-4 h-4 ml-1 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="w-4 h-4 ml-1 text-rose-500" />,
}

interface ModernChatItemProps {
  id: string
  content?: string
  contentJson?: any
  messageType?: 'text' | 'image' | 'file' | 'rich'
  attachments?: any[]
  member: ExtendedMember
  timestamp: string
  fileUrl?: string | null
  deleted: boolean
  currentMember: ExtendedMember
  isUpdated: boolean
  socketUrl?: string
  socketQuery?: Record<string, string>
}

const formSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
})

export const ModernChatItem = ({
  id,
  content,
  contentJson,
  messageType = 'text',
  attachments = [],
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
}: ModernChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const { onOpen } = useModal()
  const router = useRouter()
  const params = useParams()

  // Handle content formatting
  const getInitialContent = () => {
    if (typeof content === 'string') {
      return content
    }
    if (content && typeof content === 'object' && 'root' in content) {
      return (content as any).root.children.map((child: any) => child.text || '').join('')
    }
    return ''
  }

  const [localContent, setLocalContent] = useState(getInitialContent())

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: localContent },
  })

  useEffect(() => {
    if (!isEditing) {
      setLocalContent(getInitialContent())
    }
  }, [content, isEditing])

  useEffect(() => {
    form.reset({ content: localContent })
  }, [localContent, form])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsEditing(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const response = await fetch('/api/messages/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    setLocalContent(values.content)
    form.reset({ content: values.content })
    setIsEditing(false)
  }

  const onMemberClick = () => {
    if (member.id === currentMember.id) return
    router.push(`/spaces/${params?.spaceId}/conversations/${member.id}`)
  }

  const memberName = member?.profile?.name || 'Unknown User'
  const memberImageUrl = member?.profile?.imageUrl || null
  const memberInitial = memberName?.[0] || '?'

  // Check permissions
  const isAdmin = currentMember.role === MemberRole.ADMIN
  const isModerator = currentMember.role === MemberRole.MODERATOR
  const isOwner = currentMember.id === member.id
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
  const canEditMessage = !deleted && isOwner && attachments.length === 0

  // Determine if this is a sent or received message
  const isOwnMessage = currentMember.id === member.id
  const variant = isOwnMessage ? 'sent' : 'received'

  // Handle legacy fileUrl or new attachments
  const messageAttachments = fileUrl
    ? [{ url: fileUrl, filename: 'attachment', mimeType: 'application/octet-stream' }]
    : attachments || []

  const hasTextContent = content && content.toString().trim().length > 0
  const hasJsonContent = contentJson && Object.keys(contentJson).length > 0
  const hasContent = hasTextContent || hasJsonContent

  if (deleted) {
    return (
      <ChatBubble variant={variant} className="group">
        <ChatBubbleAvatar
          src={memberImageUrl ?? undefined}
          fallback={memberInitial}
          className="h-8 w-8"
        />
        <ChatBubbleMessage
          variant={variant}
          className="bg-muted/50 text-muted-foreground italic border-l-4 border-destructive"
        >
          <p className="text-sm">This message was deleted.</p>
          <div className="flex items-center gap-x-2 mt-1">
            <span className="text-xs text-muted-foreground">{memberName}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(timestamp).toLocaleString()}
            </span>
          </div>
        </ChatBubbleMessage>
      </ChatBubble>
    )
  }

  return (
    <ChatBubble variant={variant} className="group">
      <ChatBubbleAvatar
        src={memberImageUrl ?? undefined}
        fallback={memberInitial}
        className="h-8 w-8 cursor-pointer hover:opacity-75 transition"
      />

      <div className="flex flex-col space-y-1 flex-1">
        {/* Message header */}
        <div className="flex items-center gap-x-2">
          <span
            onClick={onMemberClick}
            className="font-semibold text-sm hover:underline cursor-pointer text-zinc-200"
          >
            {memberName}
          </span>
          <ActionTooltip label={member?.role || 'member'}>
            {roleIconMap[(member?.role as MemberRole) || MemberRole.MEMBER]}
          </ActionTooltip>
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleString()}
          </span>
          {isUpdated && <span className="text-xs text-muted-foreground">(edited)</span>}
        </div>

        {/* Message content */}
        <ChatBubbleMessage
          variant={variant}
          className={cn(
            'relative',
            // Apply Spaces theme colors
            variant === 'sent' ? 'bg-[#7364c0] text-white' : 'bg-[#383A40] text-zinc-200',
          )}
        >
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-[#383A40] border-zinc-600 text-zinc-200"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              form.handleSubmit(onSubmit)()
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="outline">
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <>
              {hasContent && (
                <div className="break-words">
                  {typeof content === 'string' ? (
                    <p>{content}</p>
                  ) : (
                    <RichContentRenderer content={content || contentJson} />
                  )}
                </div>
              )}

              {messageAttachments.length > 0 && (
                <MessageAttachments attachments={messageAttachments} messageId={id} />
              )}
            </>
          )}

          {/* Action buttons */}
          <div className="absolute -top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-md p-1">
            <ChatBubbleAction
              icon={<Copy className="h-4 w-4" />}
              onClick={() => navigator.clipboard.writeText(localContent)}
            />
            {canEditMessage && (
              <ChatBubbleAction
                icon={<Edit className="h-4 w-4" />}
                onClick={() => setIsEditing(true)}
              />
            )}
            {canDeleteMessage && (
              <ChatBubbleAction
                icon={<Trash className="h-4 w-4" />}
                onClick={() =>
                  onOpen(
                    'deleteMessage' as any,
                    {
                      messageId: id,
                      spaceId: socketQuery?.spaceId,
                      channelId: socketQuery?.channelId,
                    } as any,
                  )
                }
              />
            )}
          </div>
        </ChatBubbleMessage>
      </div>
    </ChatBubble>
  )
}
