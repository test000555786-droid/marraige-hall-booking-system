import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react'
import type { HallSettings } from '@/types/database'

export default function SiteFooter({ settings }: { settings: HallSettings }) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy text-cream-300" role="contentinfo">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex flex-col leading-tight">
              <span className="font-serif text-2xl font-bold text-gold">
                {settings.hall_name || 'Shubh Vivah'}
              </span>
              <span className="text-xs uppercase tracking-widest text-cream-400/70">
                Marriage Hall
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-cream-400/70">
              {settings.hall_tagline || 'Where Every Celebration Becomes a Memory'}
            </p>
            {/* Social */}
            <div className="mt-5 flex items-center gap-3">
              {settings.social_facebook && (
                <a
                  href={settings.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-cream-300 transition-colors hover:border-gold hover:text-gold"
                >
                  <Facebook size={16} />
                </a>
              )}
              {settings.social_instagram && (
                <a
                  href={settings.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-cream-300 transition-colors hover:border-gold hover:text-gold"
                >
                  <Instagram size={16} />
                </a>
              )}
              {settings.social_whatsapp && (
                <a
                  href={`https://wa.me/${settings.social_whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-cream-300 transition-colors hover:border-gold hover:text-gold"
                >
                  <MessageCircle size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-serif text-base font-semibold text-cream-100">
              Quick Links
            </h3>
            <ul className="space-y-2.5" role="list">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/about' },
                { label: 'Our Venues', href: '/venues' },
                { label: 'Gallery', href: '/gallery' },
                { label: 'Amenities', href: '/amenities' },
                { label: 'Testimonials', href: '/testimonials' },
                { label: 'Check Availability', href: '/availability' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-400/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-4 font-serif text-base font-semibold text-cream-100">
              Account
            </h3>
            <ul className="space-y-2.5" role="list">
              {[
                { label: 'Book a Venue', href: '/book' },
                { label: 'My Dashboard', href: '/dashboard' },
                { label: 'My Bookings', href: '/bookings' },
                { label: 'Sign In', href: '/login' },
                { label: 'Register', href: '/register' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-400/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-serif text-base font-semibold text-cream-100">
              Contact Us
            </h3>
            <address className="not-italic space-y-3">
              <div className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                <p className="text-sm text-cream-400/70">
                  {settings.hall_address_line1}<br />
                  {settings.hall_address_line2}<br />
                  {settings.hall_city}, {settings.hall_state} — {settings.hall_pincode}
                </p>
              </div>
              {settings.hall_phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="shrink-0 text-gold" aria-hidden="true" />
                  <a
                    href={`tel:${settings.hall_phone.replace(/\s/g, '')}`}
                    className="text-sm text-cream-400/70 hover:text-gold transition-colors"
                  >
                    {settings.hall_phone}
                  </a>
                </div>
              )}
              {settings.hall_phone_alt && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="shrink-0 text-gold/50" aria-hidden="true" />
                  <a
                    href={`tel:${settings.hall_phone_alt.replace(/\s/g, '')}`}
                    className="text-sm text-cream-400/70 hover:text-gold transition-colors"
                  >
                    {settings.hall_phone_alt}
                  </a>
                </div>
              )}
              {settings.hall_email && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className="shrink-0 text-gold" aria-hidden="true" />
                  <a
                    href={`mailto:${settings.hall_email}`}
                    className="text-sm text-cream-400/70 hover:text-gold transition-colors"
                  >
                    {settings.hall_email}
                  </a>
                </div>
              )}
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
          <p className="text-xs text-cream-400/50">
            © {year} {settings.hall_name || 'Shubh Vivah Marriage Hall'}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-cream-400/50 hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-cream-400/50 hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
