import type { Metadata } from 'next'
import Link from 'next/link'
import { getTestimonials } from '@/lib/queries'
import { Star, Quote } from 'lucide-react'
import { EVENT_TYPE_LABELS, formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'Read what our guests say about Shubh Vivah Marriage Hall. Thousands of happy couples and families share their celebration stories.',
}

export const revalidate = 3600

export default async function TestimonialsPage() {
  const { data: testimonials, error } = await getTestimonials()

  const avgRating =
    testimonials && testimonials.length > 0
      ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
      : '5.0'

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-72 items-center justify-center overflow-hidden bg-navy pt-16 md:h-80">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1920&q=80')` }}
        />
        <div className="relative z-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">Happy Guests</p>
          <h1 className="font-serif text-display-md text-cream-100 md:text-display-lg">What Our Guests Say</h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} className="fill-gold text-gold" />
              ))}
            </div>
            <span className="text-cream-300 text-sm">{avgRating} average from {testimonials?.length ?? 0}+ reviews</span>
          </div>
        </div>
      </section>

      {/* Rating summary */}
      <section className="bg-gold py-8">
        <div className="container">
          <div className="grid grid-cols-2 divide-x divide-navy/20 md:grid-cols-4">
            {[
              { label: 'Overall Rating', value: avgRating + '/5' },
              { label: 'Would Recommend', value: '98%' },
              { label: 'Happy Families', value: '5000+' },
              { label: 'Years Serving', value: '22+' },
            ].map((stat) => (
              <div key={stat.label} className="px-6 text-center">
                <p className="font-serif text-2xl font-bold text-navy md:text-3xl">{stat.value}</p>
                <p className="mt-0.5 text-xs font-medium text-navy/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials grid */}
      <section className="bg-cream py-16 lg:py-24">
        <div className="container">
          {error ? (
            <p className="text-center text-muted-foreground">Unable to load testimonials. Please try again later.</p>
          ) : !testimonials || testimonials.length === 0 ? (
            <p className="text-center text-muted-foreground">No testimonials yet. Be the first to share your experience!</p>
          ) : (
            <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
              {testimonials.map((t) => (
                <article
                  key={t.id}
                  className="mb-6 break-inside-avoid rounded-2xl border border-cream-500 bg-white p-6 shadow-sm"
                >
                  {/* Quote icon */}
                  <Quote size={28} className="mb-3 text-gold/30" aria-hidden="true" />

                  {/* Stars */}
                  <div className="flex gap-0.5" aria-label={`Rating: ${t.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= t.rating ? 'fill-gold text-gold' : 'text-cream-500'}
                      />
                    ))}
                  </div>

                  {/* Message */}
                  <blockquote className="mt-3">
                    <p className="leading-relaxed text-navy">"{t.message}"</p>
                  </blockquote>

                  {/* Author */}
                  <div className="mt-5 flex items-center gap-3 border-t border-cream-400 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient font-serif text-sm font-bold text-navy">
                      {t.customer_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">{t.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {EVENT_TYPE_LABELS[t.event_type]}
                        {t.event_date && ` · ${formatDate(t.event_date, 'MMM yyyy')}`}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16">
        <div className="container text-center">
          <h2 className="font-serif text-display-sm text-cream-100">Your Story Could Be Next</h2>
          <p className="mx-auto mt-3 max-w-lg text-cream-300/70">
            Join thousands of families who have celebrated their most precious moments with us.
          </p>
          <Link
            href="/book"
            className="mt-8 inline-flex rounded-lg bg-gold px-8 py-3.5 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all"
          >
            Book Your Celebration
          </Link>
        </div>
      </section>
    </>
  )
}
