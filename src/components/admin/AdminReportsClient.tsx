'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download } from 'lucide-react'
import { exportToCSV, formatCurrency, BOOKING_STATUS_LABELS } from '@/lib/utils'
import type { DbVenue } from '@/types/database'

interface Booking {
  id: string; booking_ref: string; customer_name: string; customer_email: string
  venue_id: string; event_date: string; event_type: string; total_amount: number
  advance_amount: number; status: string; created_at: string
}

interface TopCustomer { name: string; email: string; count: number; total: number }

const COLORS = ['#C9A84C', '#1A1A2E', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B']
const formatINR = (v: number) => `₹${(v / 1000).toFixed(0)}K`

export default function AdminReportsClient({
  bookings, venues, topCustomers,
}: { bookings: Booking[]; venues: DbVenue[]; topCustomers: TopCustomer[] }) {
  const [period, setPeriod] = useState<'1m' | '3m' | '6m'>('6m')

  const filteredBookings = useMemo(() => {
    const months = period === '1m' ? 1 : period === '3m' ? 3 : 6
    const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - months)
    return bookings.filter((b) => new Date(b.created_at) >= cutoff)
  }, [bookings, period])

  const confirmedBookings = filteredBookings.filter((b) => ['confirmed', 'completed'].includes(b.status))

  // Revenue by month
  const revenueByMonth = useMemo(() => {
    const map: Record<string, number> = {}
    confirmedBookings.forEach((b) => {
      const m = new Date(b.created_at).toLocaleString('en-IN', { month: 'short', year: '2-digit' })
      map[m] = (map[m] ?? 0) + b.total_amount
    })
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }))
  }, [confirmedBookings])

  // Revenue by venue
  const revenueByVenue = useMemo(() => {
    return venues.map((v) => ({
      name: v.name,
      revenue: confirmedBookings.filter((b) => b.venue_id === v.id).reduce((s, b) => s + b.total_amount, 0),
      bookings: confirmedBookings.filter((b) => b.venue_id === v.id).length,
    })).filter((v) => v.bookings > 0)
  }, [confirmedBookings, venues])

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    filteredBookings.forEach((b) => { map[b.status] = (map[b.status] ?? 0) + 1 })
    return Object.entries(map).map(([status, count]) => ({ name: BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS] ?? status, value: count }))
  }, [filteredBookings])

  const totalRevenue = confirmedBookings.reduce((s, b) => s + b.total_amount, 0)
  const totalBookings = filteredBookings.length
  const avgValue = confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0

  const handleExport = () => {
    exportToCSV(confirmedBookings.map((b) => ({
      Ref: b.booking_ref, Customer: b.customer_name, Email: b.customer_email,
      Venue: venues.find((v) => v.id === b.venue_id)?.name ?? '',
      Date: b.event_date, Type: b.event_type, Total: b.total_amount, Status: b.status,
    })), `report-${period}-${new Date().toISOString().split('T')[0]}`)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['1m', '3m', '6m'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`rounded-lg px-4 py-2 text-sm font-medium border transition-all ${period === p ? 'bg-navy text-gold border-navy' : 'bg-white text-navy border-cream-500 hover:border-gold hover:text-gold'}`}>
              Last {p === '1m' ? '1 month' : p === '3m' ? '3 months' : '6 months'}
            </button>
          ))}
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-cream-500 bg-white px-4 py-2 text-sm font-medium text-navy hover:border-gold hover:text-gold transition-all">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), sub: `from ${confirmedBookings.length} confirmed bookings` },
          { label: 'Total Bookings', value: totalBookings, sub: `across all statuses` },
          { label: 'Avg Booking Value', value: formatCurrency(avgValue), sub: 'per confirmed booking' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-serif text-2xl font-bold text-gold">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-navy">Revenue by Month</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d8" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={formatINR} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-navy">Revenue by Venue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByVenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d8" />
              <XAxis type="number" tickFormatter={formatINR} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#1A1A2E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-navy">Booking Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top customers */}
        <div className="rounded-2xl border border-cream-500 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-cream-500 px-5 py-4">
            <h2 className="font-semibold text-navy">Top Customers</h2>
          </div>
          <div className="divide-y divide-cream-400">
            {topCustomers.slice(0, 6).map((c, i) => (
              <div key={c.email} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-gradient text-xs font-bold text-navy">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-navy">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.count} bookings</p>
                  </div>
                </div>
                <p className="font-semibold text-gold text-sm">{formatCurrency(c.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
