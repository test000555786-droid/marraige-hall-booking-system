'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { cn, formatDateLong } from '@/lib/utils'
import type { DbVenue } from '@/types/database'

interface Props {
  venues: DbVenue[]
}

type CheckResult = 'available' | 'unavailable' | 'blocked' | null

export default function AvailabilityChecker({ venues }: Props) {
  const router = useRouter()
  const [venueId, setVenueId] = useState('')
  const [date, setDate] = useState('')
  const [result, setResult] = useState<CheckResult>(null)
  const [isPending, startTransition] = useTransition()

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const handleCheck = () => {
    if (!venueId || !date) return

    startTransition(async () => {
      setResult(null)
      try {
        const res = await fetch(
          `/api/availability?venueId=${venueId}&date=${date}`
        )
        const json = await res.json()
        if (json.available) {
          setResult('available')
        } else if (json.reason === 'blocked') {
          setResult('blocked')
        } else {
          setResult('unavailable')
        }
      } catch {
        setResult('unavailable')
      }
    })
  }

  const handleBookNow = () => {
    router.push(`/book?venueId=${venueId}&date=${date}`)
  }

  const selectedVenue = venues.find((v) => v.id === venueId)

  return (
    <div className="rounded-2xl border border-cream-500 bg-cream p-6 shadow-sm md:p-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        {/* Venue select */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="venue-select" className="text-sm font-medium text-navy">
            Select Venue
          </label>
          <select
            id="venue-select"
            value={venueId}
            onChange={(e) => { setVenueId(e.target.value); setResult(null) }}
            className="rounded-lg border border-cream-500 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          >
            <option value="">All Venues</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} (up to {v.capacity_max.toLocaleString('en-IN')} guests)
              </option>
            ))}
          </select>
        </div>

        {/* Date input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="event-date" className="text-sm font-medium text-navy">
            Event Date
          </label>
          <input
            id="event-date"
            type="date"
            value={date}
            min={today}
            max={maxDateStr}
            onChange={(e) => { setDate(e.target.value); setResult(null) }}
            className="rounded-lg border border-cream-500 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        {/* Check button */}
        <div className="flex flex-col justify-end">
          <button
            onClick={handleCheck}
            disabled={!date || isPending}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all',
              !date
                ? 'cursor-not-allowed bg-cream-500 text-muted-foreground'
                : 'bg-gold text-navy hover:bg-gold-400 shadow-gold'
            )}
          >
            {isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Checking...</>
            ) : (
              <><CalendarCheck size={16} /> Check</>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div
          className={cn(
            'mt-5 rounded-xl border p-4 transition-all animate-fade-in',
            result === 'available'
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          )}
          role="status"
          aria-live="polite"
        >
          {result === 'available' ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">Date is Available!</p>
                <p className="mt-0.5 text-sm text-green-700">
                  {selectedVenue ? selectedVenue.name : 'Your selected venue'} is available on{' '}
                  <strong>{formatDateLong(date)}</strong>.
                </p>
                <button
                  onClick={handleBookNow}
                  className="mt-3 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  Book This Date →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <XCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">
                  {result === 'blocked' ? 'Date is Blocked' : 'Date is Unavailable'}
                </p>
                <p className="mt-0.5 text-sm text-red-700">
                  {result === 'blocked'
                    ? 'This date has been blocked by the management. Please choose another date.'
                    : `${selectedVenue ? selectedVenue.name : 'This venue'} is already booked on ${formatDateLong(date)}.`}
                </p>
                <button
                  onClick={() => { setDate(''); setResult(null) }}
                  className="mt-3 text-sm font-medium text-red-700 underline hover:no-underline"
                >
                  Try another date
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
