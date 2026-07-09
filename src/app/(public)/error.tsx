'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[PUBLIC] Page error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream pt-16">
      <div className="mx-auto max-w-md text-center px-4">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border border-red-200">
          <AlertTriangle size={36} className="text-red-500" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy">Something Went Wrong</h1>
        <p className="mt-3 text-muted-foreground">
          We're sorry — an unexpected error occurred. Please try again or contact us if the problem persists.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all"
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-navy/20 px-6 py-3 font-semibold text-navy hover:border-gold hover:text-gold transition-all"
          >
            Go Home
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && error.message && (
          <pre className="mt-6 rounded-lg bg-red-50 p-4 text-left text-xs text-red-700 overflow-auto border border-red-200">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  )
}
