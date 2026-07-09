import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { calculatePricing } from '@/lib/utils'
import {
  sendBookingReceivedEmail,
  sendAdminNewBookingEmail,
  createNotification,
} from '@/lib/notifications'
import type { BookingWithDetails } from '@/types/database'

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const admin = createSupabaseAdminClient()

    // Auth check
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ data: null, error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const venueId = formData.get('venueId') as string
    const eventDate = formData.get('eventDate') as string
    const customerName = formData.get('customerName') as string
    const customerPhone = formData.get('customerPhone') as string
    const customerEmail = formData.get('customerEmail') as string
    const eventType = formData.get('eventType') as string
    const guestCount = parseInt(formData.get('guestCount') as string)
    const notes = formData.get('notes') as string
    const paymentMethod = formData.get('paymentMethod') as 'upi' | 'cash'
    const transactionId = formData.get('transactionId') as string | null
    const screenshotFile = formData.get('screenshot') as File | null

    // Validate required fields
    if (!venueId || !eventDate || !customerName || !customerPhone || !customerEmail || !eventType || !guestCount) {
      return NextResponse.json({ data: null, error: 'Missing required fields' }, { status: 400 })
    }

    // Get venue and settings
    const [venueRes, settingsRes] = await Promise.all([
      admin.from('venues').select('*').eq('id', venueId).single(),
      admin.from('hall_settings').select('key, value'),
    ])

    if (venueRes.error || !venueRes.data) {
      return NextResponse.json({ data: null, error: 'Venue not found' }, { status: 404 })
    }

    const venue = venueRes.data
    const settingsMap = (settingsRes.data ?? []).reduce<Record<string, string>>((a, r) => { a[r.key] = r.value; return a }, {})
    const advancePct = parseInt(settingsMap.advance_payment_percent ?? '30')
    const expiryHours = parseInt(settingsMap.booking_expiry_hours ?? '24')
    const adminEmail = settingsMap.admin_notification_email ?? ''

    // Final conflict check (race condition guard — DB constraint will also catch this)
    const { data: existingBooking } = await admin
      .from('bookings')
      .select('id')
      .eq('venue_id', venueId)
      .eq('event_date', eventDate)
      .is('deleted_at', null)
      .not('status', 'in', '("cancelled","rejected","expired")')
      .limit(1)
      .single()

    if (existingBooking) {
      return NextResponse.json({ data: null, error: 'This date has just been booked by someone else. Please choose another date.' }, { status: 409 })
    }

    // Check blocked dates
    const { data: blocked } = await admin
      .from('blocked_dates')
      .select('id')
      .eq('blocked_date', eventDate)
      .or(`venue_id.eq.${venueId},venue_id.is.null`)
      .limit(1)

    if (blocked && blocked.length > 0) {
      return NextResponse.json({ data: null, error: 'This date has been blocked. Please choose another date.' }, { status: 409 })
    }

    const pricing = calculatePricing(venue.price_per_day, advancePct)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expiryHours)

    // Create booking
    const { data: booking, error: bookingErr } = await admin
      .from('bookings')
      .insert({
        customer_id: session.user.id,
        venue_id: venueId,
        event_date: eventDate,
        event_type: eventType as never,
        guest_count: guestCount,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        status: paymentMethod === 'cash' ? 'pending_payment' : 'pending_verification',
        base_price: pricing.basePrice,
        advance_amount: pricing.advanceAmount,
        total_amount: pricing.totalAmount,
        notes: notes || null,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (bookingErr) {
      // Handle unique constraint violation (race condition fallback)
      if (bookingErr.code === '23505') {
        return NextResponse.json({ data: null, error: 'This date was just booked. Please choose another date.' }, { status: 409 })
      }
      throw new Error(bookingErr.message)
    }

    // Handle screenshot upload (UPI)
    let screenshotUrl: string | null = null
    if (paymentMethod === 'upi' && screenshotFile && screenshotFile.size > 0) {
      const ext = screenshotFile.type.split('/')[1]
      const path = `payments/${booking.id}/${Date.now()}.${ext}`

      // Retry upload up to 3 times
      let uploadErr: Error | null = null
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error } = await admin.storage
          .from('payment-screenshots')
          .upload(path, screenshotFile, { contentType: screenshotFile.type, upsert: true })
        if (!error) {
          const { data: urlData } = admin.storage.from('payment-screenshots').getPublicUrl(path)
          screenshotUrl = urlData.publicUrl
          uploadErr = null
          break
        }
        uploadErr = new Error(error.message)
      }
      if (uploadErr) console.error('[BOOKING] Screenshot upload failed after 3 attempts:', uploadErr)
    }

    // Create payment record
    if (paymentMethod === 'upi' || paymentMethod === 'cash') {
      await admin.from('payments').insert({
        booking_id: booking.id,
        customer_id: session.user.id,
        method: paymentMethod,
        amount: pricing.advanceAmount,
        transaction_id: transactionId || null,
        screenshot_url: screenshotUrl,
        status: paymentMethod === 'cash' ? 'pending' : 'pending',
      })
    }

    // Fetch full booking with relations for emails
    const { data: fullBooking } = await admin
      .from('bookings')
      .select('*, venue:venues(*), customer:profiles(*), payments(*)')
      .eq('id', booking.id)
      .single()

    if (fullBooking) {
      const bookingWithDetails = fullBooking as BookingWithDetails
      // Notifications (non-blocking)
      await Promise.allSettled([
        sendBookingReceivedEmail(bookingWithDetails),
        adminEmail ? sendAdminNewBookingEmail(bookingWithDetails, adminEmail) : Promise.resolve(),
        createNotification({
          userId: session.user.id,
          type: 'booking_received',
          title: 'Booking Submitted',
          message: `Your booking ${booking.booking_ref} for ${venue.name} on ${eventDate} has been received.`,
          bookingId: booking.id,
        }),
      ])
    }

    revalidatePath('/availability')
    return NextResponse.json({
      data: { bookingRef: booking.booking_ref, bookingId: booking.id },
      error: null,
    })
  } catch (err) {
    console.error('[BOOKING] Error:', err)
    return NextResponse.json(
      { data: null, error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    )
  }
}
