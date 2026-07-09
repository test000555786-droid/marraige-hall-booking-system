'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, ZoomIn, Loader2, ExternalLink, Download } from 'lucide-react'
import { formatCurrency, formatIST } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/components'

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

export default function AdminPaymentsClient({ payments, currentTab, pendingCount }: {
  payments: Record<string, unknown>[]
  currentTab: string
  pendingCount: number
}) {
  const router = useRouter()
  const [rejectDialog, setRejectDialog] = useState<{ paymentId: string; bookingId: string } | null>(null)
  const [verifyDialog, setVerifyDialog] = useState<{ payment: Record<string, unknown> } | null>(null)
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  const handleVerify = async (paymentId: string, bookingId: string) => {
    setProcessing(paymentId)
    let undone = false
    const undoTimeout = setTimeout(async () => {
      if (undone) return
      try {
        const res = await fetch('/api/admin/payments/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId, bookingId }) })
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        toast.success('Payment verified and booking confirmed!')
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Verification failed')
      } finally { setProcessing(null); setVerifyDialog(null) }
    }, 10000)

    toast('⏳ Verifying in 10 seconds...', {
      action: { label: 'Undo', onClick: () => { undone = true; clearTimeout(undoTimeout); setProcessing(null); setVerifyDialog(null); toast.info('Verification cancelled') } },
      duration: 10000,
    })
  }

  const handleReject = async () => {
    if (!rejectDialog || !rejectReason.trim()) return
    setProcessing(rejectDialog.paymentId)
    try {
      const res = await fetch('/api/admin/payments/reject', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: rejectDialog.paymentId, bookingId: rejectDialog.bookingId, reason: rejectReason }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      toast.success('Payment rejected and customer notified')
      setRejectDialog(null); setRejectReason('')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rejection failed')
    } finally { setProcessing(null) }
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-cream-500">
        {TABS.map((t) => (
          <Link key={t.value} href={`/admin/payments?tab=${t.value}`}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${currentTab === t.value ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-navy'}`}>
            {t.label} {t.value === 'pending' && pendingCount > 0 && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">{pendingCount}</span>}
          </Link>
        ))}
      </div>

      {/* Payment cards */}
      {payments.length === 0 ? (
        <div className="rounded-2xl border border-cream-500 bg-white p-12 text-center">
          <p className="text-muted-foreground">No {currentTab} payments.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {payments.map((p) => {
            const booking = p.booking as Record<string, unknown>
            const venue = booking?.venue as Record<string, unknown>
            return (
              <div key={p.id as string} className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-bold text-navy">{booking?.booking_ref as string}</p>
                    <p className="text-xs text-muted-foreground">{booking?.customer_name as string} · {venue?.name as string}</p>
                  </div>
                  <span className="font-semibold text-gold">{formatCurrency(p.amount as number)}</span>
                </div>

                <div className="text-xs space-y-1 text-muted-foreground">
                  <p><span className="font-medium text-navy">Method:</span> {(p.method as string).toUpperCase()}</p>
                  {p.transaction_id && <p><span className="font-medium text-navy">Txn ID:</span> {p.transaction_id as string}</p>}
                  <p><span className="font-medium text-navy">Date:</span> {formatIST(p.created_at as string)}</p>
                  {p.rejection_reason && <p className="text-red-600"><span className="font-medium">Reason:</span> {p.rejection_reason as string}</p>}
                </div>

                {p.screenshot_url && (
                  <div className="relative rounded-lg overflow-hidden bg-cream cursor-zoom-in group" onClick={() => setScreenshotModal(p.screenshot_url as string)}>
                    <Image src={p.screenshot_url as string} alt="Payment screenshot" width={400} height={200} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn size={24} className="text-white" />
                    </div>
                  </div>
                )}

                {currentTab === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVerifyDialog({ payment: p })}
                      disabled={processing === (p.id as string)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
                    >
                      <CheckCircle2 size={13} /> Verify
                    </button>
                    <button
                      onClick={() => setRejectDialog({ paymentId: p.id as string, bookingId: booking?.id as string })}
                      disabled={processing === (p.id as string)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-100 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-60 transition-colors"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
                <Link href={`/admin/bookings/${booking?.id as string}`} className="block text-center text-xs text-gold hover:underline">View Full Booking →</Link>
              </div>
            )
          })}
        </div>
      )}

      {/* Verify confirm dialog */}
      <Dialog open={!!verifyDialog} onOpenChange={() => setVerifyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
          </DialogHeader>
          {verifyDialog && (
            <div className="space-y-4">
              {(verifyDialog.payment.screenshot_url as string) && (
                <Image src={verifyDialog.payment.screenshot_url as string} alt="Screenshot" width={400} height={250} className="w-full rounded-lg object-contain max-h-48 bg-cream" />
              )}
              <div className="rounded-lg bg-cream p-3 text-sm">
                <p><span className="text-muted-foreground">Amount:</span> <span className="font-bold text-gold ml-2">{formatCurrency(verifyDialog.payment.amount as number)}</span></p>
                {verifyDialog.payment.transaction_id && <p className="mt-1"><span className="text-muted-foreground">Txn ID:</span> <span className="font-mono text-navy ml-2">{verifyDialog.payment.transaction_id as string}</span></p>}
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-gold" required /> I confirm this payment is valid and matches our records
              </label>
              <button
                onClick={() => handleVerify(verifyDialog.payment.id as string, (verifyDialog.payment.booking as Record<string, unknown>)?.id as string)}
                disabled={!!processing}
                className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Verify & Confirm Booking (10s undo)
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason('') }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Please provide a clear reason. The customer will be notified and can resubmit.</p>
            <textarea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Screenshot unclear, amount mismatch, invalid transaction ID..." className="w-full rounded-lg border border-cream-500 px-4 py-3 text-sm text-navy outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 resize-none" />
            <button onClick={handleReject} disabled={!rejectReason.trim() || !!processing} className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {processing ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />} Reject & Notify Customer
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Screenshot modal */}
      {screenshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setScreenshotModal(null)}>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={screenshotModal} alt="Full screenshot" className="w-full rounded-xl max-h-[85vh] object-contain" />
            <div className="mt-3 flex justify-end gap-2">
              <a href={screenshotModal} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
                <Download size={14} /> Download
              </a>
              <button onClick={() => setScreenshotModal(null)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
