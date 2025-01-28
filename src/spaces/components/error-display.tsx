import Link from 'next/link'

interface ErrorDisplayProps {
  message: string
  error: Error | unknown
}

export function ErrorDisplay({ message, error }: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{message}</h1>
        <p className="text-gray-600">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Link href="/spaces" className="text-blue-500 hover:text-blue-600 mt-4 inline-block">
          Try Again
        </Link>
      </div>
    </div>
  )
} 