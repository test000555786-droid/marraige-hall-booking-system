'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Bell, User, LogOut, Home } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { DbProfile } from '@/types/database'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'My Bookings', icon: CalendarDays },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function CustomerSidebar({ profile }: { profile: DbProfile }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-cream-500 bg-white lg:flex">
      {/* Profile */}
      <div className="border-b border-cream-500 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient font-serif font-bold text-navy">
            {profile.full_name[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy">{profile.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Customer navigation">
        <ul className="space-y-1" role="list">
          {NAV.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-gold/10 text-gold'
                    : 'text-muted-foreground hover:bg-cream hover:text-navy'
                )}
                aria-current={pathname === href ? 'page' : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-cream-500 p-3 space-y-1">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-cream hover:text-navy transition-all">
          <Home size={18} aria-hidden="true" /> Back to Website
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-all">
          <LogOut size={18} aria-hidden="true" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
