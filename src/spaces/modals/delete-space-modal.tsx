'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { Button } from '@/components/ui/button'
import { ModalType } from '@/spaces/types'
import { spaceService } from '@/spaces/services/spaces'

export const DeleteSpaceModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const router = useRouter()
  const isModalOpen = isOpen && type === ModalType.DELETE_SPACE
  const { space } = data
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)
      if (!space?.id) throw new Error('Space ID is required')

      await spaceService.delete(space.id)

      onClose()
      router.refresh()
      router.push('/')
    } catch (error) {
      console.error('[DELETE_SPACE_MODAL]', error)
      toast.error('Failed to delete space')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden mx-4">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Delete Space</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this space?{' '}
            <span className="font-semibold text-indigo-500">{space?.name}</span> will be permanently
            deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button disabled={isLoading} onClick={onClick} variant="default">
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
