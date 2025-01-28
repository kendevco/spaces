'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createSpace } from '@/spaces/actions/create-space'
import { useUser } from '@/spaces/hooks/use-user'
import { MediaCategory } from '@/spaces/types'

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { FileUpload } from '@/spaces/components/file-upload'

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Space name is required.',
  }),
  imageUrl: z.string().min(1, {
    message: 'Space image is required.',
  }),
})

export const CreateSpaceModal = () => {
  const { user } = useUser()
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
    },
  })

  const isLoading = form.formState.isSubmitting

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!user?.id) {
        throw new Error('User not found')
      }

      const space = await createSpace({
        name: values.name,
        imageUrl: values.imageUrl,
        userId: user.id,
      })

      const firstChannelId = space.channels?.[0]
      const channelId = typeof firstChannelId === 'string' ? firstChannelId : firstChannelId?.id

      if (channelId) {
        router.push(`/spaces/${space.id}/channels/${channelId}`)
      } else {
        router.push(`/spaces/${space.id}`)
      }
    } catch (error) {
      console.error('Error creating space:', error)
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Create Your Space</DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your space a name and an image. You can always change these later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint={MediaCategory.SPACE}
                          value={field.value}
                          onChange={field.onChange}
                          category={MediaCategory.SPACE}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500">
                      Space Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter a space name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant="default" disabled={isLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
