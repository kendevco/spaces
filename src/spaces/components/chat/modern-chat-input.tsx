'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Send, Smile } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { track } from '@vercel/analytics'
import { useState } from 'react'

import { ChatInput } from '@/components/ui/chat-input'
import { Button } from '@/components/ui/button'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { EmojiPicker } from '@/spaces/components/emoji-picker'
import { sendMessage, sendDirectMessage } from '@/app/api/messages/actions'

interface ModernChatInputProps {
  name: string
  type: 'conversation' | 'channel'
  spaceId: string
  chatId: string
}

const formSchema = z.object({
  content: z.string().min(1),
})

export const ModernChatInput = ({ name, type, spaceId, chatId }: ModernChatInputProps) => {
  const { onOpen } = useModal()
  const router = useRouter()
  const [content, setContent] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  })

  const isLoading = form.formState.isSubmitting

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
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (content.trim()) {
        onSubmit({ content })
      }
    }
  }

  const handleSend = () => {
    if (content.trim()) {
      onSubmit({ content })
    }
  }

  return (
    <div className="px-4 py-4 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] border-t border-zinc-700 shrink-0 sticky bottom-0 z-10">
      <div className="flex items-end gap-2">
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
        <div className="flex-1 relative">
          <ChatInput
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              form.setValue('content', e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${type === 'conversation' ? name : '#' + name}`}
            disabled={isLoading}
            className="bg-[#383A40] dark:bg-[#383A40] border-none text-zinc-200 placeholder:text-zinc-400 pr-20"
          />

          {/* Emoji picker */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
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
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-zinc-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4 text-zinc-400 hover:text-zinc-300 transition" />
          </Button>
        </div>
      </div>
    </div>
  )
}
