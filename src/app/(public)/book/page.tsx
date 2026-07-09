import type { Metadata } from 'next'
import { getActiveVenues, getHallSettings } from '@/lib/queries'
import BookingWizard from '@/components/booking/BookingWizard'

export const metadata: Metadata = {
  title: 'Book a Venue',
  description: 'Book your preferred marriage hall online. Check availability, choose your date, and complete payment in minutes.',
}

export const revalidate = 3600

export default async function BookPage({
  searchParams,
}: {
  searchParams: { venueId?: string; date?: string }
}) {
  const [venuesRes, settings] = await Promise.all([
    getActiveVenues(),
    getHallSettings(),
  ])

  const venues = venuesRes.data ?? []

  return (
    <div className="min-h-screen bg-cream pt-20 pb-16">
      <div className="container max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">Book Your Venue</p>
          <h1 className="mt-1 font-serif text-display-sm text-navy">Complete Your Booking</h1>
          <p className="mt-2 text-muted-foreground">Secure your date in just 4 simple steps</p>
        </div>
        <BookingWizard
          venues={venues}
          settings={settings}
          defaultVenueId={searchParams.venueId}
          defaultDate={searchParams.date}
        />
      </div>
    </div>
  )
}
