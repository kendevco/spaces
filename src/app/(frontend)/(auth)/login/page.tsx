import type { Metadata } from 'next'
import React from 'react'
import { LoginForm } from './LoginForm'
import { redirect } from 'next/navigation'
import { getLoginPageData } from './actions'

export default async function Login() {
  const { user } = await getLoginPageData()

  if (user) {
    return redirect('/account')
  }

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
          Spaces
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Welcome back! Sign in to continue building amazing content and collaborating
              with your team.&rdquo;
            </p>
            <footer className="text-sm">Alex Chen</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to sign in to your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your account',
  openGraph: {
    title: 'Login',
    url: '/login',
  },
}
