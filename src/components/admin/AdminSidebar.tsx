'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, CreditCard, Calendar,
  Building2, Image, Settings, BarChart2, LogOut, Menu, X, Home
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { DbProfile } from '@/types/database'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard, badge: true },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/venues', label: 'Venues', icon: Building2 },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface Props { profile: DbProfile; pendingCount: number; hallName?: string }

export default function AdminSidebar({ profile, pendingCount: initialPending, hallName }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(initialPending)

  // Realtime pending count
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const channel = supabase.channel('admin-pending')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification').is('deleted_at', null)
          .then(({ count }) => setPending(count ?? 0))
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-5">
        <p className="font-serif text-lg font-bold text-gold">{hallName || 'Shubh Vivah'}</p>
        <p className="text-xs text-cream-400/60 mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
        <ul className="space-y-1" role="list">
          {NAV.map(({ href, label, icon: Icon, exact, badge }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all', active ? 'bg-gold/20 text-gold' : 'text-cream-300 hover:bg-white/5 hover:text-cream-100')}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {badge && pending > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white min-w-[20px] text-center" aria-label={`${pending} pending`}>
                      {pending}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="border-t border-white/10 p-3 space-y-1">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-cream-300">{profile.full_name}</p>
          <p className="text-xs text-cream-400/60 capitalize">{profile.role}</p>
        </div>
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream-400/70 hover:bg-white/5 hover:text-cream-100 transition-all">
          <Home size={17} /> View Website
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-all">
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-50 rounded-lg bg-navy p-2 text-gold shadow-md lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Mobile drawer */}
      <div className={cn('fixed inset-y-0 left-0 z-50 w-64 bg-navy transform transition-transform lg:hidden', open ? 'translate-x-0' : '-translate-x-full')}>
        <button onClick={() => setOpen(false)} className="absolute right-3 top-3 text-cream-400 hover:text-cream-100" aria-label="Close menu"><X size={20} /></button>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-navy lg:flex flex-col">
        <SidebarContent />
      </aside>
    </>
  )
}
