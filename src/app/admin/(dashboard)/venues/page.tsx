import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatCurrency, VENUE_TIER_LABELS, VENUE_TIER_COLORS, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Venues — Admin' }

export default async function AdminVenuesPage() {
  const supabase = createSupabaseServerClient()
  const { data: venues } = await supabase.from('venues').select('*').order('display_order')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">Venues</h1>
          <p className="text-sm text-muted-foreground">{venues?.length ?? 0} venues configured</p>
        </div>
        <Link href="/admin/venues/create" className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all">
          + Add Venue
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(venues ?? []).map((v) => (
          <div key={v.id} className={cn('rounded-2xl border bg-white shadow-sm overflow-hidden', v.is_active ? 'border-cream-500' : 'border-gray-200 opacity-70')}>
            <div className="relative h-40">
              {v.images[0]
                ? <Image src={v.images[0]} alt={v.name} fill className="object-cover" sizes="400px" />
                : <div className="flex h-full items-center justify-center bg-cream-400"><span className="font-serif text-3xl text-navy/20">{v.name[0]}</span></div>
              }
              <div className="absolute top-2 left-2 flex gap-2">
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', VENUE_TIER_COLORS[v.tier])}>{VENUE_TIER_LABELS[v.tier]}</span>
                {!v.is_active && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">Inactive</span>}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-serif text-lg font-semibold text-navy">{v.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">Up to {v.capacity_max.toLocaleString('en-IN')} guests · {formatCurrency(v.price_per_day)}/day</p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{v.short_description}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/venues/${v.id}/edit`} className="flex-1 rounded-lg border border-navy/20 py-2 text-center text-sm font-medium text-navy hover:border-gold hover:text-gold transition-all">Edit</Link>
                <Link href={`/admin/venues/${v.id}/stats`} className="rounded-lg border border-cream-500 px-3 py-2 text-sm text-muted-foreground hover:border-gold hover:text-gold transition-all">Stats</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
