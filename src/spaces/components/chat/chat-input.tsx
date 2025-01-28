// path: src/components/Spaces/chat/chat-input.tsx
'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { track } from '@vercel/analytics'

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { EmojiPicker } from '@/spaces/components/emoji-picker'
import { Editor } from '@/spaces/components/editor'
import { Button } from '@/components/ui/button'
import { sendMessage, sendDirectMessage } from '@/app/(frontend)/api/messages/actions'

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
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="px-4 py-4 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] border-t border-zinc-700 shrink-0 sticky bottom-0 z-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => onOpen('messageFile')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                    >
                      <Plus className="text-white dark:text-[#313338]" />
                    </button>
                    <div className="pl-12 pr-24">
                      <Editor
                        value={field.value}
                        onChange={field.onChange}
                        onSubmit={form.handleSubmit(onSubmit)}
                        placeholder={`Message ${type === 'conversation' ? name : '#' + name}`}
                        className="min-h-[44px] w-full bg-[#383A40] dark:bg-[#383A40] border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-200 rounded-md resize-none px-4 py-3"
                      />
                    </div>
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      <EmojiPicker
                        onChange={(emoji: string) => field.onChange(field.value + emoji)}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !field.value.trim()}
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-zinc-700"
                    >
                      <Send className="h-5 w-5 text-zinc-400 hover:text-zinc-300 transition" />
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}
