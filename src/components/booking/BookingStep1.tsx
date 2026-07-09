'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarCheck, Users, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { bookingStep1Schema, type BookingStep1FormData } from '@/lib/validations'
import { formatCurrency, VENUE_TIER_LABELS, cn } from '@/lib/utils'
import type { DbVenue, HallSettings } from '@/types/database'

export default function BookingStep1({ venues, settings }: { venues: DbVenue[]; settings: HallSettings }) {
  const { step1, setStep1, setSelectedVenue, nextStep } = useBookingStore()
  const [conflictStatus, setConflictStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BookingStep1FormData>({
    resolver: zodResolver(bookingStep1Schema),
    defaultValues: { venueId: step1.venueId ?? '', eventDate: step1.eventDate ?? '' },
  })

  const watchVenue = watch('venueId')
  const watchDate = watch('eventDate')
  const selectedVenue = venues.find((v) => v.id === watchVenue)

  const minDays = parseInt(settings.min_advance_days ?? '7')
  const maxDays = parseInt(settings.max_advance_days ?? '365')
  const today = new Date()
  const minDate = new Date(today); minDate.setDate(today.getDate() + minDays)
  const maxDate = new Date(today); maxDate.setDate(today.getDate() + maxDays)

  const checkAvailability = () => {
    if (!watchVenue || !watchDate) return
    startTransition(async () => {
      setConflictStatus('checking')
      try {
        const res = await fetch(`/api/availability?venueId=${watchVenue}&date=${watchDate}`)
        const json = await res.json()
        setConflictStatus(json.available ? 'available' : 'taken')
      } catch { setConflictStatus('taken') }
    })
  }

  const onSubmit = async (data: BookingStep1FormData) => {
    if (conflictStatus !== 'available') {
      await new Promise<void>((resolve) => {
        startTransition(async () => {
          const res = await fetch(`/api/availability?venueId=${data.venueId}&date=${data.eventDate}`)
          const json = await res.json()
          setConflictStatus(json.available ? 'available' : 'taken')
          resolve()
        })
      })
      if (conflictStatus === 'taken') return
    }
    const venue = venues.find((v) => v.id === data.venueId)
    setStep1(data)
    setSelectedVenue(venue ?? null)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="font-serif text-2xl font-semibold text-navy mb-1">Choose Venue & Date</h2>
      <p className="text-sm text-muted-foreground mb-6">Select your preferred hall and event date</p>

      {/* Venue cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {venues.map((v) => (
          <label
            key={v.id}
            htmlFor={`venue-${v.id}`}
            className={cn(
              'relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all',
              watchVenue === v.id ? 'border-gold shadow-gold' : 'border-cream-500 hover:border-gold/40'
            )}
          >
            <input
              {...register('venueId')}
              type="radio"
              id={`venue-${v.id}`}
              value={v.id}
              className="sr-only"
              onChange={(e) => { setValue('venueId', e.target.value); setConflictStatus('idle') }}
            />
            {v.images[0] && (
              <div className="relative h-28">
                <Image src={v.images[0]} alt={v.name} fill className="object-cover" sizes="200px" />
              </div>
            )}
            <div className="p-3">
              <p className="font-semibold text-navy text-sm">{v.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <Users size={10} className="inline mr-1" />Up to {v.capacity_max.toLocaleString('en-IN')}
              </p>
              <p className="text-xs font-semibold text-gold mt-1">{formatCurrency(v.price_per_day)}/day</p>
            </div>
            {watchVenue === v.id && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-gold flex items-center justify-center">
                <CheckCircle2 size={14} className="text-navy" />
              </div>
            )}
          </label>
        ))}
      </div>
      {errors.venueId && <p className="mb-4 text-sm text-red-600" role="alert">{errors.venueId.message}</p>}

      {/* Date + availability check */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="event-date" className="mb-1.5 block text-sm font-medium text-navy">
            Event Date <span className="text-red-500">*</span>
          </label>
          <input
            id="event-date"
            type="date"
            min={minDate.toISOString().split('T')[0]}
            max={maxDate.toISOString().split('T')[0]}
            {...register('eventDate')}
            onChange={(e) => { setValue('eventDate', e.target.value); setConflictStatus('idle') }}
            className={cn(
              'w-full rounded-lg border px-4 py-3 text-sm text-navy outline-none transition-all',
              errors.eventDate ? 'border-red-400' : 'border-cream-500 focus:border-gold focus:ring-2 focus:ring-gold/20'
            )}
            aria-invalid={!!errors.eventDate}
          />
          {errors.eventDate && <p className="mt-1 text-xs text-red-600" role="alert">{errors.eventDate.message}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Bookings accepted {minDays}–{maxDays} days in advance
          </p>
        </div>

        <button
          type="button"
          onClick={checkAvailability}
          disabled={!watchVenue || !watchDate || isPending}
          className={cn(
            'flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all shrink-0',
            !watchVenue || !watchDate ? 'bg-cream text-muted-foreground cursor-not-allowed' : 'bg-navy text-gold hover:bg-navy-400'
          )}
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <CalendarCheck size={15} />}
          Check Availability
        </button>
      </div>

      {/* Availability result */}
      {conflictStatus !== 'idle' && conflictStatus !== 'checking' && (
        <div className={cn('mt-4 flex items-center gap-2 rounded-lg p-3 text-sm animate-fade-in', conflictStatus === 'available' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
          {conflictStatus === 'available'
            ? <><CheckCircle2 size={16} /> Date is available! Proceed to the next step.</>
            : <><XCircle size={16} /> This date is already booked. Please choose another.</>}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-gold px-8 py-3 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all disabled:opacity-60"
        >
          Continue to Details →
        </button>
      </div>
    </form>
  )
}
