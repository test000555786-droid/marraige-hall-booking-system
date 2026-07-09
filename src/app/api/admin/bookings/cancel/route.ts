import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { sendBookingCancelledEmail, createNotification } from '@/lib/notifications'
import type { BookingWithDetails } from '@/types/database'

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const admin = createSupabaseAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { bookingId, reason, adminId } = await req.json()

    await admin.from('bookings').update({
      status: 'cancelled',
      cancelled_by: adminId ?? session.user.id,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || 'Cancelled by admin',
    }).eq('id', bookingId)

    const { data: booking } = await admin.from('bookings').select('*, venue:venues(*), customer:profiles(*), payments(*)').eq('id', bookingId).single()

    if (booking) {
      await Promise.allSettled([
        sendBookingCancelledEmail(booking as BookingWithDetails),
        createNotification({ userId: booking.customer_id, type: 'booking_cancelled', title: 'Booking Cancelled', message: `Your booking ${booking.booking_ref} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`, bookingId }),
      ])
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to cancel booking' }, { status: 500 })
  }
}
