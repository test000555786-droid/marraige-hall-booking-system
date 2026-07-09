'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartData { month: string; revenue: number }

const formatINR = (v: number) => `₹${(v / 1000).toFixed(0)}K`

export default function AdminCharts({ data }: { data: ChartData[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-navy mb-4">Revenue by Month</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d8" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
            <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#888' }} />
            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #f0e8d8', fontSize: 12 }} />
            <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-navy mb-4">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d8" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
            <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#888' }} />
            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #f0e8d8', fontSize: 12 }} />
            <Line type="monotone" dataKey="revenue" stroke="#1A1A2E" strokeWidth={2} dot={{ fill: '#C9A84C', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
