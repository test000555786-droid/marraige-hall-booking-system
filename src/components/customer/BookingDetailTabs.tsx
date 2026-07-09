'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Loader2, Upload, X, ExternalLink } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/components'
import {
  formatCurrency, formatDate, formatDateLong, formatIST,
  BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, EVENT_TYPE_LABELS,
  VENUE_TIER_LABELS, getTimelineLabel,
} from '@/lib/utils'
import type { BookingWithDetails } from '@/types/database'

interface Props {
  booking: BookingWithDetails
  settings: Record<string, string>
  currentUserId: string
}

export default function BookingDetailTabs({ booking, settings, currentUserId }: Props) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [isResubmitting, setIsResubmitting] = useState(false)
  const [resubPreview, setResubPreview] = useState<string | null>(null)
  const [resubFile, setResubFile] = useState<File | null>(null)
  const [txnId, setTxnId] = useState('')

  const latestPayment = booking.payments?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  const canCancel = ['pending_payment', 'pending_verification'].includes(booking.status)
  const canResubmit = latestPayment?.status === 'rejected'

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking? This cannot be undone.')) return
    setIsCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: 'POST' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      toast.success('Booking cancelled successfully')
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel booking')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleResubmit = async () => {
    if (!resubFile || !txnId.trim()) {
      toast.error('Please provide transaction ID and screenshot')
      return
    }
    setIsResubmitting(true)
    try {
      const fd = new FormData()
      fd.append('bookingId', booking.id)
      fd.append('transactionId', txnId)
      fd.append('screenshot', resubFile)
      const res = await fetch('/api/payments/resubmit', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      toast.success('Payment resubmitted successfully!')
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resubmit')
    } finally {
      setIsResubmitting(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    pending_verification: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    expired: 'bg-orange-100 text-orange-800 border-orange-200',
  }

  return (
    <div>
      {/* Status banner */}
      <div className={`mb-6 flex items-center justify-between rounded-xl border px-5 py-4 ${statusColors[booking.status]}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Status</p>
          <p className="font-semibold">{BOOKING_STATUS_LABELS[booking.status]}</p>
        </div>
        <span className="font-mono text-sm font-bold">{booking.booking_ref}</span>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* ── Details Tab ── */}
        <TabsContent value="details">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-navy mb-4">Venue</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Hall:</span> <span className="font-medium text-navy ml-2">{booking.venue?.name}</span></p>
                <p><span className="text-muted-foreground">Tier:</span> <span className="font-medium text-navy ml-2">{VENUE_TIER_LABELS[booking.venue?.tier]}</span></p>
                <p><span className="text-muted-foreground">Capacity:</span> <span className="font-medium text-navy ml-2">Up to {booking.venue?.capacity_max?.toLocaleString('en-IN')}</span></p>
              </div>
            </div>
            <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-navy mb-4">Event</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Date:</span> <span className="font-medium text-navy ml-2">{formatDateLong(booking.event_date)}</span></p>
                <p><span className="text-muted-foreground">Type:</span> <span className="font-medium text-navy ml-2">{EVENT_TYPE_LABELS[booking.event_type]}</span></p>
                <p><span className="text-muted-foreground">Guests:</span> <span className="font-medium text-navy ml-2">{booking.guest_count.toLocaleString('en-IN')}</span></p>
              </div>
            </div>
            <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-navy mb-4">Contact</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Name:</span> <span className="font-medium text-navy ml-2">{booking.customer_name}</span></p>
                <p><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-navy ml-2">{booking.customer_phone}</span></p>
                <p><span className="text-muted-foreground">Email:</span> <span className="font-medium text-navy ml-2 break-all">{booking.customer_email}</span></p>
              </div>
            </div>
            <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-navy mb-4">Pricing</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium text-navy">{formatCurrency(booking.total_amount)}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Advance</span><span className="font-semibold text-gold">{formatCurrency(booking.advance_amount)}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Balance (on event day)</span><span className="font-medium text-navy">{formatCurrency(booking.total_amount - booking.advance_amount)}</span></p>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-4 rounded-xl border border-cream-500 bg-white p-5">
              <h3 className="font-semibold text-navy mb-2">Special Requests</h3>
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </div>
          )}

          {/* Actions */}
          {canCancel && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-red-800 text-sm">Cancel Booking</p>
                <p className="text-xs text-red-700 mt-0.5">This action cannot be undone. Cancellation policy applies.</p>
              </div>
              <button onClick={handleCancel} disabled={isCancelling} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors">
                {isCancelling ? <Loader2 size={14} className="animate-spin" /> : null} Cancel
              </button>
            </div>
          )}
        </TabsContent>

        {/* ── Payment Tab ── */}
        <TabsContent value="payment">
          {!latestPayment ? (
            <div className="rounded-2xl border border-cream-500 bg-white p-8 text-center">
              <p className="text-muted-foreground">No payment submitted yet.</p>
              <a href="/book" className="mt-3 inline-block text-sm text-gold underline">Make payment</a>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-navy mb-4">Payment Details</h3>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <p><span className="text-muted-foreground">Method:</span> <span className="font-medium text-navy ml-2 uppercase">{latestPayment.method}</span></p>
                  <p><span className="text-muted-foreground">Amount:</span> <span className="font-medium text-gold ml-2">{formatCurrency(latestPayment.amount)}</span></p>
                  {latestPayment.transaction_id && <p><span className="text-muted-foreground">Txn ID:</span> <span className="font-mono text-navy ml-2">{latestPayment.transaction_id}</span></p>}
                  <p><span className="text-muted-foreground">Status:</span> <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${latestPayment.status === 'verified' ? 'bg-green-100 text-green-700' : latestPayment.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{latestPayment.status}</span></p>
                  <p><span className="text-muted-foreground">Submitted:</span> <span className="text-navy ml-2">{formatIST(latestPayment.created_at)}</span></p>
                </div>
                {latestPayment.rejection_reason && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-xs font-semibold text-red-700">Rejection Reason:</p>
                    <p className="text-sm text-red-700 mt-1">{latestPayment.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Screenshot viewer */}
              {latestPayment.screenshot_url && (
                <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-navy">Payment Screenshot</h3>
                    <a href={latestPayment.screenshot_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gold hover:underline">
                      <ExternalLink size={12} /> View Full
                    </a>
                  </div>
                  <Image src={latestPayment.screenshot_url} alt="Payment screenshot" width={500} height={300} className="w-full rounded-lg object-contain max-h-64 bg-cream" />
                </div>
              )}

              {/* Resubmit form */}
              {canResubmit && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <h3 className="font-semibold text-blue-800 mb-3">Resubmit Payment</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="New Transaction ID" value={txnId} onChange={(e) => setTxnId(e.target.value)} className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
                    {resubPreview ? (
                      <div className="relative rounded-xl border border-blue-200 overflow-hidden">
                        <img src={resubPreview} alt="New screenshot" className="max-h-40 w-full object-contain bg-cream" />
                        <button onClick={() => { setResubPreview(null); setResubFile(null) }} className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white"><X size={12} /></button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-blue-200 bg-white p-5 hover:border-blue-400 transition-colors">
                        <Upload size={20} className="text-blue-400 mb-1" />
                        <span className="text-xs text-blue-700">Upload new screenshot</span>
                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) { setResubFile(f); const r = new FileReader(); r.onload = () => setResubPreview(r.result as string); r.readAsDataURL(f) }
                        }} />
                      </label>
                    )}
                    <button onClick={handleResubmit} disabled={isResubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
                      {isResubmitting ? <Loader2 size={14} className="animate-spin" /> : null} Resubmit Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Timeline Tab ── */}
        <TabsContent value="timeline">
          <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-navy mb-5">Booking Timeline</h3>
            <ol className="relative border-l border-cream-500 space-y-6" aria-label="Booking history">
              <li className="ml-6">
                <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold ring-4 ring-white" />
                <p className="text-sm font-semibold text-navy">Booking Created</p>
                <p className="text-xs text-muted-foreground">{formatIST(booking.created_at)}</p>
              </li>
              {booking.payments?.map((p) => (
                <li key={p.id} className="ml-6">
                  <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white" />
                  <p className="text-sm font-semibold text-navy">Payment Submitted ({p.method.toUpperCase()})</p>
                  <p className="text-xs text-muted-foreground">{formatIST(p.created_at)} · {formatCurrency(p.amount)}</p>
                </li>
              ))}
              {booking.status !== 'pending_payment' && booking.status !== 'pending_verification' && (
                <li className="ml-6">
                  <span className={`absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <p className="text-sm font-semibold text-navy">{getTimelineLabel(booking.status)}</p>
                  <p className="text-xs text-muted-foreground">{formatIST(booking.updated_at)}</p>
                </li>
              )}
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
