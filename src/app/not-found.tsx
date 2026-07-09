import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream pt-16 text-center px-4">
      <p className="font-serif text-8xl font-bold text-gold">404</p>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-navy">Page Not Found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/"
          className="rounded-lg bg-gold px-8 py-3 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all"
        >
          Go to Homepage
        </Link>
        <Link
          href="/venues"
          className="rounded-lg border border-navy/20 px-8 py-3 font-semibold text-navy hover:border-gold hover:text-gold transition-all"
        >
          View Venues
        </Link>
      </div>
    </div>
  )
}
