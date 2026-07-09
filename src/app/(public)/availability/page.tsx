import type { Metadata } from 'next'
import { getActiveVenues, getBookedDates, getBlockedDates } from '@/lib/queries'
import AvailabilityCalendar from '@/components/public/AvailabilityCalendar'

export const metadata: Metadata = {
  title: 'Check Availability',
  description: 'Check availability of our wedding halls by date and venue. Green dates are open, red dates are booked.',
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: { venueId?: string }
}) {
  const [venuesRes, bookedRes, blockedRes] = await Promise.all([
    getActiveVenues(),
    getBookedDates(),
    getBlockedDates(),
  ])

  const venues = venuesRes.data ?? []
  const bookedDates = bookedRes.data ?? []
  const blockedDates = blockedRes.data ?? []

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-64 items-center justify-center overflow-hidden bg-navy pt-16">
        <div className="relative z-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">
            Check Availability
          </p>
          <h1 className="font-serif text-display-md text-cream-100">Availability Calendar</h1>
          <p className="mt-3 text-cream-300/70">
            Green = Available &nbsp;·&nbsp; Red = Booked &nbsp;·&nbsp; Grey = Blocked
          </p>
        </div>
      </section>

      <section className="bg-cream py-12 lg:py-20">
        <div className="container max-w-5xl">
          <AvailabilityCalendar
            venues={venues}
            bookedDates={bookedDates}
            blockedDates={blockedDates}
            defaultVenueId={searchParams.venueId}
          />
        </div>
      </section>
    </>
  )
}
