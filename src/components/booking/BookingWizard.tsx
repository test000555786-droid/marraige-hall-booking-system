'use client'

import { useEffect } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import BookingStep1 from './BookingStep1'
import BookingStep2 from './BookingStep2'
import BookingStep3 from './BookingStep3'
import BookingStep4 from './BookingStep4'
import { cn } from '@/lib/utils'
import type { DbVenue, HallSettings } from '@/types/database'

const STEPS = [
  { n: 1, label: 'Venue & Date' },
  { n: 2, label: 'Your Details' },
  { n: 3, label: 'Review' },
  { n: 4, label: 'Payment' },
]

interface Props {
  venues: DbVenue[]
  settings: HallSettings
  defaultVenueId?: string
  defaultDate?: string
}

export default function BookingWizard({ venues, settings, defaultVenueId, defaultDate }: Props) {
  const { step, setStep1, setSelectedVenue } = useBookingStore()

  // Pre-fill from URL params
  useEffect(() => {
    if (defaultVenueId) {
      const v = venues.find((x) => x.id === defaultVenueId)
      if (v) {
        setSelectedVenue(v)
        setStep1({ venueId: defaultVenueId, eventDate: defaultDate })
      }
    }
  }, [defaultVenueId, defaultDate])

  return (
    <div>
      {/* Progress bar */}
      <nav aria-label="Booking steps" className="mb-8">
        <ol className="flex items-center">
          {STEPS.map((s, i) => (
            <li key={s.n} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                    step === s.n
                      ? 'border-gold bg-gold text-navy'
                      : step > s.n
                      ? 'border-gold bg-gold text-navy'
                      : 'border-cream-500 bg-white text-muted-foreground'
                  )}
                  aria-current={step === s.n ? 'step' : undefined}
                >
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className={cn('mt-1.5 hidden text-xs font-medium sm:block', step >= s.n ? 'text-navy' : 'text-muted-foreground')}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('mx-2 h-0.5 flex-1 transition-all', step > s.n ? 'bg-gold' : 'bg-cream-500')} />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      <div className="rounded-2xl border border-cream-500 bg-white p-6 shadow-sm md:p-8">
        {step === 1 && <BookingStep1 venues={venues} settings={settings} />}
        {step === 2 && <BookingStep2 />}
        {step === 3 && <BookingStep3 settings={settings} />}
        {step === 4 && <BookingStep4 settings={settings} />}
      </div>
    </div>
  )
}
