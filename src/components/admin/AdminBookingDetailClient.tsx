'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle, Ban, Flag } from 'lucide-react'
import { formatCurrency, formatDateLong, formatIST, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, EVENT_TYPE_LABELS } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/components'
import type { BookingWithDetails } from '@/types/database'

export default function AdminBookingDetailClient({
  booking, settings, adminId,
}: { booking: BookingWithDetails; settings: Record<string, string>; adminId: string }) {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const latestPayment = booking.payments?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  const doAction = async (url: string, body: object) => {
    setProcessing(true)
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      toast.success('Action completed successfully')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleVerify = () => latestPayment && doAction('/api/admin/payments/verify', { paymentId: latestPayment.id, bookingId: booking.id })
  const handleComplete = () => doAction('/api/admin/bookings/complete', { bookingId: booking.id })
  const handleReject = () => { doAction('/api/admin/payments/reject', { paymentId: latestPayment?.id, bookingId: booking.id, reason: rejectReason }); setShowRejectDialog(false) }
  const handleCancel = () => { doAction('/api/admin/bookings/cancel', { bookingId: booking.id, reason: cancelReason, adminId }); setShowCancelDialog(false) }

  const statusColor = BOOKING_STATUS_COLORS[booking.status]

  return (
    <>
      {/* Status */}
      <div className={`rounded-xl border px-5 py-3 flex items-center justify-between ${statusColor}`}>
        <span className="font-semibold">{BOOKING_STATUS_LABELS[booking.status]}</span>
        <span className="text-xs opacity-70">Updated {formatIST(booking.updated_at)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Col 1: Venue + Pricing */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-navy mb-3">Venue</h3>
            <p className="font-medium text-navy">{booking.venue?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{formatDateLong(booking.event_date)}</p>
            <p className="text-sm text-muted-foreground">{EVENT_TYPE_LABELS[booking.event_type]} · {booking.guest_count.toLocaleString('en-IN')} guests</p>
          </div>
          <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-navy mb-3">Pricing</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium text-navy">{formatCurrency(booking.total_amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Advance</span><span className="font-bold text-gold">{formatCurrency(booking.advance_amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="text-navy">{formatCurrency(booking.total_amount - booking.advance_amount)}</span></div>
              {booking.override_price && <p className="text-xs text-muted-foreground">* Custom price applied</p>}
            </div>
          </div>
        </div>

        {/* Col 2: Customer + Screenshot */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-navy mb-3">Customer</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> <span className="font-medium text-navy ml-2">{booking.customer_name}</span></p>
              <p><span className="text-muted-foreground">Phone:</span> <a href={`tel:${booking.customer_phone}`} className="font-medium text-gold ml-2 hover:underline">{booking.customer_phone}</a></p>
              <p><span className="text-muted-foreground">Email:</span> <a href={`mailto:${booking.customer_email}`} className="font-medium text-gold ml-2 hover:underline break-all">{booking.customer_email}</a></p>
            </div>
          </div>
          {latestPayment && (
            <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-navy mb-3">Payment</h3>
              <div className="space-y-1.5 text-sm mb-3">
                <p><span className="text-muted-foreground">Method:</span> <span className="ml-2 uppercase font-medium text-navy">{latestPayment.method}</span></p>
                {latestPayment.transaction_id && <p><span className="text-muted-foreground">Txn ID:</span> <span className="ml-2 font-mono text-navy">{latestPayment.transaction_id}</span></p>}
                <p><span className="text-muted-foreground">Status:</span> <span className={`ml-2 rounded px-1.5 py-0.5 text-xs font-semibold ${latestPayment.status === 'verified' ? 'bg-green-100 text-green-700' : latestPayment.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{latestPayment.status}</span></p>
              </div>
              {latestPayment.screenshot_url && (
                <a href={latestPayment.screenshot_url} target="_blank" rel="noopener noreferrer">
                  <Image src={latestPayment.screenshot_url} alt="Payment screenshot" width={400} height={200} className="w-full rounded-lg object-contain max-h-36 bg-cream hover:opacity-90 transition-opacity" />
                </a>
              )}
              {latestPayment.rejection_reason && (
                <p className="mt-2 rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-700">{latestPayment.rejection_reason}</p>
              )}
            </div>
          )}
        </div>

        {/* Col 3: Actions + Timeline */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-navy mb-3">Actions</h3>
            <div className="space-y-2">
              {booking.status === 'pending_verification' && latestPayment && (
                <>
                  <button onClick={handleVerify} disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors">
                    {processing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Verify Payment
                  </button>
                  <button onClick={() => setShowRejectDialog(true)} disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 transition-colors">
                    <XCircle size={14} /> Reject Payment
                  </button>
                </>
              )}
              {booking.status === 'confirmed' && (
                <button onClick={handleComplete} disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                  {processing ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />} Mark as Completed
                </button>
              )}
              {['pending_payment', 'pending_verification', 'confirmed'].includes(booking.status) && (
                <button onClick={() => setShowCancelDialog(true)} disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors">
                  <Ban size={14} /> Cancel Booking
                </button>
              )}
              {!['pending_payment', 'pending_verification', 'confirmed'].includes(booking.status) && (
                <p className="text-xs text-center text-muted-foreground py-2">No actions available for this status.</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-navy mb-4">Timeline</h3>
            <ol className="relative border-l border-cream-500 space-y-4">
              <li className="ml-5"><span className="absolute -left-1.5 h-3 w-3 rounded-full bg-gold" /><p className="text-xs font-medium text-navy">Booking Created</p><p className="text-xs text-muted-foreground">{formatIST(booking.created_at)}</p></li>
              {(booking.payments ?? []).map((p) => (
                <li key={p.id} className="ml-5"><span className="absolute -left-1.5 h-3 w-3 rounded-full bg-blue-500" /><p className="text-xs font-medium text-navy">Payment Submitted ({p.method.toUpperCase()})</p><p className="text-xs text-muted-foreground">{formatIST(p.created_at)}</p></li>
              ))}
              {['confirmed', 'rejected', 'cancelled', 'completed', 'expired'].includes(booking.status) && (
                <li className="ml-5"><span className={`absolute -left-1.5 h-3 w-3 rounded-full ${booking.status === 'confirmed' || booking.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`} /><p className="text-xs font-medium text-navy">{BOOKING_STATUS_LABELS[booking.status]}</p><p className="text-xs text-muted-foreground">{formatIST(booking.updated_at)}</p></li>
              )}
            </ol>
          </div>
        </div>
      </div>

      {/* Reject dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Payment</DialogTitle></DialogHeader>
          <textarea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." className="w-full rounded-lg border border-cream-500 px-4 py-3 text-sm outline-none focus:border-red-400 resize-none" />
          <button onClick={handleReject} disabled={!rejectReason.trim() || processing} className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {processing ? <Loader2 size={14} className="animate-spin" /> : null} Reject & Notify
          </button>
        </DialogContent>
      </Dialog>

      {/* Cancel dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Booking</DialogTitle></DialogHeader>
          <textarea rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." className="w-full rounded-lg border border-cream-500 px-4 py-3 text-sm outline-none focus:border-gold resize-none" />
          <button onClick={handleCancel} disabled={processing} className="w-full rounded-lg bg-gray-700 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 flex items-center justify-center gap-2">
            {processing ? <Loader2 size={14} className="animate-spin" /> : null} Cancel Booking
          </button>
        </DialogContent>
      </Dialog>
    </>
  )
}
