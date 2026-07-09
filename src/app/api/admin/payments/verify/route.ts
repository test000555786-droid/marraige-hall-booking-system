// src/app/api/admin/payments/verify/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { sendBookingConfirmedEmail, createNotification } from '@/lib/notifications'
import type { BookingWithDetails } from '@/types/database'

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const admin = createSupabaseAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { paymentId, bookingId } = await req.json()

    await admin.from('payments').update({ status: 'verified', verified_by: session.user.id, verified_at: new Date().toISOString() }).eq('id', paymentId)
    await admin.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId)

    const { data: booking } = await admin.from('bookings').select('*, venue:venues(*), customer:profiles(*), payments(*)').eq('id', bookingId).single()
    if (booking) {
      const full = booking as BookingWithDetails
      await Promise.allSettled([
        sendBookingConfirmedEmail(full),
        createNotification({ userId: booking.customer_id, type: 'booking_confirmed', title: 'Booking Confirmed!', message: `Your booking ${booking.booking_ref} has been confirmed.`, bookingId }),
      ])
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Failed to verify payment' }, { status: 500 })
  }
}
