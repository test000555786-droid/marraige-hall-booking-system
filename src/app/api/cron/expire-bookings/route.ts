import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { sendBookingExpiredEmail, createNotification } from '@/lib/notifications'
import type { BookingWithDetails } from '@/types/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Validate cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createSupabaseAdminClient()
    const now = new Date().toISOString()

    // Find all expired bookings (pending_payment past expiry time)
    const { data: expiredBookings } = await admin
      .from('bookings')
      .select('*, venue:venues(*), customer:profiles(*), payments(*)')
      .eq('status', 'pending_payment')
      .lt('expires_at', now)
      .is('deleted_at', null)

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({ data: { expired: 0, message: 'No bookings to expire' }, error: null })
    }

    let expiredCount = 0

    for (const booking of expiredBookings) {
      try {
        // Mark as expired
        await admin.from('bookings').update({ status: 'expired' }).eq('id', booking.id)

        const fullBooking = booking as BookingWithDetails

        // Send email and notification (non-blocking)
        await Promise.allSettled([
          sendBookingExpiredEmail(fullBooking),
          createNotification({
            userId: booking.customer_id,
            type: 'booking_expired',
            title: 'Booking Expired',
            message: `Your booking ${booking.booking_ref} for ${(booking.venue as { name?: string })?.name} on ${booking.event_date} has expired due to no payment.`,
            bookingId: booking.id,
          }),
        ])

        expiredCount++
      } catch (err) {
        console.error(`[CRON] Failed to expire booking ${booking.id}:`, err)
      }
    }

    console.log(`[CRON] Expired ${expiredCount} booking(s)`)

    revalidatePath('/availability')
    return NextResponse.json({
      data: { expired: expiredCount, message: `Expired ${expiredCount} booking(s)` },
      error: null,
    })
  } catch (err) {
    console.error('[CRON] Error:', err)
    return NextResponse.json({ data: null, error: 'Cron job failed' }, { status: 500 })
  }
}
