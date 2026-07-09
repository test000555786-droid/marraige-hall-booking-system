'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isBefore, startOfDay, isToday, isSameMonth
} from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarX, CalendarCheck } from 'lucide-react'
import { cn, VENUE_CALENDAR_COLORS } from '@/lib/utils'
import type { DbVenue, DbBlockedDate } from '@/types/database'

interface Props {
  venues: DbVenue[]
  bookedDates: { event_date: string; venue_id: string }[]
  blockedDates: DbBlockedDate[]
  defaultVenueId?: string
}

type DayStatus = 'available' | 'booked' | 'blocked' | 'past'

export default function AvailabilityCalendar({ venues, bookedDates, blockedDates, defaultVenueId }: Props) {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(defaultVenueId ?? 'all')
  const [viewDate, setViewDate] = useState(new Date())
  const today = startOfDay(new Date())

  // Build lookup sets
  const bookedSet = useMemo(() => {
    return new Set(
      bookedDates
        .filter((b) => selectedVenueId === 'all' || b.venue_id === selectedVenueId)
        .map((b) => b.event_date)
    )
  }, [bookedDates, selectedVenueId])

  const blockedSet = useMemo(() => {
    return new Set(
      blockedDates
        .filter((b) => !b.venue_id || selectedVenueId === 'all' || b.venue_id === selectedVenueId)
        .map((b) => b.blocked_date)
    )
  }, [blockedDates, selectedVenueId])

  const getDayStatus = (date: Date): DayStatus => {
    if (isBefore(date, today)) return 'past'
    const key = format(date, 'yyyy-MM-dd')
    if (blockedSet.has(key)) return 'blocked'
    if (bookedSet.has(key)) return 'booked'
    return 'available'
  }

  const renderMonth = (monthDate: Date) => {
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const days = eachDayOfInterval({ start, end })
    const startDow = getDay(start) // 0=Sun

    return (
      <div key={monthDate.toISOString()} className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-center font-serif text-lg font-semibold text-navy">
          {format(monthDate, 'MMMM yyyy')}
        </h3>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="py-1 text-xs font-semibold uppercase text-muted-foreground">
              {d}
            </div>
          ))}

          {/* Empty cells for offset */}
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const status = getDayStatus(day)
            const dateStr = format(day, 'yyyy-MM-dd')
            const isCurrentDay = isToday(day)

            return (
              <div
                key={dateStr}
                className={cn(
                  'relative flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-all',
                  status === 'past' && 'text-muted-foreground/40 cursor-not-allowed',
                  status === 'available' && 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer',
                  status === 'booked' && 'bg-red-50 text-red-700 cursor-not-allowed',
                  status === 'blocked' && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  isCurrentDay && 'ring-2 ring-gold ring-offset-1'
                )}
                title={
                  status === 'available'
                    ? `${format(day, 'dd MMM yyyy')} — Available`
                    : status === 'booked'
                    ? `${format(day, 'dd MMM yyyy')} — Booked`
                    : status === 'blocked'
                    ? `${format(day, 'dd MMM yyyy')} — Blocked`
                    : undefined
                }
              >
                {format(day, 'd')}
                {status === 'available' && (
                  <Link
                    href={`/book?date=${dateStr}${selectedVenueId !== 'all' ? `&venueId=${selectedVenueId}` : ''}`}
                    className="absolute inset-0 rounded-lg"
                    aria-label={`Book ${format(day, 'dd MMM yyyy')}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const selectedVenue = venues.find((v) => v.id === selectedVenueId)

  return (
    <div>
      {/* Venue filter */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by venue">
          <button
            onClick={() => setSelectedVenueId('all')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all border',
              selectedVenueId === 'all'
                ? 'bg-navy text-gold border-navy'
                : 'bg-white text-navy border-cream-500 hover:border-gold hover:text-gold'
            )}
          >
            All Venues
          </button>
          {venues.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVenueId(v.id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all border',
                selectedVenueId === v.id
                  ? 'text-white border-transparent'
                  : 'bg-white text-navy border-cream-500 hover:border-gold hover:text-gold'
              )}
              style={
                selectedVenueId === v.id
                  ? { backgroundColor: VENUE_CALENDAR_COLORS[v.tier], borderColor: VENUE_CALENDAR_COLORS[v.tier] }
                  : undefined
              }
            >
              {v.name}
            </button>
          ))}
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            disabled={isBefore(subMonths(viewDate, 1), today)}
            className="rounded-lg border border-cream-500 bg-white p-2 text-navy hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40 transition-all"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="rounded-lg border border-cream-500 bg-white p-2 text-navy hover:border-gold hover:text-gold transition-all"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Two-month calendar grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {renderMonth(viewDate)}
        {renderMonth(addMonths(viewDate, 1))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 rounded-xl border border-cream-500 bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-100 border border-green-200" />
          <span className="text-sm text-navy">Available — click to book</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-100 border border-red-200" />
          <span className="text-sm text-navy">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gray-100 border border-gray-200" />
          <span className="text-sm text-navy">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-cream-400 border border-cream-500 opacity-40" />
          <span className="text-sm text-navy">Past date</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-gold" />
          <span className="text-sm text-navy">Today</span>
        </div>
      </div>

      {/* Quick book CTA */}
      {selectedVenue && (
        <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-navy">Viewing: {selectedVenue.name}</p>
            <p className="text-sm text-muted-foreground">
              Up to {selectedVenue.capacity_max.toLocaleString('en-IN')} guests · from ₹{selectedVenue.price_per_day.toLocaleString('en-IN')}/day
            </p>
          </div>
          <Link
            href={`/book?venueId=${selectedVenue.id}`}
            className="shrink-0 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all"
          >
            Book This Venue
          </Link>
        </div>
      )}
    </div>
  )
}
