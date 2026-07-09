// src/app/api/bookings/[id]/cancel/route.ts
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { sendBookingCancelledEmail, createNotification } from '@/lib/notifications'
import type { BookingWithDetails } from '@/types/database'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()
    const admin = createSupabaseAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { data: booking } = await admin.from('bookings').select('*, venue:venues(*), customer:profiles(*), payments(*)').eq('id', params.id).eq('customer_id', session.user.id).single()
    if (!booking) return NextResponse.json({ data: null, error: 'Booking not found' }, { status: 404 })
    if (!['pending_payment', 'pending_verification'].includes(booking.status)) {
      return NextResponse.json({ data: null, error: 'This booking cannot be cancelled' }, { status: 400 })
    }

    await admin.from('bookings').update({
      status: 'cancelled',
      cancelled_by: session.user.id,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: 'Cancelled by customer',
    }).eq('id', params.id)

    const fullBooking = { ...booking, venue: booking.venue, customer: booking.customer, payments: booking.payments } as BookingWithDetails
    await Promise.allSettled([
      sendBookingCancelledEmail(fullBooking),
      createNotification({ userId: session.user.id, type: 'booking_cancelled', title: 'Booking Cancelled', message: `Your booking ${booking.booking_ref} has been cancelled.`, bookingId: booking.id }),
    ])

    revalidatePath('/availability')
    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Failed to cancel booking' }, { status: 500 })
  }
}
