import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { MemberRole } from '@/spaces/types'
import { Member, User } from '@/payload-types'
import { getMeUser } from '@/utilities/getMeUser'
import { MembersList } from '@/spaces/components/members/members-list'

interface PageProps {
  params: Promise<{
    spaceId: string
  }>
}

export default async function MembersPage({ params }: PageProps) {
  const { spaceId } = await params
  const { user } = await getMeUser({
    nullUserRedirect: '/login',
  })

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
          user: user ? { equals: user.id } : { equals: '' },
        },
        depth: 2,
      }),
    ])

    if (!space.docs.length || !member.docs.length) {
      return redirect('/')
    }

    const spaceDoc = space.docs[0]
    const memberDoc = member.docs[0] as Member

    const isAdmin = memberDoc.role === 'admin'

    if (!isAdmin) {
      return redirect(`/spaces/${spaceId}`)
    }

    const members = await payload.find({
      collection: 'members',
      where: {
        space: { equals: spaceId },
      },
      depth: 2,
    })

    const transformedMembers = members.docs
      .map((member) => {
        const user = typeof member.user === 'string' ? null : member.user
        if (!user) return null
        return {
          ...member,
          user,
        }
      })
      .filter((member): member is Member & { user: User } => member !== null)

    if (!user?.id) {
      redirect('/login')
    }

    return (
      <div className="flex flex-col h-full">
        <MembersList members={transformedMembers} />
      </div>
    )
  } catch (error) {
    console.error('Error in members page:', error)
    return redirect('/')
  }
}
