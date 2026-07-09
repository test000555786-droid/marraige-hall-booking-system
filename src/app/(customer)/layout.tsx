import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getHallSettings } from '@/lib/queries'
import CustomerSidebar from '@/components/customer/CustomerSidebar'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile) redirect('/login')

  const settings = await getHallSettings()

  return (
    <div className="min-h-screen bg-cream">
      {/* Top header */}
      <header className="fixed top-0 z-40 w-full border-b border-cream-500 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="font-serif text-lg font-bold text-gold">
            {settings.hall_name || 'Shubh Vivah'}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="text-sm text-muted-foreground hover:text-navy transition-colors">Notifications</Link>
            <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center font-serif font-bold text-navy text-sm">
              {profile.full_name[0]}
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <CustomerSidebar profile={profile} />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">{children}</main>
      </div>
    </div>
  )
}
