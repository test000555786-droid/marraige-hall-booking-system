import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getHallSettings, getActiveVenues, getGalleryItems, getTestimonials } from '@/lib/queries'
import { formatCurrency, EVENT_TYPE_LABELS, VENUE_TIER_LABELS } from '@/lib/utils'
import HeroSection from '@/components/public/HeroSection'
import AvailabilityChecker from '@/components/public/AvailabilityChecker'
import TestimonialsCarousel from '@/components/public/TestimonialsCarousel'
import StatsBar from '@/components/public/StatsBar'
import { Star, ArrowRight, Users, IndianRupee } from 'lucide-react'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getHallSettings()
  return {
    title: `${settings.hall_name || 'Shubh Vivah Marriage Hall'} — ${settings.hall_city || 'Hyderabad'}`,
    description: settings.hall_tagline || 'Book the perfect venue for your dream wedding.',
    openGraph: { title: settings.hall_name, description: settings.hall_tagline },
  }
}

export default async function HomePage() {
  const [settings, venuesRes, galleryRes, testimonialsRes] = await Promise.all([
    getHallSettings(),
    getActiveVenues(),
    getGalleryItems(),
    getTestimonials(),
  ])

  const venues = venuesRes.data ?? []
  const galleryItems = (galleryRes.data ?? []).slice(0, 6)
  const testimonials = testimonialsRes.data ?? []

  return (
    <>
      {/* ── Hero ─────────────────────────────── */}
      <HeroSection settings={settings} />

      {/* ── Stats Bar ────────────────────────── */}
      <StatsBar settings={settings} />

      {/* ── Availability Checker ─────────────── */}
      <section className="bg-white py-16 lg:py-20" aria-label="Check availability">
        <div className="container max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">
              Check Availability
            </p>
            <h2 className="font-serif text-display-sm text-navy">
              Is Your Date Available?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Select a venue and date to instantly check availability.
            </p>
          </div>
          <AvailabilityChecker venues={venues} />
        </div>
      </section>

      {/* ── Venues ───────────────────────────── */}
      <section className="bg-cream py-16 lg:py-24" aria-label="Our venues">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">
              Our Venues
            </p>
            <h2 className="font-serif text-display-md text-navy">
              Three Halls, One Vision
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              From intimate gatherings to grand celebrations — we have the perfect space for your special occasion.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <article
                key={venue.id}
                className="group overflow-hidden rounded-2xl border border-cream-500 bg-white shadow-sm transition-shadow hover:shadow-gold"
              >
                {/* Venue image */}
                <div className="relative h-56 overflow-hidden bg-cream-400">
                  {(venue.images[0] || `/venues/${venue.slug.split('-')[0]}.webp`) ? (
                    <Image
                      src={venue.images[0] || `/venues/${venue.slug.split('-')[0]}.webp`}
                      alt={venue.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-navy/10">
                      <span className="font-serif text-2xl text-navy/30">{venue.name[0]}</span>
                    </div>
                  )}
                  {/* Tier badge */}
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy">
                      {VENUE_TIER_LABELS[venue.tier]}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-navy">{venue.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {venue.short_description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-cream-500 pt-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users size={14} />
                      <span>Up to {venue.capacity_max.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-semibold text-gold">
                        {formatCurrency(venue.price_per_day)}
                        <span className="text-xs font-normal text-muted-foreground">/day</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/venues#${venue.slug}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-navy/20 py-2.5 text-sm font-medium text-navy transition-all hover:border-gold hover:text-gold"
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-8 py-3 font-semibold text-gold transition-all hover:bg-navy-400"
            >
              Compare All Venues <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Gallery Preview ───────────────────── */}
      {galleryItems.length > 0 && (
        <section className="bg-navy py-16 lg:py-24" aria-label="Gallery preview">
          <div className="container">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">
                Our Gallery
              </p>
              <h2 className="font-serif text-display-md text-cream-100">
                Captured Memories
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-cream-400/70">
                A glimpse into the beautiful celebrations hosted at our halls.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
              {galleryItems.map((item, i) => (
                <div
                  key={item.id}
                  className={`relative overflow-hidden rounded-xl bg-navy-400 ${
                    i === 0 ? 'col-span-2 row-span-2 sm:col-span-1' : ''
                  }`}
                  style={{ aspectRatio: i === 0 ? '1/1' : '4/3' }}
                >
                  <Image
                    src={item.thumbnail_url ?? item.url}
                    alt={item.caption ?? 'Gallery image'}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {item.caption && (
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity hover:opacity-100">
                      <p className="text-xs font-medium text-white">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 rounded-lg border border-gold px-8 py-3 font-semibold text-gold transition-all hover:bg-gold hover:text-navy"
              >
                View Full Gallery <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────── */}
      {testimonials.length > 0 && (
        <section className="bg-cream py-16 lg:py-24" aria-label="Testimonials">
          <div className="container">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">
                Testimonials
              </p>
              <h2 className="font-serif text-display-md text-navy">
                What Our Guests Say
              </h2>
            </div>
            <TestimonialsCarousel testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy py-20 lg:py-28" aria-label="Book now">
        <div className="absolute inset-0 bg-gold-gradient opacity-5" />
        <div className="container relative text-center">
          <h2 className="font-serif text-display-md text-cream-100">
            Ready to Plan Your Dream Event?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream-400/70">
            Book your preferred venue today and let us handle the rest. Our team is ready to make your celebration unforgettable.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/book"
              className="rounded-lg bg-gold px-8 py-3.5 font-semibold text-navy shadow-gold transition-all hover:bg-gold-400 hover:shadow-gold-lg"
            >
              Book a Venue
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white/30 px-8 py-3.5 font-semibold text-cream-100 transition-all hover:border-gold hover:text-gold"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
