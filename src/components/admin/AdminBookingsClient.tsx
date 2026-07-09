'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { exportToCSV, formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, EVENT_TYPE_LABELS } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { BookingWithDetails } from '@/types/database'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'expired', label: 'Expired' },
]

interface Props {
  bookings: BookingWithDetails[]
  total: number
  page: number
  venues: { id: string; name: string }[]
}

export default function AdminBookingsClient({ bookings: initial, total, page, venues }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState(initial)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [isPending, startTransition] = useTransition()
  const totalPages = Math.ceil(total / 20)

  // Realtime sync
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const channel = supabase.channel('admin-bookings-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        router.refresh()
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [router])

  useEffect(() => { setBookings(initial) }, [initial])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    params.delete('page')
    startTransition(() => router.push(`/admin/bookings?${params.toString()}`))
  }

  const handleExport = () => {
    const rows = bookings.map((b) => ({
      'Ref': b.booking_ref,
      'Customer': b.customer_name,
      'Phone': b.customer_phone,
      'Email': b.customer_email,
      'Venue': b.venue?.name ?? '',
      'Date': b.event_date,
      'Event': EVENT_TYPE_LABELS[b.event_type],
      'Guests': b.guest_count,
      'Total': b.total_amount,
      'Advance': b.advance_amount,
      'Status': BOOKING_STATUS_LABELS[b.status],
      'Created': formatDate(b.created_at),
    }))
    exportToCSV(rows, `bookings-${new Date().toISOString().split('T')[0]}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search ref, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateParam('search', search)}
            className="w-full rounded-lg border border-cream-500 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <select onChange={(e) => updateParam('status', e.target.value)} defaultValue={searchParams.get('status') ?? ''} className="rounded-lg border border-cream-500 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
          {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select onChange={(e) => updateParam('venueId', e.target.value)} defaultValue={searchParams.get('venueId') ?? ''} className="rounded-lg border border-cream-500 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
          <option value="">All Venues</option>
          {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-cream-500 bg-white px-4 py-2.5 text-sm font-medium text-navy hover:border-gold hover:text-gold transition-all">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-cream-500 bg-white shadow-sm">
        {bookings.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Admin bookings table">
              <thead className="border-b border-cream-500 bg-cream">
                <tr>
                  {['Ref', 'Customer', 'Venue', 'Date', 'Event', 'Amount', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-400">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-cream/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-navy">{b.booking_ref}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-navy">{b.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{b.customer_phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-navy">{b.venue?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-navy whitespace-nowrap">{formatDate(b.event_date)}</td>
                    <td className="px-5 py-3.5 text-navy">{EVENT_TYPE_LABELS[b.event_type]}</td>
                    <td className="px-5 py-3.5 font-medium text-gold">{formatCurrency(b.total_amount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[b.status]}`}>
                        {BOOKING_STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/bookings/${b.id}`} className="font-medium text-gold hover:underline whitespace-nowrap">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Link href={`/admin/bookings?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}`} className={`flex items-center gap-1 rounded-lg border border-cream-500 px-3 py-2 text-sm ${page <= 1 ? 'pointer-events-none opacity-40' : 'hover:border-gold hover:text-gold'}`}><ChevronLeft size={14} /> Prev</Link>
            <Link href={`/admin/bookings?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}`} className={`flex items-center gap-1 rounded-lg border border-cream-500 px-3 py-2 text-sm ${page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:border-gold hover:text-gold'}`}>Next <ChevronRight size={14} /></Link>
          </div>
        </div>
      )}
    </div>
  )
}
