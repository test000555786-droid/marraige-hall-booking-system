import { Suspense } from 'react'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateLong, EVENT_TYPE_LABELS, BOOKING_STATUS_LABELS } from '@/lib/utils'
import { CheckCircle2, Download, Calendar, ArrowRight } from 'lucide-react'

async function ConfirmationContent({ ref: bookingRef }: { ref: string }) {
  const supabase = createSupabaseServerClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, venue:venues(*)')
    .eq('booking_ref', bookingRef)
    .single()

  if (!booking) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Booking not found. Please check your email for confirmation details.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 border-4 border-green-200">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-navy">Booking Submitted!</h1>
        <p className="mt-2 text-muted-foreground">
          {booking.status === 'pending_payment'
            ? 'Your booking is pending. Please make payment to confirm.'
            : 'Your payment is under review. You\'ll receive confirmation shortly.'}
        </p>
      </div>

      <div className="rounded-2xl border border-cream-500 bg-white p-6 shadow-sm mb-6">
        <div className="mb-4 rounded-lg bg-gold/10 border border-gold/20 p-3 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Booking Reference</p>
          <p className="font-mono text-2xl font-bold text-gold mt-0.5">{booking.booking_ref}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Venue</span><span className="font-medium text-navy">{(booking as { venue?: { name?: string } }).venue?.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium text-navy">{formatDateLong(booking.event_date)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Event</span><span className="font-medium text-navy">{EVENT_TYPE_LABELS[booking.event_type]}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="font-medium text-navy">{booking.guest_count.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between border-t border-cream-400 pt-3"><span className="text-muted-foreground">Advance Paid</span><span className="font-bold text-gold">{formatCurrency(booking.advance_amount)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-navy">{BOOKING_STATUS_LABELS[booking.status]}</span></div>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-6">
        <p className="text-sm text-blue-800">
          📧 A confirmation email has been sent to <strong>{booking.customer_email}</strong>. Keep your booking reference <strong>{booking.booking_ref}</strong> handy.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/bookings" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold py-3 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all">
          <Calendar size={16} /> My Bookings
        </Link>
        <Link href="/" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-navy/20 py-3 font-semibold text-navy hover:border-gold hover:text-gold transition-all">
          Go to Home <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export default function BookingConfirmPage({ searchParams }: { searchParams: { ref?: string } }) {
  if (!searchParams.ref) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-muted-foreground">No booking reference found.</p>
          <Link href="/" className="mt-4 inline-block text-gold underline">Go home</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="container">
        <Suspense fallback={<div className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>}>
          <ConfirmationContent ref={searchParams.ref} />
        </Suspense>
      </div>
    </div>
  )
}
