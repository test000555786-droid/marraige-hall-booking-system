import type { Metadata } from 'next'
import { getHallSettings } from '@/lib/queries'
import ContactForm from '@/components/public/ContactForm'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getHallSettings()
  return {
    title: 'Contact Us',
    description: `Get in touch with ${s.hall_name || 'Shubh Vivah Marriage Hall'}. Call, email, or visit us in ${s.hall_city || 'Hyderabad'}.`,
  }
}

export default async function ContactPage() {
  const s = await getHallSettings()

  const contactDetails = [
    {
      icon: Phone,
      label: 'Phone',
      value: s.hall_phone,
      href: `tel:${s.hall_phone?.replace(/\s/g, '')}`,
    },
    {
      icon: Phone,
      label: 'Alternate',
      value: s.hall_phone_alt,
      href: `tel:${s.hall_phone_alt?.replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: 'Email',
      value: s.hall_email,
      href: `mailto:${s.hall_email}`,
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: s.social_whatsapp,
      href: `https://wa.me/${s.social_whatsapp?.replace(/\D/g, '')}`,
    },
  ].filter((d) => d.value)

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-64 items-center justify-center overflow-hidden bg-navy pt-16 md:h-80">
        <div className="relative z-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">We'd Love to Hear From You</p>
          <h1 className="font-serif text-display-md text-cream-100 md:text-display-lg">Contact Us</h1>
        </div>
      </section>

      <section className="bg-cream py-16 lg:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-5">

            {/* Contact info */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-display-xs text-navy">Get in Touch</h2>
              <p className="mt-3 text-muted-foreground">
                Have questions about our venues, pricing, or availability? Our team is happy to help you plan your perfect celebration.
              </p>

              <div className="mt-8 space-y-4">
                {contactDetails.map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={label === 'WhatsApp' ? '_blank' : undefined}
                    rel={label === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-4 rounded-xl border border-cream-500 bg-white p-4 shadow-sm transition-all hover:border-gold hover:shadow-gold"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-gradient">
                      <Icon size={16} className="text-navy" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="mt-0.5 font-medium text-navy">{value}</p>
                    </div>
                  </a>
                ))}

                {/* Address */}
                <div className="flex items-start gap-4 rounded-xl border border-cream-500 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-gradient">
                    <MapPin size={16} className="text-navy" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Address</p>
                    <address className="mt-0.5 not-italic font-medium text-navy text-sm">
                      {s.hall_address_line1}<br />
                      {s.hall_address_line2}<br />
                      {s.hall_city}, {s.hall_state} — {s.hall_pincode}
                    </address>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4 rounded-xl border border-cream-500 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-gradient">
                    <Clock size={16} className="text-navy" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Office Hours</p>
                    <p className="mt-0.5 text-sm font-medium text-navy">Monday – Sunday</p>
                    <p className="text-sm text-muted-foreground">9:00 AM – 8:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-cream-500 bg-white p-8 shadow-sm">
                <h2 className="font-serif text-display-xs text-navy">Send Us a Message</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill in the form below and we'll get back to you within 24 hours.
                </p>
                <div className="mt-6">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-cream-500 shadow-sm">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD-placeholder&q=${encodeURIComponent(
                `${s.hall_address_line1}, ${s.hall_city}`
              )}`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shubh Vivah Marriage Hall location on Google Maps"
              aria-label="Map showing our location"
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <a
              href={s.hall_google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(`${s.hall_address_line1}, ${s.hall_city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline hover:no-underline"
            >
              Open in Google Maps ↗
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
