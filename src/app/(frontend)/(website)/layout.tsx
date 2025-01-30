import type { Metadata } from 'next'
import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { getServerSideURL } from '@/utilities/getURL'

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <div className="flex min-h-screen flex-col">
      <AdminBar adminBarProps={{ preview: isEnabled }} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
