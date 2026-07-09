// src/app/api/admin/gallery/upload/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const admin = createSupabaseAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ data: null, error: 'No file provided' }, { status: 400 })

    const ext = file.type.split('/')[1]
    const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await admin.storage.from('gallery').upload(path, file, { contentType: file.type })
    if (uploadError) throw new Error(uploadError.message)

    const { data: urlData } = admin.storage.from('gallery').getPublicUrl(path)
    const url = urlData.publicUrl

    const { data: maxOrder } = await admin.from('gallery').select('display_order').order('display_order', { ascending: false }).limit(1).single()
    const displayOrder = (maxOrder?.display_order ?? 0) + 1

    await admin.from('gallery').insert({ url, thumbnail_url: url, category: 'other', display_order: displayOrder, is_active: true })

    return NextResponse.json({ data: { url }, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 })
  }
}
