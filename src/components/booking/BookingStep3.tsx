'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBookingStore } from '@/store/bookingStore'
import { bookingStep3Schema, type BookingStep3FormData } from '@/lib/validations'
import { calculatePricing, formatCurrency, formatDateLong, EVENT_TYPE_LABELS } from '@/lib/utils'
import type { HallSettings } from '@/types/database'
import { CalendarDays, Users, Building2, Info } from 'lucide-react'

export default function BookingStep3({ settings }: { settings: HallSettings }) {
  const { step1, step2, selectedVenue, setPricingBreakdown, nextStep, prevStep } = useBookingStore()
  const advancePct = parseInt(settings.advance_payment_percent ?? '30')

  const pricing = selectedVenue
    ? calculatePricing(selectedVenue.price_per_day, advancePct)
    : null

  useEffect(() => { if (pricing) setPricingBreakdown(pricing) }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<BookingStep3FormData>({
    resolver: zodResolver(bookingStep3Schema),
  })

  const onSubmit = () => nextStep()

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="font-serif text-2xl font-semibold text-navy mb-1">Review Your Booking</h2>
      <p className="text-sm text-muted-foreground mb-6">Please review all details before proceeding to payment</p>

      {/* Booking summary */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="rounded-xl bg-cream p-5 space-y-3">
          <h3 className="font-semibold text-navy flex items-center gap-2"><Building2 size={16} className="text-gold" /> Venue</h3>
          <p className="font-semibold text-navy">{selectedVenue?.name}</p>
          <p className="text-sm text-muted-foreground">{selectedVenue?.short_description}</p>
        </div>
        <div className="rounded-xl bg-cream p-5 space-y-3">
          <h3 className="font-semibold text-navy flex items-center gap-2"><CalendarDays size={16} className="text-gold" /> Event</h3>
          <p className="font-semibold text-navy">{step1.eventDate ? formatDateLong(step1.eventDate) : '—'}</p>
          <p className="text-sm text-muted-foreground">
            {step2.eventType ? EVENT_TYPE_LABELS[step2.eventType] : '—'} ·{' '}
            <Users size={12} className="inline" /> {step2.guestCount?.toLocaleString('en-IN')} guests
          </p>
        </div>
      </div>

      {/* Customer info */}
      <div className="rounded-xl border border-cream-500 bg-white p-5 mb-6">
        <h3 className="font-semibold text-navy mb-3">Contact Details</h3>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium text-navy">{step2.customerName}</p></div>
          <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium text-navy">{step2.customerPhone}</p></div>
          <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium text-navy break-all">{step2.customerEmail}</p></div>
        </div>
        {step2.notes && (
          <div className="mt-3 pt-3 border-t border-cream-400">
            <p className="text-xs text-muted-foreground">Special Requests</p>
            <p className="text-sm text-navy mt-0.5">{step2.notes}</p>
          </div>
        )}
      </div>

      {/* Pricing breakdown */}
      {pricing && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-5 mb-6">
          <h3 className="font-semibold text-navy mb-4">Pricing Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Venue Rental (1 day)</span>
              <span className="font-medium text-navy">{formatCurrency(pricing.basePrice)}</span>
            </div>
            <div className="flex justify-between border-t border-gold/20 pt-2">
              <span className="text-muted-foreground">Advance Payment ({advancePct}%)</span>
              <span className="font-semibold text-gold">{formatCurrency(pricing.advanceAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance (due on event day)</span>
              <span className="font-medium text-navy">{formatCurrency(pricing.balanceAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-gold/20 pt-2">
              <span className="font-bold text-navy">Total</span>
              <span className="font-bold text-navy">{formatCurrency(pricing.totalAmount)}</span>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
            <Info size={14} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700">
              You only need to pay the advance amount of <strong>{formatCurrency(pricing.advanceAmount)}</strong> now. The balance is collected on the event day.
            </p>
          </div>
        </div>
      )}

      {/* Cancellation policy */}
      <div className="rounded-xl border border-cream-500 bg-white p-5 mb-6">
        <h3 className="font-semibold text-navy mb-2">Cancellation Policy</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {settings.cancellation_policy || 'Cancellations made 30 or more days before the event receive a full refund. 15–29 days: 50% refund. Within 14 days: no refund.'}
        </p>
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-3 cursor-pointer" htmlFor="agree-policy">
        <input
          id="agree-policy"
          type="checkbox"
          {...register('agreed')}
          className="mt-0.5 h-4 w-4 rounded border-cream-500 accent-gold"
          aria-describedby={errors.agreed ? 'agree-err' : undefined}
        />
        <span className="text-sm text-navy">
          I have read and agree to the <strong>cancellation policy</strong> and <strong>booking terms</strong>. I understand the advance payment is required to confirm my booking.
        </span>
      </label>
      {errors.agreed && (
        <p id="agree-err" className="mt-1 text-xs text-red-600" role="alert">{errors.agreed.message}</p>
      )}

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={prevStep} className="rounded-lg border border-navy/20 px-6 py-3 text-sm font-semibold text-navy hover:border-gold hover:text-gold transition-all">
          ← Back
        </button>
        <button type="submit" className="rounded-lg bg-gold px-8 py-3 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all">
          Proceed to Payment →
        </button>
      </div>
    </form>
  )
}
