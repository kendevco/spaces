'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { ChannelType, MemberRole } from '@/spaces/types'
import { updateChannel } from '@/spaces/actions/channels'
import { useUser } from '@/spaces/hooks/use-user'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Settings } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Channel name is required.',
  }),
  type: z.nativeEnum(ChannelType),
  workflowOverride: z.boolean().default(false),
  isSystemChannel: z.boolean().default(false),
  description: z.string().optional(),
})

export const EditChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const router = useRouter()
  const { user } = useUser()

  const isModalOpen = isOpen && type === 'editChannel'
  const { channel, space } = data

  // Check if user has workflow override permission
  const canOverrideWorkflow = user?.role === MemberRole.ADMIN
  const isSystemChannel = channel?.name === 'general' || channel?.name === 'system'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: channel?.type || ChannelType.TEXT,
      workflowOverride: false,
      isSystemChannel: isSystemChannel || false,
      description: '',
    },
  })

  useEffect(() => {
    if (channel) {
      form.setValue('name', channel.name)
      form.setValue('type', channel.type || ChannelType.TEXT)
      form.setValue('isSystemChannel', isSystemChannel)
      form.setValue('workflowOverride', false)
      form.setValue('description', (channel as any)?.description || '')
    }
  }, [form, channel, isSystemChannel])

  const isLoading = form.formState.isSubmitting

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (channel && space) {
        const result = await updateChannel(channel.id, {
          name: values.name,
          type: values.type,
          space: space.id,
        })

        if (!result) {
          throw new Error('Failed to update channel')
        }

        toast.success('Channel updated successfully')
      } else {
        throw new Error('Channel or space is undefined')
      }

      form.reset()
      router.refresh()
      onClose()
    } catch (error) {
      console.error('Error updating channel:', error)
      toast.error('Failed to update channel')
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Edit Channel</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Channel name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter channel name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Channel Type
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select a channel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(ChannelType) as Array<keyof typeof ChannelType>).map(
                          (key) => (
                            <SelectItem
                              key={ChannelType[key]}
                              value={ChannelType[key]}
                              className="capitalize"
                            >
                              {ChannelType[key].toLowerCase()}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Channel Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Description (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter channel description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* System Channel Indicator */}
              {isSystemChannel && (
                <FormField
                  control={form.control}
                  name="isSystemChannel"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-amber-50">
                      <Settings className="h-4 w-4 text-amber-600 mt-1" />
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-amber-800 font-medium">System Channel</FormLabel>
                        <p className="text-sm text-amber-600">
                          This is a system channel with special properties. Changes require workflow
                          override.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {/* Workflow Override */}
              {canOverrideWorkflow && isSystemChannel && (
                <FormField
                  control={form.control}
                  name="workflowOverride"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Enable Workflow Override
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Allow editing of system channel properties. Use with caution.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {/* Warning for regular users trying to edit system channels */}
              {!canOverrideWorkflow && isSystemChannel && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <div className="flex">
                    <Settings className="h-4 w-4 text-amber-600 mt-0.5 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">
                        System Channel Protection
                      </h3>
                      <p className="text-sm text-amber-600 mt-1">
                        You don&apos;t have permission to modify this system channel. Contact a
                        Space Admin or Host User for assistance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant="default" disabled={isLoading}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
