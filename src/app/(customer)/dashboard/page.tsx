import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCustomerBookings } from '@/lib/queries'
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, EVENT_TYPE_LABELS } from '@/lib/utils'
import { CalendarDays, Clock, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  const { data: bookings } = await getCustomerBookings(session.user.id)

  const allBookings = bookings ?? []
  const upcoming = allBookings.filter((b) => b.status === 'confirmed' && new Date(b.event_date) >= new Date())
  const pending = allBookings.filter((b) => ['pending_payment', 'pending_verification'].includes(b.status))
  const confirmed = allBookings.filter((b) => b.status === 'confirmed')
  const totalSpent = allBookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.advance_amount, 0)
  const recent = allBookings.slice(0, 5)

  const stats = [
    { label: 'Total Bookings', value: allBookings.length, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Upcoming Events', value: upcoming.length, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Confirmed', value: confirmed.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Amount Paid', value: formatCurrency(totalSpent), icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-navy">Welcome back, {profile?.full_name?.split(' ')[0] || 'Guest'}!</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Here's an overview of your bookings</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className={`mt-1 font-serif text-2xl font-bold ${color}`}>{value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${bg}`}>
                <Icon size={20} className={color} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending actions */}
      {pending.length > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="font-semibold text-yellow-800 mb-3">⚠️ Action Required ({pending.length})</h2>
          <div className="space-y-2">
            {pending.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg bg-white border border-yellow-200 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-navy">{b.booking_ref}</p>
                  <p className="text-xs text-muted-foreground">{(b as { venue?: { name?: string } }).venue?.name} · {formatDate(b.event_date)}</p>
                </div>
                <Link href={`/bookings/${b.booking_ref}`} className="text-xs font-medium text-gold hover:underline">
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent bookings */}
      <div className="rounded-2xl border border-cream-500 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-cream-500 px-6 py-4">
          <h2 className="font-serif text-lg font-semibold text-navy">Recent Bookings</h2>
          <Link href="/bookings" className="flex items-center gap-1 text-sm font-medium text-gold hover:text-gold-600 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No bookings yet.</p>
            <Link href="/book" className="mt-3 inline-block rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-navy">Book a Venue</Link>
          </div>
        ) : (
          <div className="divide-y divide-cream-400">
            {recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-6 py-4 hover:bg-cream/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-navy text-sm">{b.booking_ref}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[b.status]}`}>
                      {BOOKING_STATUS_LABELS[b.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(b as { venue?: { name?: string } }).venue?.name} · {EVENT_TYPE_LABELS[b.event_type]} · {formatDate(b.event_date)}
                  </p>
                </div>
                <Link href={`/bookings/${b.booking_ref}`} className="ml-4 shrink-0 text-xs font-medium text-gold hover:underline">
                  Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
