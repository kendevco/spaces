import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { checkSession } from '@/spaces/utilities/auth/checkSession'
import { SpaceSettingsContent } from './components/space-settings-content'
import type { Space, Member } from '@/payload-types'

interface PageProps {
  params: Promise<{
    spaceId: string
  }>
}

export default async function SettingsPage({ params }: PageProps) {
  const { spaceId } = await params
  const user = await checkSession()

  if (!user) {
    return redirect('/login')
  }

  try {
    const payload = await getPayloadClient()
    const [space, member] = await Promise.all([
      payload.find({
        collection: 'spaces',
        where: {
          id: { equals: spaceId },
        },
        depth: 1,
      }),
      payload.find({
        collection: 'members',
        where: {
          space: { equals: spaceId },
          user: { equals: user.id },
        },
        depth: 2,
      }),
    ])

    if (!space.docs.length || !member.docs.length) {
      return redirect('/')
    }

    const spaceDoc = space.docs[0] as Space
    const memberDoc = member.docs[0] as Member

    const isAdmin = memberDoc.role === 'admin'

    if (!isAdmin) {
      return redirect(`/spaces/${spaceId}`)
    }

    return <SpaceSettingsContent space={spaceDoc} />
  } catch (error) {
    console.error('Error in settings page:', error)
    return redirect('/')
  }
}
