'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isBefore, startOfDay, isToday
} from 'date-fns'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2 } from 'lucide-react'
import { cn, VENUE_CALENDAR_COLORS, VENUE_TIER_LABELS } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/components'
import type { DbVenue, DbBlockedDate } from '@/types/database'

interface Props {
  venues: DbVenue[]
  bookedDates: { event_date: string; venue_id: string }[]
  blockedDates: DbBlockedDate[]
  adminId: string
}

export default function AdminCalendarClient({ venues, bookedDates, blockedDates: initialBlocked, adminId }: Props) {
  const router = useRouter()
  const [viewDate, setViewDate] = useState(new Date())
  const [blockedDates, setBlockedDates] = useState(initialBlocked)
  const [blockModal, setBlockModal] = useState(false)
  const [blockForm, setBlockForm] = useState({ startDate: '', endDate: '', venueId: '', reason: '' })
  const [isBlocking, setIsBlocking] = useState(false)
  const [isUnblocking, setIsUnblocking] = useState<string | null>(null)

  const today = startOfDay(new Date())

  const bookedSet = new Set(bookedDates.map((b) => `${b.venue_id}:${b.event_date}`))
  const bookedAnySet = new Set(bookedDates.map((b) => b.event_date))
  const blockedSet = new Set(blockedDates.map((b) => b.blocked_date))

  const getDayInfo = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd')
    const isPast = isBefore(date, today)
    const isBlocked = blockedSet.has(key)
    const bookedVenues = venues.filter((v) => bookedSet.has(`${v.id}:${key}`))
    return { isPast, isBlocked, bookedVenues }
  }

  const handleBlock = async () => {
    if (!blockForm.startDate) { toast.error('Start date is required'); return }
    setIsBlocking(true)
    try {
      const res = await fetch('/api/admin/calendar/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...blockForm, adminId }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      toast.success('Date(s) blocked successfully')
      setBlockModal(false)
      setBlockForm({ startDate: '', endDate: '', venueId: '', reason: '' })
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to block date')
    } finally {
      setIsBlocking(false)
    }
  }

  const handleUnblock = async (id: string) => {
    setIsUnblocking(id)
    try {
      const res = await fetch(`/api/admin/calendar/block/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setBlockedDates((prev) => prev.filter((b) => b.id !== id))
      toast.success('Date unblocked')
    } catch (err) {
      toast.error('Failed to unblock date')
    } finally {
      setIsUnblocking(null)
    }
  }

  const renderMonth = (monthDate: Date) => {
    const days = eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) })
    const startDow = getDay(startOfMonth(monthDate))

    return (
      <div className="rounded-2xl border border-cream-500 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-center font-serif text-lg font-semibold text-navy">
          {format(monthDate, 'MMMM yyyy')}
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="py-1 text-center text-xs font-semibold uppercase text-muted-foreground">{d}</div>
          ))}
          {Array.from({ length: startDow }).map((_, i) => <div key={`e${i}`} />)}
          {days.map((day) => {
            const { isPast, isBlocked, bookedVenues } = getDayInfo(day)
            const dateStr = format(day, 'yyyy-MM-dd')
            const isCurrentDay = isToday(day)

            return (
              <div
                key={dateStr}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-all p-1',
                  isPast && 'opacity-40',
                  isBlocked && !isPast && 'bg-gray-100',
                  bookedVenues.length > 0 && !isBlocked && 'bg-cream-300',
                  !isPast && !isBlocked && bookedVenues.length === 0 && 'bg-green-50 hover:bg-green-100',
                  isCurrentDay && 'ring-2 ring-gold ring-offset-1'
                )}
                title={dateStr}
              >
                <span className={cn('font-medium', isBlocked ? 'text-gray-400' : bookedVenues.length > 0 ? 'text-navy' : 'text-green-700')}>
                  {format(day, 'd')}
                </span>
                {bookedVenues.length > 0 && (
                  <div className="mt-0.5 flex gap-0.5">
                    {bookedVenues.slice(0, 3).map((v) => (
                      <div key={v.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: VENUE_CALENDAR_COLORS[v.tier] }} title={v.name} />
                    ))}
                  </div>
                )}
                {isBlocked && <div className="text-[8px] text-gray-400">Blocked</div>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Legend + controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-green-100 border border-green-200" /><span className="text-xs text-navy">Available</span></div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-cream-300 border border-cream-500" /><span className="text-xs text-navy">Booked</span></div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-gray-100 border border-gray-200" /><span className="text-xs text-navy">Blocked</span></div>
          {venues.map((v) => (
            <div key={v.id} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: VENUE_CALENDAR_COLORS[v.tier] }} />
              <span className="text-xs text-navy">{v.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="rounded-lg border border-cream-500 bg-white p-2 hover:border-gold hover:text-gold transition-all" aria-label="Previous month"><ChevronLeft size={16} /></button>
          <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="rounded-lg border border-cream-500 bg-white p-2 hover:border-gold hover:text-gold transition-all" aria-label="Next month"><ChevronRight size={16} /></button>
          <button onClick={() => setBlockModal(true)} className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-gold hover:bg-navy-400 transition-all">
            <Plus size={14} /> Block Dates
          </button>
        </div>
      </div>

      {/* Two-month view */}
      <div className="grid gap-6 lg:grid-cols-2">
        {renderMonth(viewDate)}
        {renderMonth(addMonths(viewDate, 1))}
      </div>

      {/* Blocked dates table */}
      {blockedDates.length > 0 && (
        <div className="rounded-2xl border border-cream-500 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-cream-500 px-5 py-4">
            <h2 className="font-semibold text-navy">Managed Blocked Dates</h2>
          </div>
          <div className="divide-y divide-cream-400">
            {blockedDates.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-navy text-sm">{b.blocked_date}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.venue_id ? venues.find((v) => v.id === b.venue_id)?.name ?? 'Specific venue' : 'All venues'}
                    {b.reason ? ` · ${b.reason}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleUnblock(b.id)}
                  disabled={isUnblocking === b.id}
                  className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  {isUnblocking === b.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block dates dialog */}
      <Dialog open={blockModal} onOpenChange={setBlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Date(s)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Start Date <span className="text-red-500">*</span></label>
                <input type="date" value={blockForm.startDate} onChange={(e) => setBlockForm({ ...blockForm, startDate: e.target.value })} className="w-full rounded-lg border border-cream-500 px-4 py-2.5 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">End Date <span className="text-xs text-muted-foreground">(optional)</span></label>
                <input type="date" min={blockForm.startDate} value={blockForm.endDate} onChange={(e) => setBlockForm({ ...blockForm, endDate: e.target.value })} className="w-full rounded-lg border border-cream-500 px-4 py-2.5 text-sm outline-none focus:border-gold" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Venue</label>
              <select value={blockForm.venueId} onChange={(e) => setBlockForm({ ...blockForm, venueId: e.target.value })} className="w-full rounded-lg border border-cream-500 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold">
                <option value="">All Venues</option>
                {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Reason</label>
              <input type="text" placeholder="e.g. Maintenance, Private event..." value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} className="w-full rounded-lg border border-cream-500 px-4 py-2.5 text-sm outline-none focus:border-gold" />
            </div>
            <button onClick={handleBlock} disabled={isBlocking || !blockForm.startDate} className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-gold hover:bg-navy-400 disabled:opacity-60 transition-all">
              {isBlocking ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Block Date(s)
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
