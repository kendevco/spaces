import type { Metadata } from 'next'
import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { getServerSideURL } from '@/utilities/getURL'
import { isUserAdmin } from '@/spaces/access/isAdmin'
import { getCurrentUser } from '@/spaces/utilities/payload/getCurrentUser.server'

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const user = await getCurrentUser()
  const isAdminUser = user ? await isUserAdmin(user) : false

  if (isAdminUser) {
    return (
      <div className="flex min-h-screen flex-col">
        <AdminBar adminBarProps={{ preview: isEnabled }} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    )
  } else {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    )
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
