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
import { Button } from '@/components/ui/button'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { channelService } from '@/spaces/services/channels'
import { ModalType } from '@/spaces/types'

export const DeleteChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const router = useRouter()
  const isModalOpen = isOpen && type === ModalType.DELETE_CHANNEL
  const { channel, space } = data
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)
      if (!channel?.id) throw new Error('Channel ID is required')

      const result = await channelService.deleteChannel(channel.id)
      if (!result) throw new Error('Failed to delete channel')

      toast.success('Channel deleted successfully')
      onClose()
      router.refresh()
      router.push(`/spaces/${space?.id}`)
    } catch (error) {
      console.error('[DELETE_CHANNEL_MODAL]', error)
      toast.error('Failed to delete channel')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Delete Channel</DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this? <br />
            <span className="text-indigo-500 font-semibold">#{channel?.name}</span> will be
            permanently deleted.
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
