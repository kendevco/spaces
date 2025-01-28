'use client'

import { LogoutForm } from './components/logout-form'

export default function LogoutPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7364c0] to-[#02264a]" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Spaces Network Terminal
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;In the vast digital expanse of the Spaces Network, every disconnection is but a
              temporary farewell. Your digital footprints remain in our quantum memory banks,
              awaiting your return to the infinite possibilities that lie ahead.&rdquo;
            </p>
            <footer className="text-sm">— The Spaces AI Collective</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <LogoutForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            System Status: All quantum circuits operational. Neural interface protocols standing by.
          </p>
        </div>
      </div>
    </div>
  )
}
