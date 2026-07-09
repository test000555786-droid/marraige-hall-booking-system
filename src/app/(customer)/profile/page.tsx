// src/app/(customer)/profile/page.tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/customer/ProfileForm'

export const metadata: Metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile) redirect('/login')
  return (
    <div className="max-w-xl space-y-6">
      <div><h1 className="font-serif text-2xl font-bold text-navy">My Profile</h1><p className="text-sm text-muted-foreground mt-0.5">Update your personal information</p></div>
      <div className="rounded-2xl border border-cream-500 bg-white p-6 shadow-sm">
        <ProfileForm profile={profile} />
      </div>
    </div>
  )
}
