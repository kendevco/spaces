import React from 'react'
import Link from 'next/link'
import { CreateAccountForm } from './CreateAccountForm'

const CreateAccountViewComponent: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/admin" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your account
            </Link>
          </p>
        </div>
        <CreateAccountForm />
      </div>
    </div>
  )
}

export default CreateAccountViewComponent
