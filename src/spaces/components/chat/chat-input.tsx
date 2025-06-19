// path: src/components/Spaces/chat/chat-input.tsx
'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { track } from '@vercel/analytics'
import { useState, useEffect, useRef } from 'react'

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { ChatInput as ShadcnChatInput } from '@/components/ui/chat-input'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { EmojiPicker } from '@/spaces/components/emoji-picker'
import { Button } from '@/components/ui/button'
import { sendMessage, sendDirectMessage } from '@/app/api/messages/actions'
import { TypingManager } from '@/spaces/utilities/typing'

interface ChatInputProps {
  name: string
  type: 'conversation' | 'channel'
  spaceId: string
  chatId: string
}

const formSchema = z.object({
  content: z.string().min(1),
})

export const ChatInput = ({ name, type, spaceId, chatId }: ChatInputProps) => {
  const { onOpen } = useModal()
  const router = useRouter()
  const [content, setContent] = useState('')
  const typingManagerRef = useRef<TypingManager | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  })

  const isLoading = form.formState.isSubmitting

  // Initialize typing manager
  useEffect(() => {
    typingManagerRef.current = new TypingManager({
      chatId,
      chatType: type,
      spaceId,
    })

    return () => {
      if (typingManagerRef.current) {
        typingManagerRef.current.cleanup()
        typingManagerRef.current = null
      }
    }
  }, [chatId, type, spaceId])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const plainContent = values.content.replace(/<[^>]*>/g, '')

      const result =
        type === 'channel'
          ? await sendMessage({
              content: plainContent,
              channelId: chatId,
              spaceId,
            })
          : await sendDirectMessage({
              content: plainContent,
              conversationId: chatId,
              spaceId,
            })

      if (!result.success) {
        throw new Error(result.error)
      }

      track('Message Sent', {
        contentLength: plainContent.length,
        type,
        recipient: name,
      })

      form.reset()
      setContent('')

      // Stop typing when message is sent
      if (typingManagerRef.current) {
        typingManagerRef.current.handleStopTyping()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (content.trim()) {
        if (typingManagerRef.current) {
          typingManagerRef.current.handleStopTyping()
        }
        onSubmit({ content })
      }
    } else {
      // User is typing, trigger typing indicator
      if (typingManagerRef.current) {
        typingManagerRef.current.handleTyping()
      }
    }
  }

  const handleSend = () => {
    if (content.trim()) {
      if (typingManagerRef.current) {
        typingManagerRef.current.handleStopTyping()
      }
      onSubmit({ content })
    }
  }

  return (
    <div className="px-4 py-3 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] border-t border-zinc-700 shrink-0 sticky bottom-0 z-10">
      <div className="flex items-end gap-3 max-w-full">
        {/* Attachment button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => onOpen('messageFile')}
          className="h-10 w-10 bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full flex-shrink-0"
          aria-label="Add file attachment"
          title="Add file attachment"
        >
          <Plus className="h-5 w-5 text-white dark:text-[#313338]" />
        </Button>

        {/* Chat input container */}
        <div className="flex-1 relative min-w-0">
          <ShadcnChatInput
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              form.setValue('content', e.target.value)
              if (e.target.value.trim()) {
                if (typingManagerRef.current) {
                  typingManagerRef.current.handleTyping()
                }
              } else {
                if (typingManagerRef.current) {
                  typingManagerRef.current.handleStopTyping()
                }
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${type === 'conversation' ? name : '#' + name}`}
            disabled={isLoading}
            className="bg-[#383A40] dark:bg-[#383A40] border-zinc-600 text-zinc-200 placeholder:text-zinc-400 pr-20 resize-none"
          />

          {/* Emoji picker */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 z-10">
            <EmojiPicker
              onChange={(emoji: string) => {
                const newContent = content + emoji
                setContent(newContent)
                form.setValue('content', newContent)
              }}
            />
          </div>

          {/* Send button */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleSend}
            disabled={isLoading || !content.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-zinc-700 disabled:opacity-50 z-10"
          >
            <Send className="h-4 w-4 text-zinc-400 hover:text-zinc-300 transition" />
          </Button>
        </div>
      </div>
    </div>
  )
}
