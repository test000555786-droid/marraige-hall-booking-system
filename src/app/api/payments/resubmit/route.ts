import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const admin = createSupabaseAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const bookingId = formData.get('bookingId') as string
    const transactionId = formData.get('transactionId') as string
    const screenshotFile = formData.get('screenshot') as File | null

    const { data: booking } = await admin.from('bookings').select('id, customer_id, advance_amount').eq('id', bookingId).eq('customer_id', session.user.id).single()
    if (!booking) return NextResponse.json({ data: null, error: 'Booking not found' }, { status: 404 })

    let screenshotUrl: string | null = null
    if (screenshotFile && screenshotFile.size > 0) {
      const ext = screenshotFile.type.split('/')[1]
      const path = `payments/${bookingId}/resubmit-${Date.now()}.${ext}`
      for (let i = 0; i < 3; i++) {
        const { error } = await admin.storage.from('payment-screenshots').upload(path, screenshotFile, { contentType: screenshotFile.type, upsert: true })
        if (!error) { const { data } = admin.storage.from('payment-screenshots').getPublicUrl(path); screenshotUrl = data.publicUrl; break }
      }
    }

    await admin.from('payments').insert({ booking_id: bookingId, customer_id: session.user.id, method: 'upi', amount: booking.advance_amount, transaction_id: transactionId, screenshot_url: screenshotUrl, status: 'pending' })
    await admin.from('bookings').update({ status: 'pending_verification' }).eq('id', bookingId)

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Failed to resubmit payment' }, { status: 500 })
  }
}
