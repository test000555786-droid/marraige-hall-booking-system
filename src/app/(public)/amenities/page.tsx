import type { Metadata } from 'next'
import Link from 'next/link'
import { getActiveVenues } from '@/lib/queries'
import {
  Wifi, Zap, Car, Music, UtensilsCrossed, Shirt,
  Shield, Wind, Lightbulb, Mic, Users, Star, ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Amenities',
  description: 'World-class amenities at Shubh Vivah Marriage Hall — AC halls, professional sound, catering, parking, bridal suites and more.',
}

const AMENITY_ICONS: Record<string, React.ElementType> = {
  'AC': Wind,
  'Sound': Music,
  'Parking': Car,
  'Catering': UtensilsCrossed,
  'Generator': Zap,
  'Security': Shield,
  'Lighting': Lightbulb,
  'Mic': Mic,
  'Bridal': Shirt,
  'Valet': Car,
  'Wifi': Wifi,
  'Lounge': Users,
}

function getIcon(amenity: string): React.ElementType {
  const key = Object.keys(AMENITY_ICONS).find((k) =>
    amenity.toLowerCase().includes(k.toLowerCase())
  )
  return key ? AMENITY_ICONS[key] : Star
}

const GENERAL_AMENITIES = [
  {
    category: 'Comfort & Climate',
    icon: Wind,
    items: [
      { name: 'Fully Air-Conditioned Halls', desc: 'Multi-zone precision cooling throughout all halls.' },
      { name: 'Backup Generators', desc: 'Zero downtime — seamless power backup for entire premises.' },
      { name: 'Clean Restrooms', desc: 'Multiple sets of spotless restrooms on every floor.' },
    ],
  },
  {
    category: 'Audio & Visual',
    icon: Music,
    items: [
      { name: 'Professional Sound System', desc: 'Crystal-clear audio filling every corner of the hall.' },
      { name: 'Stage & LED Lighting', desc: 'Programmable lighting to set the perfect mood.' },
      { name: 'DJ Console', desc: 'Built-in DJ setup in Diamond Ballroom (addon in others).' },
      { name: 'Wireless Microphones', desc: 'Multiple wireless mics for ceremonies and speeches.' },
    ],
  },
  {
    category: 'Catering & Kitchen',
    icon: UtensilsCrossed,
    items: [
      { name: 'Full Commercial Kitchen', desc: 'Industrial-grade kitchen facilities for your caterer.' },
      { name: 'Catering Coordination', desc: 'Our team coordinates seamlessly with your chosen caterer.' },
      { name: 'Dining Setup', desc: 'Round tables, buffet counters, and serving stations available.' },
    ],
  },
  {
    category: 'Hospitality',
    icon: Shirt,
    items: [
      { name: 'Bridal Suite', desc: 'Elegantly appointed private suite for the bride and family.' },
      { name: 'Groom\'s Room', desc: 'Separate, well-furnished preparation room for the groom.' },
      { name: 'VIP Lounge', desc: 'Exclusive lounge area for distinguished guests.' },
      { name: 'Changing Rooms', desc: 'Private changing rooms for performers and staff.' },
    ],
  },
  {
    category: 'Parking & Security',
    icon: Shield,
    items: [
      { name: 'Ample Parking', desc: 'Covered and open parking for hundreds of vehicles.' },
      { name: 'Valet Parking', desc: 'Professional valet service available on request.' },
      { name: '24/7 Security', desc: 'CCTV surveillance and trained security personnel.' },
      { name: 'Fire Safety', desc: 'Fully compliant fire safety systems throughout the premises.' },
    ],
  },
]

export default async function AmenitiesPage() {
  const { data: venues } = await getActiveVenues()

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-72 items-center justify-center overflow-hidden bg-navy pt-16 md:h-80">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&q=80')` }}
        />
        <div className="relative z-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">World-Class Facilities</p>
          <h1 className="font-serif text-display-md text-cream-100 md:text-display-lg">Amenities & Facilities</h1>
          <p className="mt-3 text-cream-300/70">Everything you need for the perfect celebration</p>
        </div>
      </section>

      {/* General amenities */}
      <section className="bg-cream py-16 lg:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">What We Offer</p>
            <h2 className="font-serif text-display-sm text-navy">All-Inclusive Excellence</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Our halls are equipped with everything your celebration demands — no surprises, no compromises.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {GENERAL_AMENITIES.map(({ category, icon: CatIcon, items }) => (
              <div key={category} className="rounded-2xl border border-cream-500 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient">
                    <CatIcon size={18} className="text-navy" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-navy">{category}</h3>
                </div>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.name} className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-navy">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Per-venue amenities */}
      {venues && venues.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">By Venue</p>
              <h2 className="font-serif text-display-sm text-navy">Venue-Specific Features</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {venues.map((venue) => (
                <div key={venue.id} className="rounded-2xl border border-cream-500 bg-cream p-6">
                  <h3 className="font-serif text-xl font-semibold text-navy">{venue.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Up to {venue.capacity_max.toLocaleString('en-IN')} guests
                  </p>
                  <ul className="mt-4 space-y-2">
                    {venue.amenities.map((a) => {
                      const Icon = getIcon(a)
                      return (
                        <li key={a} className="flex items-center gap-2.5 text-sm text-navy">
                          <Icon size={14} className="shrink-0 text-gold" aria-hidden="true" />
                          {a}
                        </li>
                      )
                    })}
                  </ul>
                  <Link
                    href={`/book?venueId=${venue.id}`}
                    className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-gold hover:bg-navy-400 transition-colors"
                  >
                    Book {venue.name} <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gold py-14">
        <div className="container text-center">
          <h2 className="font-serif text-display-xs text-navy md:text-display-sm">
            Ready to Experience It Firsthand?
          </h2>
          <p className="mt-3 text-navy/80">
            Schedule a venue tour or book your date online — we'd love to show you around.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/book" className="rounded-lg bg-navy px-8 py-3.5 font-semibold text-gold hover:bg-navy-400 transition-colors">
              Book Now
            </Link>
            <Link href="/contact" className="rounded-lg border border-navy/30 px-8 py-3.5 font-semibold text-navy hover:bg-navy/10 transition-colors">
              Schedule a Tour
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
