import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getActiveVenues, getBookedDates, getBlockedDates } from '@/lib/queries'
import AdminCalendarClient from '@/components/admin/AdminCalendarClient'

export const metadata: Metadata = { title: 'Calendar — Admin' }

export default async function AdminCalendarPage() {
  const supabase = createSupabaseServerClient()
  const [venuesRes, bookedRes, blockedRes] = await Promise.all([
    getActiveVenues(),
    getBookedDates(),
    getBlockedDates(),
  ])

  const { data: profiles } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1)
  const adminId = profiles?.[0]?.id ?? ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-navy">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">View bookings and manage blocked dates</p>
      </div>
      <AdminCalendarClient
        venues={venuesRes.data ?? []}
        bookedDates={bookedRes.data ?? []}
        blockedDates={blockedRes.data ?? []}
        adminId={adminId}
      />
    </div>
  )
}
