import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { getMeUser } from '@/utilities/getMeUser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import React from 'react'
import { AccountForm } from './AccountForm'

export const dynamic = 'force-dynamic'

export default async function Account() {
  const { user } = await getMeUser({
    nullUserRedirect: `/login?error=${encodeURIComponent(
      'You must be logged in to access your account.',
    )}&redirect=${encodeURIComponent('/account')}`,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account</h1>
          <p className="text-zinc-200">Manage your account settings and view your orders</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[250px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="space-y-4">
            <nav className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                asChild
              >
                <Link href="#profile">
                  <span>Profile Settings</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="hidden w-full justify-start text-white hover:bg-white/10"
                asChild
              >
                <Link href="#orders">
                  <span>Orders</span>
                </Link>
              </Button>
            </nav>
            <hr className="border-white/10" />
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
              asChild
            >
              <Link href="/logout">
                <span>Log out</span>
              </Link>
            </Button>
          </aside>

          {/* Main Content */}
          <main className="space-y-8">
            {/* Profile Section */}
            <section id="profile" className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-semibold text-white mb-6">Profile Settings</h2>
              <AccountForm />
            </section>

            {/* Orders Section */}
            <section id="orders" className="hidden bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-semibold text-white mb-4">Orders</h2>
              <p className="text-zinc-200 mb-6">
                View your order history and track current orders. Each order is associated with a
                payment intent.
              </p>
              <Button
                asChild
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Link href="/orders">View all orders</Link>
              </Button>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your account settings and view your orders.',
  openGraph: mergeOpenGraph({
    title: 'Account Settings',
    url: '/account',
  }),
}
