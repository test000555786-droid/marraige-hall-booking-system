import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getHallSettings } from '@/lib/queries'
import { ArrowRight, Award, Heart, Users, Star } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getHallSettings()
  return {
    title: 'About Us',
    description: `Learn about ${s.hall_name || 'Shubh Vivah Marriage Hall'} — ${s.hall_years_experience || '22+'} years of creating unforgettable celebrations in ${s.hall_city || 'Hyderabad'}.`,
  }
}

export default async function AboutPage() {
  const s = await getHallSettings()

  const values = [
    {
      icon: Heart,
      title: 'Every Detail Matters',
      description:
        'We believe your special day deserves meticulous attention to every detail. From lighting to table arrangements, nothing is left to chance.',
    },
    {
      icon: Award,
      title: 'Excellence in Service',
      description:
        'Our experienced team brings years of event management expertise to ensure your celebration runs flawlessly from start to finish.',
    },
    {
      icon: Users,
      title: 'Family-Oriented',
      description:
        'We treat every family that books with us as our own. Your joy is our mission, and your memories are our legacy.',
    },
    {
      icon: Star,
      title: 'Trusted by Thousands',
      description:
        `With over ${s.hall_events_count || '5000+'} successful events and a 4.9-star average rating, our reputation speaks for itself.`,
    },
  ]

  const milestones = [
    { year: s.hall_established_year || '2002', event: 'Founded with a vision to create extraordinary celebration spaces in Hyderabad.' },
    { year: '2008', event: 'Expanded to add the Emerald Hall, doubling our capacity for premium events.' },
    { year: '2015', event: 'Inaugurated the iconic Diamond Ballroom — our 15,000 sq. ft. flagship venue.' },
    { year: '2020', event: 'Launched our online booking system, bringing convenience to our guests.' },
    { year: '2024', event: `Celebrated our ${s.hall_events_count || '5000th'} event — a testament to your trust.` },
  ]

  return (
    <>
      {/* Page hero */}
      <section className="relative flex h-72 items-center justify-center overflow-hidden bg-navy pt-16 md:h-96">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1920&q=80')` }}
        />
        <div className="relative z-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">Our Story</p>
          <h1 className="font-serif text-display-md text-cream-100 md:text-display-lg">About Us</h1>
        </div>
      </section>

      {/* About content */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">Who We Are</p>
              <h2 className="font-serif text-display-sm text-navy">
                {s.hall_years_experience || '22+'} Years of Creating Memories
              </h2>
              <div className="mt-5 space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  {s.hall_about ||
                    'Shubh Vivah Marriage Hall has been the premier venue for celebrations in Hyderabad for over two decades. With three beautifully appointed halls, we have hosted thousands of weddings, receptions, and special events, creating memories that last a lifetime.'}
                </p>
                <p className="leading-relaxed">
                  Located in the heart of {s.hall_city || 'Hyderabad'}, our halls blend traditional grandeur with modern comforts. Every aspect of our venue — from the décor to the acoustics — has been thoughtfully designed to make your event truly exceptional.
                </p>
                <p className="leading-relaxed">
                  We pride ourselves on being more than just a venue. Our dedicated team works closely with each family to understand their unique vision and bring it to life with warmth and professionalism.
                </p>
              </div>
              <Link
                href="/venues"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 font-semibold text-gold hover:bg-navy-400 transition-colors"
              >
                Explore Our Venues <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-navy">
                <Image
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"
                  alt="Elegant banquet hall interior at Shubh Vivah"
                  width={600}
                  height={450}
                  className="w-full object-cover"
                />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-gold p-5 shadow-gold-lg md:block">
                <p className="font-serif text-3xl font-bold text-navy">{s.hall_events_count || '5000+'}</p>
                <p className="text-sm font-medium text-navy/80">Events Hosted</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream py-16 lg:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">Our Values</p>
            <h2 className="font-serif text-display-sm text-navy">What We Stand For</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-cream-500 bg-white p-6 text-center shadow-sm hover:shadow-gold transition-shadow">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient shadow-gold">
                  <Icon size={24} className="text-navy" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-navy py-16 lg:py-24">
        <div className="container max-w-3xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">Our Journey</p>
            <h2 className="font-serif text-display-sm text-cream-100">Milestones That Shaped Us</h2>
          </div>
          <ol className="relative border-l border-gold/30" aria-label="Company milestones">
            {milestones.map((m, i) => (
              <li key={m.year} className="mb-10 ml-8 last:mb-0">
                <span className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy ring-4 ring-navy">
                  {i + 1}
                </span>
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <p className="mb-1 text-sm font-bold text-gold">{m.year}</p>
                  <p className="text-sm text-cream-300/80">{m.event}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream py-16">
        <div className="container text-center">
          <h2 className="font-serif text-display-sm text-navy">Ready to Write Your Story With Us?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Join the thousands of families who have trusted us with their most important celebrations.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/book" className="rounded-lg bg-gold px-8 py-3.5 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all">
              Book a Venue
            </Link>
            <Link href="/contact" className="rounded-lg border border-navy/30 px-8 py-3.5 font-semibold text-navy hover:border-gold hover:text-gold transition-all">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
