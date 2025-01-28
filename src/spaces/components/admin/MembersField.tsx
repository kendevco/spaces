'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import type { Member, User } from '../../../payload-types'

interface Props {
  path: string
  value?: Member[]
}

const Field = (props: Props) => {
  const { value } = useField<Member[]>({ path: props.path })

  if (!value) return null

  return (
    <div className="field-type">
      {Array.isArray(value) && value.map((member, i) => {
        const memberUser = member.user as User
        return (
          <div key={i} className="field-type text">
            {`${memberUser?.email || 'Unknown'} (${member?.role || 'member'})`}
          </div>
        )
      })}
    </div>
  )
}

const Cell = (props: { cellData: Member }) => {
  const memberUser = props.cellData.user as User
  return (
    <div className="field-type text">
      {memberUser?.email || 'Unknown'}
    </div>
  )
}

export const MembersField = { Field, Cell }
