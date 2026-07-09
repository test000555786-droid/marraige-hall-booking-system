import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getBookingByRef } from '@/lib/queries'
import BookingDetailTabs from '@/components/customer/BookingDetailTabs'

export async function generateMetadata({ params }: { params: { ref: string } }): Promise<Metadata> {
  return { title: `Booking ${params.ref}` }
}

export default async function BookingDetailPage({ params }: { params: { ref: string } }) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: booking, error } = await getBookingByRef(params.ref, session.user.id)
  if (error || !booking) notFound()

  const { data: settings } = await supabase.from('hall_settings').select('key,value')
  const settingsMap = (settings ?? []).reduce<Record<string, string>>((a, r) => { a[r.key] = r.value; return a }, {})

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <a href="/bookings" className="hover:text-gold transition-colors">My Bookings</a> › {params.ref}
        </p>
        <h1 className="mt-1 font-serif text-2xl font-bold text-navy">Booking {params.ref}</h1>
      </div>
      <BookingDetailTabs booking={booking} settings={settingsMap} currentUserId={session.user.id} />
    </div>
  )
}
