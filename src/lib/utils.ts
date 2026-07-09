import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isValid, addDays, isBefore, isAfter, startOfDay } from 'date-fns'
import { toZonedTime, fromZonedTime, format as tzFormat } from 'date-fns-tz'
import type { BookingStatus, EventType, VenueTier, PaymentStatus, PricingBreakdown } from '@/types/database'

// ============================================================
// Tailwind class merger
// ============================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// IST timezone utilities
// ============================================================

const IST_TZ = 'Asia/Kolkata'

export function toIST(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date
  return toZonedTime(d, IST_TZ)
}

export function nowIST(): Date {
  return toZonedTime(new Date(), IST_TZ)
}

export function formatIST(date: Date | string, fmt = 'dd MMM yyyy, hh:mm a'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return tzFormat(toZonedTime(d, IST_TZ), fmt, { timeZone: IST_TZ })
}

export function formatDate(date: Date | string, fmt = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, fmt)
}

export function formatDateLong(date: string): string {
  return formatDate(date, 'EEEE, dd MMMM yyyy')
}

export function todayIST(): string {
  return tzFormat(toZonedTime(new Date(), IST_TZ), 'yyyy-MM-dd', { timeZone: IST_TZ })
}

export function isDateInPast(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), startOfDay(nowIST()))
}

export function isDateTooSoon(dateStr: string, minDays: number): boolean {
  const minDate = addDays(startOfDay(nowIST()), minDays)
  return isBefore(parseISO(dateStr), minDate)
}

export function isDateTooFar(dateStr: string, maxDays: number): boolean {
  const maxDate = addDays(startOfDay(nowIST()), maxDays)
  return isAfter(parseISO(dateStr), maxDate)
}

// ============================================================
// Indian Rupee formatting
// ============================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10_00_000) {
    return `₹${(amount / 10_00_000).toFixed(1)}L`
  }
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

// ============================================================
// Pricing calculations
// ============================================================

export function calculatePricing(
  pricePerDay: number,
  advancePercent: number,
  overridePrice?: number | null
): PricingBreakdown {
  const basePrice = overridePrice ?? pricePerDay
  const advanceAmount = Math.ceil((basePrice * advancePercent) / 100)
  const balanceAmount = basePrice - advanceAmount

  return {
    basePrice,
    advancePercent,
    advanceAmount,
    balanceAmount,
    totalAmount: basePrice,
  }
}

// ============================================================
// Status label + color helpers
// ============================================================

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: 'Pending Payment',
  pending_verification: 'Pending Verification',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
  expired: 'Expired',
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending_verification: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  expired: 'bg-orange-100 text-orange-800 border-orange-200',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: 'Wedding',
  reception: 'Reception',
  engagement: 'Engagement',
  birthday: 'Birthday',
  corporate: 'Corporate Event',
  other: 'Other',
}

export const VENUE_TIER_LABELS: Record<VenueTier, string> = {
  simple: 'Simple',
  premium: 'Premium',
  luxurious: 'Luxurious',
}

export const VENUE_TIER_COLORS: Record<VenueTier, string> = {
  simple: 'bg-blue-100 text-blue-800',
  premium: 'bg-purple-100 text-purple-800',
  luxurious: 'bg-yellow-100 text-yellow-800',
}

// Calendar color coding per tier
export const VENUE_CALENDAR_COLORS: Record<VenueTier, string> = {
  simple: '#3B82F6',    // blue
  premium: '#8B5CF6',   // purple
  luxurious: '#C9A84C', // gold
}

// ============================================================
// Phone number formatting (Indian)
// ============================================================

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return phone
}

// ============================================================
// String utilities
// ============================================================

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ============================================================
// File utilities
// ============================================================

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isValidImageType(file: File): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
}

export function isValidFileSize(file: File, maxMB = 5): boolean {
  return file.size <= maxMB * 1024 * 1024
}

// ============================================================
// CSV export utility
// ============================================================

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h]
      const str = val === null || val === undefined ? '' : String(val)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ============================================================
// Notification helpers
// ============================================================

export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    booking_received: '📋',
    booking_confirmed: '✅',
    booking_rejected: '❌',
    booking_cancelled: '🚫',
    booking_expired: '⏰',
    payment_received: '💳',
    payment_verified: '✅',
    payment_rejected: '❌',
    reminder: '🔔',
    general: 'ℹ️',
  }
  return icons[type] ?? 'ℹ️'
}

// ============================================================
// Booking timeline event descriptions
// ============================================================

export function getTimelineLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending_payment: 'Booking created — awaiting payment',
    pending_verification: 'Payment submitted — awaiting admin verification',
    confirmed: 'Booking confirmed',
    rejected: 'Booking rejected',
    cancelled: 'Booking cancelled',
    completed: 'Event completed',
    expired: 'Booking expired due to no payment',
  }
  return labels[status]
}

// ============================================================
// HallSettings map builder
// ============================================================

export function buildSettingsMap(
  rows: Array<{ key: string; value: string }>
): Record<string, string> {
  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {})
}
