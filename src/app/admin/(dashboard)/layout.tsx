import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getHallSettings } from '@/lib/queries'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile || !['admin', 'owner'].includes(profile.role)) redirect('/?error=unauthorized')

  const { data: pendingCount } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification').is('deleted_at', null)
  const settings = await getHallSettings()

  return (
    <div className="min-h-screen bg-cream">
      <AdminSidebar profile={profile} pendingCount={pendingCount ?? 0} hallName={settings.hall_name} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 border-b border-cream-500 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-lg font-semibold text-navy">Admin Panel</h1>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{profile.full_name}</span>
              <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center font-serif text-sm font-bold text-gold">
                {profile.full_name[0]}
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
