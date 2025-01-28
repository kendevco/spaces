'use client'

import { addMember } from '@/spaces/actions/members'
import { toast } from '@/spaces/utilities/toast'

export const AddMemberButton = ({ userId, spaceId }: { userId: string; spaceId: string }) => {
  const handleAddMember = async () => {
    try {
      await addMember({ spaceId, userId, role: 'member' })
      toast.success('Member added successfully')
    } catch (error) {
      toast.error('Failed to add member')
    }
  }

  return <button onClick={handleAddMember}>Add Member</button>
}
