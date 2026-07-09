import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const venueId = searchParams.get('venueId')
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  // Check blocked dates
  let blockedQuery = supabase
    .from('blocked_dates')
    .select('id')
    .eq('blocked_date', date)

  if (venueId) {
    blockedQuery = blockedQuery.or(`venue_id.eq.${venueId},venue_id.is.null`)
  }

  const { data: blockedData } = await blockedQuery.limit(1)

  if (blockedData && blockedData.length > 0) {
    return NextResponse.json({ available: false, reason: 'blocked' })
  }

  // Check existing bookings
  let bookingQuery = supabase
    .from('bookings')
    .select('id')
    .eq('event_date', date)
    .is('deleted_at', null)
    .not('status', 'in', '("cancelled","rejected","expired")')

  if (venueId) {
    bookingQuery = bookingQuery.eq('venue_id', venueId)
  }

  const { data: bookingData } = await bookingQuery.limit(1)

  if (bookingData && bookingData.length > 0) {
    return NextResponse.json({ available: false, reason: 'booked' })
  }

  return NextResponse.json({ available: true })
}
