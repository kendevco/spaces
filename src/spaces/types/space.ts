export type TransformedSpace = {
  id: string
  name: string
  owner: { id: string; relationTo: 'users' }
  createdBy: { id: string; relationTo: 'users' }
  members?: { id: string; relationTo: 'members' }[]
  channels?: { id: string; relationTo: 'channels' }[]
  createdAt: string
  updatedAt: string
}
