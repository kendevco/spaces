'use client'

import { useEffect, useState } from 'react'

import { EditSpaceModal } from '@/spaces/modals/edit-space-modal'
import { InviteModal } from '@/spaces/modals/invite-modal'
import { CreateSpaceModal } from '@/spaces/modals/create-space-modal'
import { MembersModal } from '@/spaces/modals/members-modal'
import { CreateChannelModal } from '@/spaces/modals/create-channel-modal'
import { LeaveSpaceModal } from '@/spaces/modals/leave-space-modal'
import { DeleteSpaceModal } from '@/spaces/modals/delete-space-modal'
import { DeleteChannelModal } from '@/spaces/modals/delete-channel-modal'
import { EditChannelModal } from '@/spaces/modals/edit-channel-modal'
import { MessageFileModal } from '@/spaces/modals/message-file-modal'
import { DeleteMessageModal } from '@/spaces/modals/delete-message-modal'

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      {children}
      <CreateSpaceModal />
      <InviteModal />
      <EditSpaceModal />
      <MembersModal />
      <CreateChannelModal />
      <LeaveSpaceModal />
      <DeleteSpaceModal />
      <DeleteChannelModal />
      <EditChannelModal />
      <MessageFileModal />
      <DeleteMessageModal />
    </>
  )
}
