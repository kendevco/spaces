import type { Metadata } from 'next'
import { getMeUser } from '@/utilities/getMeUser'
import { CreateAccountForm } from '@/components/admin/CreateAccount/CreateAccountForm'

export default async function CreateAccountPage() {
  await getMeUser({
    validUserRedirect: `/account?warning=${encodeURIComponent('You are already logged in.')}`,
  })

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
              &ldquo;Join our community of creators and start building amazing content today. Get
              started in minutes with our intuitive platform.&rdquo;
            </p>
            <footer className="text-sm">Alex Chen</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <CreateAccountForm />
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create an account to get started.',
  openGraph: {
    title: 'Create Account',
    url: '/create-account',
  },
}
