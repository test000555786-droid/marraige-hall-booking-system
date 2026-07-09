import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllBookingsAdmin } from '@/lib/queries'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, EVENT_TYPE_LABELS } from '@/lib/utils'
import AdminBookingsClient from '@/components/admin/AdminBookingsClient'

export const metadata: Metadata = { title: 'Bookings — Admin' }

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; venueId?: string; search?: string; page?: string }
}) {
  const supabase = createSupabaseServerClient()
  const { data: venues } = await supabase.from('venues').select('id, name').order('display_order')

  const page = parseInt(searchParams.page ?? '1')
  const { data } = await getAllBookingsAdmin({
    status: searchParams.status,
    venueId: searchParams.venueId,
    search: searchParams.search,
    page,
    limit: 20,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">All Bookings</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} total bookings</p>
        </div>
        <Link href="/admin/bookings/create" className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all">
          + Create Booking
        </Link>
      </div>
      <AdminBookingsClient
        bookings={data?.bookings ?? []}
        total={data?.total ?? 0}
        page={page}
        venues={venues ?? []}
      />
    </div>
  )
}
