import type { Field } from 'payload'
import { MembersField } from './MembersField'

export const membersFieldConfig: Field = {
  name: 'members',
  type: 'array',
  fields: [],
  admin: {
    components: {
      Field: MembersField.Field as any,
      Cell: MembersField.Cell as any,
    },
  },
}
