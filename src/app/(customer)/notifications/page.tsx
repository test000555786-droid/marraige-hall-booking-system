import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserNotifications } from '@/lib/queries'
import { formatIST, getNotificationIcon } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Notifications' }

export default async function NotificationsPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: notifications } = await getUserNotifications(session.user.id)
  const items = notifications ?? []

  // Group by date
  const grouped = items.reduce<Record<string, typeof items>>((acc, n) => {
    const d = new Date(n.created_at).toDateString()
    if (!acc[d]) acc[d] = []
    acc[d].push(n)
    return acc
  }, {})

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl font-bold text-navy">Notifications</h1><p className="text-sm text-muted-foreground">{items.filter((n) => !n.is_read).length} unread</p></div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-cream-500 bg-white p-12 text-center shadow-sm">
          <p className="text-3xl mb-3">🔔</p>
          <p className="font-semibold text-navy">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-1">You'll be notified about your bookings and payments here.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, notifs]) => (
          <div key={date}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{date}</p>
            <div className="space-y-2">
              {notifs.map((n) => (
                <div key={n.id} className={`rounded-xl border p-4 transition-all ${!n.is_read ? 'border-gold/30 bg-gold/5' : 'border-cream-500 bg-white'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5" aria-hidden="true">{getNotificationIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatIST(n.created_at)}</p>
                      {n.booking_id && (
                        <Link href={`/bookings`} className="mt-1 inline-block text-xs font-medium text-gold hover:underline">View Booking →</Link>
                      )}
                    </div>
                    {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-gold mt-1.5" aria-label="Unread" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
