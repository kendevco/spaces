'use client'

import { useState } from 'react'
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
import { ModalType, ModalData } from '@/spaces/types'
import { messageService } from '@/spaces/services/messages'

export const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const isModalOpen = isOpen && type === ModalType.DELETE_MESSAGE
  const { apiUrl, query } = data as ModalData
  const messageId = query?.messageId
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)
      if (!messageId) throw new Error('Message ID is required')

      const result = await messageService.deleteMessage(messageId)
      if (!result) throw new Error('Failed to delete message')

      onClose()
    } catch (error) {
      console.error('[DELETE_MESSAGE_MODAL]', error)
      toast.error('Failed to delete message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Delete Message</DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this? <br />
            The message will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button disabled={isLoading} variant="default" onClick={onClick}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
