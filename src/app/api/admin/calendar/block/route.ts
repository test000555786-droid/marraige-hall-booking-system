// src/app/api/admin/calendar/block/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { eachDayOfInterval, format, parseISO } from 'date-fns'

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const admin = createSupabaseAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { startDate, endDate, venueId, reason, adminId } = await req.json()
    if (!startDate) return NextResponse.json({ data: null, error: 'Start date required' }, { status: 400 })

    // Check for confirmed bookings if blocking a range
    const start = parseISO(startDate)
    const end = endDate ? parseISO(endDate) : start
    const dates = eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'))

    const { data: conflicting } = await admin
      .from('bookings')
      .select('booking_ref, event_date')
      .in('event_date', dates)
      .eq('status', 'confirmed')
      .is('deleted_at', null)

    const warnings = conflicting && conflicting.length > 0
      ? `Warning: ${conflicting.length} confirmed booking(s) exist on these dates: ${conflicting.map((b) => b.booking_ref).join(', ')}`
      : null

    const rows = dates.map((d) => ({
      blocked_date: d,
      venue_id: venueId || null,
      reason: reason || null,
      blocked_by: session.user.id,
    }))

    await admin.from('blocked_dates').insert(rows)

    return NextResponse.json({ data: { success: true, warnings }, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Failed to block dates' }, { status: 500 })
  }
}
