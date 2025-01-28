'use client'

import { track } from '@vercel/analytics'
import { Check, Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { useModal } from '@/spaces/hooks/use-modal-store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useOrigin } from '@/spaces/hooks/use-origin'
import { inviteService } from '@/spaces/services/invite'
import { ModalType } from '@/spaces/types'

export const InviteModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal()
  const origin = useOrigin()

  const isModalOpen = isOpen && type === ModalType.INVITE

  const { space } = data

  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const inviteUrl = `${origin}/invite/${space?.inviteCode}`

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  const onNew = async () => {
    try {
      setIsLoading(true)
      if (!space?.id) throw new Error('Space ID required')

      const updatedSpace = await inviteService.generateNewInviteCode(space.id)
      if (updatedSpace) {
        onOpen(ModalType.INVITE, { space: updatedSpace })
      }
    } catch (error) {
      console.error('[INVITE_MODAL]', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    track('Invite Modal Closed')
    onClose()
  }

  const handleCopy = () => {
    if (space?.id) {
      track('Invite Link Copied', { spaceId: space.id })
    }
    onCopy()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden mx-4">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Invite Friends</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label
            className="uppercase text-xs font-bold
                        text-zinc-500 dark:text-secondary/70"
          >
            Space Invite Link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={isLoading}
              className="bg-zinc-300/50 border-0
                            focus-visible:ring-0 text-black
                            focus-visible:ring-offset-0 w-full"
              value={inviteUrl}
            />
            <Button onClick={handleCopy} variant="ghost" size="icon" disabled={isLoading}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={onNew}
            disabled={isLoading}
            variant="link"
            size="sm"
            className="text-xs text-zinc-500 mt-4"
          >
            Generate a new link
            <RefreshCw className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
