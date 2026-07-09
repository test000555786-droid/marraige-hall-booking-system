'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HallSettings } from '@/types/database'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Venues', href: '/venues' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Amenities', href: '/amenities' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Availability', href: '/availability' },
  { label: 'Contact', href: '/contact' },
]

export default function SiteHeader({ settings }: { settings: HallSettings }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setIsOpen(false) }, [pathname])

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isHome && !scrolled
          ? 'bg-transparent'
          : 'bg-navy shadow-navy/20 shadow-lg'
      )}
    >

      {/* Main nav */}
      <nav className="container" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-tight">
            <span className="font-serif text-xl font-bold text-gold">
              {settings.hall_name || 'Shubh Vivah'}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-cream-400/80">
              Marriage Hall
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 lg:flex" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-gold'
                      : 'text-cream-300 hover:text-gold'
                  )}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="hidden rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-navy shadow-gold transition-all hover:bg-gold-400 hover:shadow-gold-lg sm:inline-flex"
            >
              Book Now
            </Link>
            <Link
              href="/login"
              className="hidden text-sm text-cream-300 hover:text-gold transition-colors lg:inline-flex"
            >
              Sign In
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-cream-300 hover:text-gold lg:hidden"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 lg:hidden',
            isOpen ? 'max-h-screen pb-4' : 'max-h-0'
          )}
          aria-hidden={!isOpen}
        >
          <ul className="flex flex-col gap-1 border-t border-white/10 pt-3" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'block rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-white/10 text-gold'
                      : 'text-cream-300 hover:bg-white/5 hover:text-gold'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 px-4">
              <Link
                href="/book"
                className="block w-full rounded-lg bg-gold py-2.5 text-center text-sm font-semibold text-navy"
              >
                Book Now
              </Link>
            </li>
            <li className="px-4">
              <Link
                href="/login"
                className="block w-full rounded-lg border border-white/20 py-2.5 text-center text-sm text-cream-300"
              >
                Sign In
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
