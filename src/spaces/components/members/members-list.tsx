"use client"

import { Member, User } from "@/payload-types"

interface MembersListProps {
  members: (Member & { user: User })[]
}

export const MembersList = ({
  members
}: MembersListProps) => {
  return (
    <div className="flex flex-col gap-y-2">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-x-2 p-2 rounded-md hover:bg-accent">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{member.user.name}</span>
            <span className="text-xs text-muted-foreground">{member.role}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
