import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getActiveVenues } from '@/lib/queries'
import { formatCurrency, VENUE_TIER_LABELS, VENUE_TIER_COLORS } from '@/lib/utils'
import { Users, Check, X, ArrowRight, IndianRupee } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Our Venues',
  description: 'Explore three stunning halls — Pearl, Emerald, and Diamond. Find the perfect venue for your wedding or celebration.',
}

export const revalidate = 3600

export default async function VenuesPage() {
  const { data: venues, error } = await getActiveVenues()

  if (error || !venues) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <p className="text-muted-foreground">Unable to load venues. Please try again later.</p>
      </div>
    )
  }

  // Build comparison matrix
  const allAmenities = Array.from(
    new Set(venues.flatMap((v) => v.amenities))
  ).sort()

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-72 items-center justify-center overflow-hidden bg-navy pt-16 md:h-96">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1920&q=80')` }}
        />
        <div className="relative z-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">Our Venues</p>
          <h1 className="font-serif text-display-md text-cream-100 md:text-display-lg">Choose Your Perfect Hall</h1>
          <p className="mt-3 text-cream-300/70">Three unique venues for every kind of celebration</p>
        </div>
      </section>

      {/* Venue cards */}
      <section className="bg-cream py-16 lg:py-24">
        <div className="container space-y-16">
          {venues.map((venue, idx) => (
            <article
              key={venue.id}
              id={venue.slug}
              className="overflow-hidden rounded-2xl border border-cream-500 bg-white shadow-sm"
            >
              <div className={cn('grid lg:grid-cols-2', idx % 2 === 1 && 'lg:grid-flow-col-dense')}>
                {/* Images */}
                <div className={cn('relative h-72 lg:h-auto', idx % 2 === 1 && 'lg:col-start-2')}>
                  {(venue.images[0] || `/venues/${venue.slug.split('-')[0]}.webp`) ? (
                    <Image
                      src={venue.images[0] || `/venues/${venue.slug.split('-')[0]}.webp`}
                      alt={`${venue.name} interior`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-navy/10">
                      <span className="font-serif text-5xl text-navy/20">{venue.name[0]}</span>
                    </div>
                  )}
                  <div className="absolute left-4 top-4">
                    <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', VENUE_TIER_COLORS[venue.tier])}>
                      {VENUE_TIER_LABELS[venue.tier]}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className={cn('flex flex-col justify-center p-8 lg:p-10', idx % 2 === 1 && 'lg:col-start-1')}>
                  <h2 className="font-serif text-display-xs text-navy">{venue.name}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{venue.description}</p>

                  {/* Key specs */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-cream p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Capacity</p>
                      <p className="mt-1 font-semibold text-navy flex items-center gap-1">
                        <Users size={14} />
                        {venue.capacity_min}–{venue.capacity_max.toLocaleString('en-IN')} guests
                      </p>
                    </div>
                    <div className="rounded-xl bg-cream p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Price / Day</p>
                      <p className="mt-1 font-semibold text-gold">{formatCurrency(venue.price_per_day)}</p>
                    </div>
                    {venue.price_half_day && (
                      <div className="rounded-xl bg-cream p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Half Day</p>
                        <p className="mt-1 font-semibold text-gold">{formatCurrency(venue.price_half_day)}</p>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  <div className="mt-6">
                    <p className="mb-2 text-sm font-semibold text-navy">Key Amenities</p>
                    <ul className="flex flex-wrap gap-2">
                      {venue.amenities.slice(0, 8).map((a) => (
                        <li key={a} className="rounded-full bg-cream px-3 py-1 text-xs text-navy border border-cream-500">
                          {a}
                        </li>
                      ))}
                      {venue.amenities.length > 8 && (
                        <li className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold-600 border border-gold/20">
                          +{venue.amenities.length - 8} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <Link
                      href={`/book?venueId=${venue.id}`}
                      className="flex-1 rounded-lg bg-gold py-3 text-center text-sm font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all"
                    >
                      Book This Venue
                    </Link>
                    <Link
                      href={`/availability?venueId=${venue.id}`}
                      className="rounded-lg border border-navy/20 px-4 py-3 text-sm font-medium text-navy hover:border-gold hover:text-gold transition-all"
                    >
                      Check Dates
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">Compare</p>
            <h2 className="font-serif text-display-sm text-navy">Side-by-Side Comparison</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-cream-500">
            <table className="w-full min-w-[640px] text-sm" aria-label="Venue comparison">
              <thead>
                <tr className="border-b border-cream-500 bg-navy">
                  <th className="px-6 py-4 text-left font-semibold text-cream-300">Feature</th>
                  {venues.map((v) => (
                    <th key={v.id} className="px-6 py-4 text-center font-serif text-base font-semibold text-gold">
                      {v.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Pricing rows */}
                {[
                  {
                    label: 'Price / Day',
                    values: venues.map((v) => formatCurrency(v.price_per_day)),
                    highlight: true,
                  },
                  {
                    label: 'Capacity',
                    values: venues.map((v) => `${v.capacity_min}–${v.capacity_max.toLocaleString('en-IN')}`),
                  },
                  {
                    label: 'Tier',
                    values: venues.map((v) => VENUE_TIER_LABELS[v.tier]),
                  },
                ].map((row, ri) => (
                  <tr key={row.label} className={cn('border-b border-cream-500', ri % 2 === 0 ? 'bg-white' : 'bg-cream/40')}>
                    <td className="px-6 py-3.5 font-medium text-navy">{row.label}</td>
                    {row.values.map((val, vi) => (
                      <td key={vi} className={cn('px-6 py-3.5 text-center', row.highlight ? 'font-semibold text-gold' : 'text-navy')}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Amenity rows */}
                {allAmenities.map((amenity, ai) => (
                  <tr key={amenity} className={cn('border-b border-cream-500', ai % 2 === 0 ? 'bg-white' : 'bg-cream/40')}>
                    <td className="px-6 py-3 text-muted-foreground">{amenity}</td>
                    {venues.map((v) => (
                      <td key={v.id} className="px-6 py-3 text-center">
                        {v.amenities.includes(amenity) ? (
                          <Check size={16} className="mx-auto text-green-600" aria-label="Included" />
                        ) : (
                          <X size={16} className="mx-auto text-cream-500" aria-label="Not included" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-cream">
                  <td className="px-6 py-4" />
                  {venues.map((v) => (
                    <td key={v.id} className="px-6 py-4 text-center">
                      <Link
                        href={`/book?venueId=${v.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-navy hover:bg-gold-400 transition-all"
                      >
                        Book <ArrowRight size={12} />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
