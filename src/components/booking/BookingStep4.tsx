'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Upload, X, CreditCard, Banknote, Copy, CheckCircle2 } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { bookingStep4Schema, type BookingStep4FormData } from '@/lib/validations'
import { formatCurrency, cn } from '@/lib/utils'
import type { HallSettings } from '@/types/database'

export default function BookingStep4({ settings }: { settings: HallSettings }) {
  const router = useRouter()
  const { step1, step2, pricingBreakdown, selectedVenue, setSubmissionError, setConfirmedBookingRef, resetBooking, prevStep } = useBookingStore()
  const [payMethod, setPayMethod] = useState<'upi' | 'cash'>('upi')
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BookingStep4FormData>({
    resolver: zodResolver(bookingStep4Schema),
    defaultValues: { paymentMethod: 'upi' },
  })

  const copyUPI = () => {
    navigator.clipboard.writeText(settings.hall_upi_id ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setValue('screenshotFile', file as never)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: BookingStep4FormData) => {
    setIsSubmitting(true)
    setSubmissionError(null)
    try {
      const formData = new FormData()
      formData.append('venueId', step1.venueId ?? '')
      formData.append('eventDate', step1.eventDate ?? '')
      formData.append('customerName', step2.customerName ?? '')
      formData.append('customerPhone', step2.customerPhone ?? '')
      formData.append('customerEmail', step2.customerEmail ?? '')
      formData.append('eventType', step2.eventType ?? '')
      formData.append('guestCount', String(step2.guestCount ?? 0))
      formData.append('notes', step2.notes ?? '')
      formData.append('paymentMethod', data.paymentMethod)
      if (data.paymentMethod === 'upi') {
        formData.append('transactionId', (data as { paymentMethod: 'upi'; transactionId: string }).transactionId)
        const upiData = data as { paymentMethod: 'upi'; screenshotFile: File }
        if (upiData.screenshotFile) formData.append('screenshot', upiData.screenshotFile)
      }

      const res = await fetch('/api/bookings', { method: 'POST', body: formData })
      const json = await res.json()

      if (json.error) throw new Error(json.error)

      setConfirmedBookingRef(json.data.bookingRef)
      toast.success('Booking submitted successfully!')
      resetBooking()
      router.push(`/book/confirm?ref=${json.data.bookingRef}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.'
      setSubmissionError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="font-serif text-2xl font-semibold text-navy mb-1">Payment</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Pay advance amount of <strong className="text-gold">{formatCurrency(pricingBreakdown?.advanceAmount ?? 0)}</strong>
      </p>

      {/* Payment method toggle */}
      <div className="flex gap-3 mb-6">
        {([['upi', 'UPI Payment', CreditCard], ['cash', 'Pay in Cash', Banknote]] as const).map(([val, label, Icon]) => (
          <button
            key={val}
            type="button"
            onClick={() => { setPayMethod(val); setValue('paymentMethod', val as 'upi' | 'cash') }}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all',
              payMethod === val ? 'border-gold bg-gold/5 text-gold' : 'border-cream-500 text-muted-foreground hover:border-gold/40'
            )}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {payMethod === 'upi' ? (
        <div className="space-y-5">
          {/* UPI QR */}
          <div className="rounded-xl border border-cream-500 bg-white p-5 text-center">
            {settings.hall_upi_qr_url ? (
              <div className="mx-auto mb-3 w-40 h-40 relative">
                <Image src={settings.hall_upi_qr_url} alt="UPI QR Code" fill className="object-contain" />
              </div>
            ) : (
              <div className="mx-auto mb-3 flex h-36 w-36 items-center justify-center rounded-lg bg-cream-400 border border-dashed border-cream-600">
                <p className="text-xs text-muted-foreground">QR Code</p>
              </div>
            )}
            <p className="text-sm font-semibold text-navy">{settings.hall_upi_name}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <code className="rounded bg-cream px-3 py-1 text-sm font-mono text-navy">{settings.hall_upi_id}</code>
              <button type="button" onClick={copyUPI} className="text-gold hover:text-gold-600 transition-colors" aria-label="Copy UPI ID">
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Pay exactly <strong className="text-gold">{formatCurrency(pricingBreakdown?.advanceAmount ?? 0)}</strong> and upload the screenshot below
            </p>
          </div>

          {/* Transaction ID */}
          <div>
            <label htmlFor="txn-id" className="mb-1.5 block text-sm font-medium text-navy">
              Transaction ID / UTR Number <span className="text-red-500">*</span>
            </label>
            <input
              id="txn-id"
              type="text"
              placeholder="e.g. 324567891234"
              {...register('transactionId' as never)}
              className={cn('w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all', errors.transactionId ? 'border-red-400 bg-red-50' : 'border-cream-500 focus:border-gold focus:ring-2 focus:ring-gold/20')}
            />
            {errors.transactionId && <p className="mt-1 text-xs text-red-600" role="alert">{(errors.transactionId as { message: string }).message}</p>}
          </div>

          {/* Screenshot upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">
              Payment Screenshot <span className="text-red-500">*</span>
            </label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFile} id="screenshot-upload" />
            {preview ? (
              <div className="relative rounded-xl border border-gold/30 overflow-hidden">
                <img src={preview} alt="Payment screenshot preview" className="max-h-64 w-full object-contain bg-cream" />
                <button
                  type="button"
                  onClick={() => { setPreview(null); setValue('screenshotFile' as never, undefined as never); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                  aria-label="Remove screenshot"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label htmlFor="screenshot-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-cream-500 bg-cream p-8 hover:border-gold transition-colors">
                <Upload size={28} className="text-gold mb-2" />
                <p className="text-sm font-medium text-navy">Click to upload screenshot</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP · Max 5MB</p>
              </label>
            )}
            {errors.screenshotFile && <p className="mt-1 text-xs text-red-600" role="alert">{(errors.screenshotFile as { message: string }).message}</p>}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-cream-500 bg-cream p-6 text-center">
          <Banknote size={40} className="mx-auto mb-3 text-gold" />
          <h3 className="font-semibold text-navy">Pay Cash at the Hall</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your booking will be recorded as <strong>pending payment</strong>. Please visit our office and pay the advance amount of{' '}
            <strong className="text-gold">{formatCurrency(pricingBreakdown?.advanceAmount ?? 0)}</strong> within{' '}
            {settings.booking_expiry_hours ?? 24} hours to confirm your booking.
          </p>
          <p className="mt-3 text-sm font-medium text-navy">
            📍 {settings.hall_address_line1}, {settings.hall_city}
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={prevStep} disabled={isSubmitting} className="rounded-lg border border-navy/20 px-6 py-3 text-sm font-semibold text-navy hover:border-gold hover:text-gold transition-all disabled:opacity-50">
          ← Back
        </button>
        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-gold px-8 py-3 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all disabled:opacity-60">
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : '✓ Confirm Booking'}
        </button>
      </div>
    </form>
  )
}
