import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import AdminGalleryClient from '@/components/admin/AdminGalleryClient'

export const metadata: Metadata = { title: 'Gallery — Admin' }

export default async function AdminGalleryPage() {
  const supabase = createSupabaseServerClient()
  const { data: items } = await supabase.from('gallery').select('*').order('display_order')
  const { data: venues } = await supabase.from('venues').select('id, name').order('display_order')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-navy">Gallery</h1>
        <p className="text-sm text-muted-foreground">{items?.length ?? 0} images</p>
      </div>
      <AdminGalleryClient items={items ?? []} venues={venues ?? []} />
    </div>
  )
}
