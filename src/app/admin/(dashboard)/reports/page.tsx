import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getActiveVenues } from '@/lib/queries'
import AdminReportsClient from '@/components/admin/AdminReportsClient'

export const metadata: Metadata = { title: 'Reports — Admin' }

export default async function AdminReportsPage() {
  const supabase = createSupabaseServerClient()
  const { data: venues } = await getActiveVenues()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, booking_ref, customer_name, customer_email, venue_id, event_date, event_type, total_amount, advance_amount, status, created_at')
    .is('deleted_at', null)
    .gte('created_at', sixMonthsAgo.toISOString())
    .order('created_at', { ascending: false })

  // Top customers
  const customerMap: Record<string, { name: string; email: string; count: number; total: number }> = {}
  ;(bookings ?? []).filter((b) => ['confirmed', 'completed'].includes(b.status)).forEach((b) => {
    if (!customerMap[b.customer_email]) {
      customerMap[b.customer_email] = { name: b.customer_name, email: b.customer_email, count: 0, total: 0 }
    }
    customerMap[b.customer_email].count++
    customerMap[b.customer_email].total += b.total_amount
  })

  const topCustomers = Object.values(customerMap).sort((a, b) => b.total - a.total).slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-navy">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Revenue analytics, occupancy stats and booking insights</p>
      </div>
      <AdminReportsClient
        bookings={bookings ?? []}
        venues={venues ?? []}
        topCustomers={topCustomers}
      />
    </div>
  )
}
