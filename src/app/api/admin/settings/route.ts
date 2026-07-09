import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const admin = createSupabaseAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await admin.from('profiles').select('role').eq('id', session.user.id).single()
    if (!profile || !['admin', 'owner'].includes(profile.role)) {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json() as Record<string, string>
    const updates = Object.entries(body).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }))

    for (const update of updates) {
      await admin.from('hall_settings').upsert(update, { onConflict: 'key' })
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Failed to save settings' }, { status: 500 })
  }
}
