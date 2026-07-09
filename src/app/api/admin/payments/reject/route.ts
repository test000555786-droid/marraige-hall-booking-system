import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { sendPaymentRejectedEmail, createNotification } from '@/lib/notifications'
import type { BookingWithDetails } from '@/types/database'

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const admin = createSupabaseAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { paymentId, bookingId, reason } = await req.json()
    if (!reason?.trim()) return NextResponse.json({ data: null, error: 'Rejection reason is required' }, { status: 400 })

    await admin.from('payments').update({ status: 'rejected', rejection_reason: reason }).eq('id', paymentId)
    await admin.from('bookings').update({ status: 'pending_payment' }).eq('id', bookingId)

    const { data: booking } = await admin.from('bookings').select('*, venue:venues(*), customer:profiles(*), payments(*)').eq('id', bookingId).single()
    if (booking) {
      const full = booking as BookingWithDetails
      await Promise.allSettled([
        sendPaymentRejectedEmail(full, reason),
        createNotification({ userId: booking.customer_id, type: 'payment_rejected', title: 'Payment Not Verified', message: `Your payment for ${booking.booking_ref} was not verified. Reason: ${reason}`, bookingId }),
      ])
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Failed to reject payment' }, { status: 500 })
  }
}
