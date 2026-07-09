'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBookingStore } from '@/store/bookingStore'
import { bookingStep2Schema, type BookingStep2FormData } from '@/lib/validations'
import { EVENT_TYPE_LABELS, cn } from '@/lib/utils'
import type { EventType } from '@/types/database'

const EVENT_TYPES = Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]

export default function BookingStep2() {
  const { step2, setStep2, nextStep, prevStep } = useBookingStore()

  const { register, handleSubmit, formState: { errors } } = useForm<BookingStep2FormData>({
    resolver: zodResolver(bookingStep2Schema),
    defaultValues: {
      customerName: step2.customerName ?? '',
      customerPhone: step2.customerPhone ?? '',
      customerEmail: step2.customerEmail ?? '',
      eventType: step2.eventType,
      guestCount: step2.guestCount,
      notes: step2.notes ?? '',
    },
  })

  const onSubmit = (data: BookingStep2FormData) => {
    setStep2(data)
    nextStep()
  }

  const fieldClass = (hasErr: boolean) => cn(
    'w-full rounded-lg border px-4 py-3 text-sm text-navy outline-none transition-all',
    hasErr ? 'border-red-400 bg-red-50' : 'border-cream-500 bg-white focus:border-gold focus:ring-2 focus:ring-gold/20'
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="font-serif text-2xl font-semibold text-navy mb-1">Your Details</h2>
      <p className="text-sm text-muted-foreground mb-6">Tell us about yourself and your event</p>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cust-name" className="mb-1.5 block text-sm font-medium text-navy">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input id="cust-name" type="text" autoComplete="name" placeholder="Your full name" {...register('customerName')} className={fieldClass(!!errors.customerName)} aria-invalid={!!errors.customerName} />
            {errors.customerName && <p className="mt-1 text-xs text-red-600" role="alert">{errors.customerName.message}</p>}
          </div>
          <div>
            <label htmlFor="cust-phone" className="mb-1.5 block text-sm font-medium text-navy">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input id="cust-phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" {...register('customerPhone')} className={fieldClass(!!errors.customerPhone)} aria-invalid={!!errors.customerPhone} />
            {errors.customerPhone && <p className="mt-1 text-xs text-red-600" role="alert">{errors.customerPhone.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="cust-email" className="mb-1.5 block text-sm font-medium text-navy">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input id="cust-email" type="email" autoComplete="email" placeholder="you@example.com" {...register('customerEmail')} className={fieldClass(!!errors.customerEmail)} aria-invalid={!!errors.customerEmail} />
          {errors.customerEmail && <p className="mt-1 text-xs text-red-600" role="alert">{errors.customerEmail.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-type" className="mb-1.5 block text-sm font-medium text-navy">
              Event Type <span className="text-red-500">*</span>
            </label>
            <select id="event-type" {...register('eventType')} className={fieldClass(!!errors.eventType)} aria-invalid={!!errors.eventType}>
              <option value="">Select event type</option>
              {EVENT_TYPES.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            {errors.eventType && <p className="mt-1 text-xs text-red-600" role="alert">{errors.eventType.message}</p>}
          </div>
          <div>
            <label htmlFor="guest-count" className="mb-1.5 block text-sm font-medium text-navy">
              Expected Guests <span className="text-red-500">*</span>
            </label>
            <input
              id="guest-count"
              type="number"
              min={1}
              max={5000}
              placeholder="e.g. 300"
              {...register('guestCount', { valueAsNumber: true })}
              className={fieldClass(!!errors.guestCount)}
              aria-invalid={!!errors.guestCount}
            />
            {errors.guestCount && <p className="mt-1 text-xs text-red-600" role="alert">{errors.guestCount.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-navy">
            Special Requests <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <textarea id="notes" rows={3} placeholder="Any special requirements, dietary needs, or additional requests..." {...register('notes')} className={cn(fieldClass(!!errors.notes), 'resize-none')} />
          {errors.notes && <p className="mt-1 text-xs text-red-600" role="alert">{errors.notes.message}</p>}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={prevStep} className="rounded-lg border border-navy/20 px-6 py-3 text-sm font-semibold text-navy hover:border-gold hover:text-gold transition-all">
          ← Back
        </button>
        <button type="submit" className="rounded-lg bg-gold px-8 py-3 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all">
          Review Booking →
        </button>
      </div>
    </form>
  )
}
