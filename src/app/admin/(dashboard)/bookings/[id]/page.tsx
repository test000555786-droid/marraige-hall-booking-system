import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getBookingByIdAdmin } from '@/lib/queries'
import AdminBookingDetailClient from '@/components/admin/AdminBookingDetailClient'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return { title: `Booking Detail — Admin` }
}

export default async function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  const { data: booking, error } = await getBookingByIdAdmin(params.id)
  if (error || !booking) notFound()

  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const { data: settings } = await supabase.from('hall_settings').select('key,value')
  const settingsMap = (settings ?? []).reduce<Record<string, string>>((a, r) => { a[r.key] = r.value; return a }, {})

  return (
    <div className="space-y-6">
      <div>
        <a href="/admin/bookings" className="text-sm text-muted-foreground hover:text-gold transition-colors">← All Bookings</a>
        <h1 className="mt-1 font-serif text-2xl font-bold text-navy">{booking.booking_ref}</h1>
      </div>
      <AdminBookingDetailClient booking={booking} settings={settingsMap} adminId={session?.user.id ?? ''} />
    </div>
  )
}
