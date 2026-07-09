import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCustomerBookings } from '@/lib/queries'
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, EVENT_TYPE_LABELS } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

export const metadata: Metadata = { title: 'My Bookings' }

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: bookings } = await getCustomerBookings(session.user.id)
  const allBookings = bookings ?? []

  const filtered = searchParams.status
    ? allBookings.filter((b) => b.status === searchParams.status)
    : allBookings

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'pending_verification', label: 'Awaiting Verification' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">My Bookings</h1>
          <p className="text-sm text-muted-foreground">{allBookings.length} total bookings</p>
        </div>
        <Link href="/book" className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all">
          <CalendarDays size={16} /> New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter bookings by status">
        {statusFilters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/bookings?status=${f.value}` : '/bookings'}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
              (searchParams.status || '') === f.value
                ? 'bg-navy text-gold border-navy'
                : 'bg-white text-navy border-cream-500 hover:border-gold hover:text-gold'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-cream-500 bg-white p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No bookings found.</p>
          <Link href="/book" className="mt-4 inline-block rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-navy">Book a Venue</Link>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-4 lg:hidden">
            {filtered.map((b) => (
              <div key={b.id} className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-navy">{b.booking_ref}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{(b as { venue?: { name?: string } }).venue?.name}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${BOOKING_STATUS_COLORS[b.status]}`}>
                    {BOOKING_STATUS_LABELS[b.status]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div><p className="text-muted-foreground">Date</p><p className="font-medium text-navy">{formatDate(b.event_date)}</p></div>
                  <div><p className="text-muted-foreground">Event</p><p className="font-medium text-navy">{EVENT_TYPE_LABELS[b.event_type]}</p></div>
                  <div><p className="text-muted-foreground">Guests</p><p className="font-medium text-navy">{b.guest_count.toLocaleString('en-IN')}</p></div>
                  <div><p className="text-muted-foreground">Advance</p><p className="font-medium text-gold">{formatCurrency(b.advance_amount)}</p></div>
                </div>
                <Link href={`/bookings/${b.booking_ref}`} className="block w-full rounded-lg border border-navy/20 py-2 text-center text-sm font-medium text-navy hover:border-gold hover:text-gold transition-all">
                  View Details →
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-cream-500 bg-white shadow-sm">
            <table className="w-full text-sm" aria-label="My bookings">
              <thead className="border-b border-cream-500 bg-cream">
                <tr>
                  {['Reference', 'Venue', 'Date', 'Event', 'Guests', 'Advance', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-400">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-navy">{b.booking_ref}</td>
                    <td className="px-5 py-4 text-navy">{(b as { venue?: { name?: string } }).venue?.name}</td>
                    <td className="px-5 py-4 text-navy">{formatDate(b.event_date)}</td>
                    <td className="px-5 py-4 text-navy">{EVENT_TYPE_LABELS[b.event_type]}</td>
                    <td className="px-5 py-4 text-navy">{b.guest_count.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 font-medium text-gold">{formatCurrency(b.advance_amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${BOOKING_STATUS_COLORS[b.status]}`}>
                        {BOOKING_STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/bookings/${b.booking_ref}`} className="font-medium text-gold hover:underline">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
