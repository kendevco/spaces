'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { MediaCategory } from '@/spaces/types'
import { useAuth } from '@/providers/Auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { spaceService } from '@/spaces/services/spaceService.client'

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

export const InitialModal = () => {
  const [isMounted, setIsMounted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)

    // Only check for spaces if user is admin
    if (user?.role === 'admin') {
      const checkSpaces = async () => {
        try {
          const spaces = await spaceService.getUserSpaces()
          setShowModal(spaces.length === 0)
        } catch (error) {
          console.error('Error checking spaces:', error)
          setShowModal(false)
        }
      }
      checkSpaces()
    }
  }, [user])

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
      await spaceService.createSpace({
        name: values.name,
        imageUrl: values.imageUrl,
      })
      form.reset()
      router.refresh()
      setShowModal(false)
    } catch (error) {
      console.error('Error creating space:', error)
    }
  }

  if (!isMounted || !showModal) {
    return null
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden mx-4">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Create your first space
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your space a personality with a name and an image. You can always change it later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mx-4">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          category={MediaCategory.SPACE}
                          endpoint={MediaCategory.SPACE}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
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
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading} variant="default">
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
