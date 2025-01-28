'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { track } from '@vercel/analytics'
import { toast } from '@payloadcms/ui'
import { MediaCategory } from '@/spaces/types'
import { Space } from '@/payload-types'
import { updateSpace } from '@/spaces/actions/spaces'

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
import { useEffect } from 'react'

interface ModalData {
  space: Space
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Space name is required.',
  }),
  imageUrl: z.string().min(1, {
    message: 'Space image is required.',
  }),
})

export const EditSpaceModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const router = useRouter()

  const isModalOpen = isOpen && type === 'editSpace'
  const { space } = data as unknown as ModalData

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
    },
  })

  useEffect(() => {
    if (space) {
      form.setValue('name', space.name)
      if (typeof space.image === 'string') {
        form.setValue('imageUrl', space.image)
      } else if (space.image && 'url' in space.image) {
        form.setValue('imageUrl', space.image.url || '')
      }
    }
  }, [space, form])

  const isLoading = form.formState.isSubmitting

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const result = await updateSpace(space.id, {
        name: values.name,
        image: values.imageUrl,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      form.reset()
      router.refresh()
      onClose()
      toast.success('Space updated successfully!')
      track('Space Updated', { spaceId: space.id })
    } catch (error) {
      console.error('Error updating space:', error)
      toast.error('Failed to update space')
    }
  }

  const handleClose = () => {
    track('Edit Space Modal Closed')
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden mx-4">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Customize your space</DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your space a personality with a name and an image.
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
                          endpoint={MediaCategory.SPACE}
                          category={MediaCategory.SPACE}
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
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
