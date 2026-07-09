'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import type { HallSettings } from '@/types/database'

export default function HeroSection({ settings }: { settings: HallSettings }) {
  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80')`,
        }}
        role="img"
        aria-label="Wedding celebration at marriage hall"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/70 to-navy/90" />

      {/* Gold shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient" aria-hidden="true" />

      {/* Content */}
      <div className="container relative z-10 pt-24 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          Est. {settings.hall_established_year || '2002'} · {settings.hall_city || 'Hyderabad'}
        </div>

        {/* Headline */}
        <h1 className="font-serif text-display-xl font-bold text-cream-100 sm:text-display-2xl">
          Where Every{' '}
          <span className="text-gradient-gold">Celebration</span>
          <br />
          Becomes a Memory
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-cream-300/80 sm:text-xl">
          {settings.hall_tagline ||
            'Three stunning halls for weddings, receptions, and grand celebrations. Book your dream venue today.'}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/book"
            className="flex items-center gap-2 rounded-lg bg-gold px-8 py-4 text-base font-semibold text-navy shadow-gold-lg transition-all hover:bg-gold-400 hover:shadow-gold-lg"
          >
            Book Your Venue <ArrowRight size={18} />
          </Link>
          <Link
            href="/venues"
            className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-8 py-4 text-base font-semibold text-cream-100 backdrop-blur-sm transition-all hover:border-gold hover:text-gold"
          >
            Explore Venues
          </Link>
        </div>

        {/* Stats inline */}
        <div className="mt-16 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          {[
            { value: settings.hall_events_count || '5000+', label: 'Events Hosted' },
            { value: settings.hall_years_experience || '22+', label: 'Years of Excellence' },
            { value: '3', label: 'Unique Venues' },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-5">
              <p className="font-serif text-2xl font-bold text-gold sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-cream-300/70 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold/60 transition-colors hover:text-gold"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} className="animate-bounce" />
      </button>
    </section>
  )
}
