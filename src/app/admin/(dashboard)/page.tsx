import type { Metadata } from 'next'
import { getDashboardStats } from '@/lib/queries'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS } from '@/lib/utils'
import AdminRealtimeToast from '@/components/admin/AdminRealtimeToast'
import AdminCharts from '@/components/admin/AdminCharts'
import { TrendingUp, TrendingDown, CalendarDays, CheckCircle2, Clock, IndianRupee, Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient()
  const { data: stats } = await getDashboardStats()

  // Upcoming events
  const { data: upcoming } = await supabase.from('bookings')
    .select('*, venue:venues(name)').eq('status', 'confirmed')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date').limit(5)

  // Recent activity
  const { data: recent } = await supabase.from('bookings')
    .select('*, venue:venues(name)').is('deleted_at', null)
    .order('created_at', { ascending: false }).limit(8)

  // Revenue by month for chart (last 6 months)
  const { data: monthlyRaw } = await supabase.from('bookings')
    .select('created_at, total_amount').in('status', ['confirmed', 'completed'])
    .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
    .is('deleted_at', null)

  const monthlyMap = (monthlyRaw ?? []).reduce<Record<string, number>>((acc, b) => {
    const m = new Date(b.created_at).toLocaleString('en-IN', { month: 'short', year: '2-digit' })
    acc[m] = (acc[m] ?? 0) + b.total_amount
    return acc
  }, {})

  const chartData = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue })).slice(-6)

  const statCards = [
    { label: 'Total Bookings', value: stats?.totalBookings ?? 0, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50', trend: null },
    { label: 'Confirmed', value: stats?.confirmedBookings ?? 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', trend: null },
    { label: 'Pending Verification', value: stats?.pendingVerification ?? 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', trend: null, urgent: true },
    { label: 'Upcoming Events', value: stats?.upcomingEvents ?? 0, icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50', trend: null },
    { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue ?? 0), icon: IndianRupee, color: 'text-gold', bg: 'bg-gold/10', trend: null },
    { label: 'This Month', value: formatCurrency(stats?.monthlyRevenue ?? 0), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: stats?.trendsVsLastMonth?.revenue },
  ]

  return (
    <div className="space-y-8">
      <AdminRealtimeToast />

      <div>
        <h1 className="font-serif text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Welcome back — here's what's happening today</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, color, bg, trend, urgent }) => (
          <div key={label} className={`rounded-2xl border bg-white p-5 shadow-sm ${urgent && (stats?.pendingVerification ?? 0) > 0 ? 'border-yellow-300' : 'border-cream-500'}`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className={`mt-1 font-serif text-2xl font-bold ${color}`}>{value}</p>
                {trend !== null && trend !== undefined && (
                  <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(trend)}% vs last month
                  </p>
                )}
              </div>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg}`}>
                <Icon size={20} className={color} aria-hidden="true" />
              </div>
            </div>
            {urgent && (stats?.pendingVerification ?? 0) > 0 && (
              <Link href="/admin/payments" className="mt-3 block text-xs font-medium text-yellow-700 hover:underline">
                → Verify payments now
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 && <AdminCharts data={chartData} />}

      {/* Bottom grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming events */}
        <div className="rounded-2xl border border-cream-500 bg-white shadow-sm">
          <div className="border-b border-cream-500 px-5 py-4 flex items-center justify-between">
            <h2 className="font-semibold text-navy">Upcoming Events</h2>
            <Link href="/admin/calendar" className="text-xs text-gold hover:underline">View Calendar →</Link>
          </div>
          <div className="divide-y divide-cream-400">
            {(upcoming ?? []).length === 0
              ? <p className="px-5 py-8 text-center text-sm text-muted-foreground">No upcoming events</p>
              : (upcoming ?? []).map((b) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-navy">{b.booking_ref}</p>
                    <p className="text-xs text-muted-foreground">{(b as { venue?: { name?: string } }).venue?.name} · {formatDate(b.event_date)}</p>
                  </div>
                  <Link href={`/admin/bookings/${b.id}`} className="text-xs text-gold hover:underline">View</Link>
                </div>
              ))
            }
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-cream-500 bg-white shadow-sm">
          <div className="border-b border-cream-500 px-5 py-4 flex items-center justify-between">
            <h2 className="font-semibold text-navy">Recent Activity</h2>
            <Link href="/admin/bookings" className="text-xs text-gold hover:underline">All Bookings →</Link>
          </div>
          <div className="divide-y divide-cream-400">
            {(recent ?? []).length === 0
              ? <p className="px-5 py-8 text-center text-sm text-muted-foreground">No bookings yet</p>
              : (recent ?? []).map((b) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-navy">{b.booking_ref}</p>
                    <p className="text-xs text-muted-foreground">{b.customer_name} · {(b as { venue?: { name?: string } }).venue?.name}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                    b.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>{BOOKING_STATUS_LABELS[b.status]}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
