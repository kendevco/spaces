'use client'

import Link from 'next/link'

export default function Error500() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">500 - Server Error</h1>
      <p className="mt-2 text-lg text-gray-600">Something went wrong on our end.</p>
      <Link href="/" className="mt-4 text-blue-600 hover:text-blue-800">
        Return Home
      </Link>
    </div>
  )
}
