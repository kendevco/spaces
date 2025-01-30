import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-foreground">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Return Home
      </Link>
    </div>
  )
}
