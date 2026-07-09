import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Shubh Vivah Marriage Hall — Hyderabad',
    template: '%s | Shubh Vivah Marriage Hall',
  },
  description:
    'Book Hyderabad\'s premier marriage hall. Three stunning venues for weddings, receptions, and engagements. Online booking with instant confirmation.',
  keywords: ['marriage hall', 'wedding venue', 'banquet hall', 'Hyderabad', 'book online'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Shubh Vivah Marriage Hall',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-cream font-sans antialiased">
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-inter)',
            },
          }}
        />
      </body>
    </html>
  )
}
