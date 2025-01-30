import './globals.css'
import '@/app/(frontend)/globals.css'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { cn } from '@/utilities/ui'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { Providers } from '@/providers'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
