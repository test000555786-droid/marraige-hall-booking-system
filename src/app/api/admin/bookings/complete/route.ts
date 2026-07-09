// src/app/api/admin/bookings/complete/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const admin = createSupabaseAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { bookingId } = await req.json()
    await admin.from('bookings').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', bookingId)
    return NextResponse.json({ data: { success: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to complete booking' }, { status: 500 })
  }
}
