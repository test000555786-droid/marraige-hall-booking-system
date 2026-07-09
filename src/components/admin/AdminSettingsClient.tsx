'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/components'
import { hallInfoSchema, bookingRulesSchema, paymentSettingsSchema, type HallInfoFormData, type BookingRulesFormData, type PaymentSettingsFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'
import type { HallSettings } from '@/types/database'

const fc = (err: boolean) => cn('w-full rounded-lg border px-4 py-3 text-sm text-navy outline-none transition-all', err ? 'border-red-400 bg-red-50' : 'border-cream-500 bg-white focus:border-gold focus:ring-2 focus:ring-gold/20')

async function saveSettings(data: Record<string, string | number>) {
  const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
}

function HallInfoTab({ settings }: { settings: HallSettings }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<HallInfoFormData>({
    resolver: zodResolver(hallInfoSchema),
    defaultValues: { hall_name: settings.hall_name, hall_tagline: settings.hall_tagline, hall_phone: settings.hall_phone, hall_phone_alt: settings.hall_phone_alt, hall_email: settings.hall_email, hall_address_line1: settings.hall_address_line1, hall_address_line2: settings.hall_address_line2, hall_city: settings.hall_city, hall_state: settings.hall_state, hall_pincode: settings.hall_pincode, hall_about: settings.hall_about },
  })
  const onSubmit = async (data: HallInfoFormData) => {
    try { await saveSettings(data as unknown as Record<string, string>); toast.success('Hall info saved!') } catch (err) { toast.error(err instanceof Error ? err.message : 'Save failed') }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1.5 block text-sm font-medium text-navy">Hall Name</label><input {...register('hall_name')} className={fc(!!errors.hall_name)} />{errors.hall_name && <p className="mt-1 text-xs text-red-600">{errors.hall_name.message}</p>}</div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">Tagline</label><input {...register('hall_tagline')} className={fc(!!errors.hall_tagline)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">Primary Phone</label><input {...register('hall_phone')} className={fc(!!errors.hall_phone)} />{errors.hall_phone && <p className="mt-1 text-xs text-red-600">{errors.hall_phone.message}</p>}</div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">Alt Phone</label><input {...register('hall_phone_alt')} className={fc(!!errors.hall_phone_alt)} /></div>
        <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-navy">Email</label><input {...register('hall_email')} type="email" className={fc(!!errors.hall_email)} />{errors.hall_email && <p className="mt-1 text-xs text-red-600">{errors.hall_email.message}</p>}</div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">Address Line 1</label><input {...register('hall_address_line1')} className={fc(!!errors.hall_address_line1)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">Address Line 2</label><input {...register('hall_address_line2')} className={fc(false)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">City</label><input {...register('hall_city')} className={fc(!!errors.hall_city)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">State</label><input {...register('hall_state')} className={fc(!!errors.hall_state)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">PIN Code</label><input {...register('hall_pincode')} className={fc(!!errors.hall_pincode)} />{errors.hall_pincode && <p className="mt-1 text-xs text-red-600">{errors.hall_pincode.message}</p>}</div>
      </div>
      <div><label className="mb-1.5 block text-sm font-medium text-navy">About Us</label><textarea {...register('hall_about')} rows={4} className={cn(fc(false), 'resize-none')} /></div>
      <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy shadow-gold hover:bg-gold-400 disabled:opacity-60">{isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Hall Info</button>
    </form>
  )
}

function BookingRulesTab({ settings }: { settings: HallSettings }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BookingRulesFormData>({
    resolver: zodResolver(bookingRulesSchema),
    defaultValues: { advance_payment_percent: parseInt(settings.advance_payment_percent ?? '30'), booking_expiry_hours: parseInt(settings.booking_expiry_hours ?? '24'), min_advance_days: parseInt(settings.min_advance_days ?? '7'), max_advance_days: parseInt(settings.max_advance_days ?? '365'), cancellation_policy: settings.cancellation_policy },
  })
  const onSubmit = async (data: BookingRulesFormData) => {
    try {
      await saveSettings({ advance_payment_percent: String(data.advance_payment_percent), booking_expiry_hours: String(data.booking_expiry_hours), min_advance_days: String(data.min_advance_days), max_advance_days: String(data.max_advance_days), cancellation_policy: data.cancellation_policy })
      toast.success('Booking rules saved!')
    } catch (err) { toast.error('Save failed') }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1.5 block text-sm font-medium text-navy">Advance Payment %</label><input type="number" {...register('advance_payment_percent', { valueAsNumber: true })} className={fc(!!errors.advance_payment_percent)} />{errors.advance_payment_percent && <p className="mt-1 text-xs text-red-600">{errors.advance_payment_percent.message}</p>}</div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">Booking Expiry (hours)</label><input type="number" {...register('booking_expiry_hours', { valueAsNumber: true })} className={fc(!!errors.booking_expiry_hours)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">Min Advance Days</label><input type="number" {...register('min_advance_days', { valueAsNumber: true })} className={fc(!!errors.min_advance_days)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-navy">Max Advance Days</label><input type="number" {...register('max_advance_days', { valueAsNumber: true })} className={fc(!!errors.max_advance_days)} /></div>
      </div>
      <div><label className="mb-1.5 block text-sm font-medium text-navy">Cancellation Policy</label><textarea {...register('cancellation_policy')} rows={5} className={cn(fc(!!errors.cancellation_policy), 'resize-y')} />{errors.cancellation_policy && <p className="mt-1 text-xs text-red-600">{errors.cancellation_policy.message}</p>}</div>
      <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy shadow-gold hover:bg-gold-400 disabled:opacity-60">{isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null} Save Rules</button>
    </form>
  )
}

function PaymentTab({ settings }: { settings: HallSettings }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PaymentSettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: { hall_upi_id: settings.hall_upi_id, hall_upi_name: settings.hall_upi_name },
  })
  const onSubmit = async (data: PaymentSettingsFormData) => {
    try { await saveSettings(data as unknown as Record<string, string>); toast.success('Payment settings saved!') } catch { toast.error('Save failed') }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div><label className="mb-1.5 block text-sm font-medium text-navy">UPI ID</label><input {...register('hall_upi_id')} className={fc(!!errors.hall_upi_id)} placeholder="yourname@upi" />{errors.hall_upi_id && <p className="mt-1 text-xs text-red-600">{errors.hall_upi_id.message}</p>}</div>
      <div><label className="mb-1.5 block text-sm font-medium text-navy">UPI Display Name</label><input {...register('hall_upi_name')} className={fc(!!errors.hall_upi_name)} />{errors.hall_upi_name && <p className="mt-1 text-xs text-red-600">{errors.hall_upi_name.message}</p>}</div>
      <p className="text-xs text-muted-foreground">To upload a UPI QR code image, go to Supabase Storage and upload to the <code>public</code> bucket, then update the <code>hall_upi_qr_url</code> setting.</p>
      <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy shadow-gold hover:bg-gold-400 disabled:opacity-60">{isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null} Save Payment Settings</button>
    </form>
  )
}

export default function AdminSettingsClient({ settings }: { settings: HallSettings }) {
  return (
    <Tabs defaultValue="hall-info">
      <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
        <TabsTrigger value="hall-info">Hall Info</TabsTrigger>
        <TabsTrigger value="booking-rules">Booking Rules</TabsTrigger>
        <TabsTrigger value="payment">Payment</TabsTrigger>
        <TabsTrigger value="social">Social Links</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <div className="rounded-2xl border border-cream-500 bg-white p-6 shadow-sm">
        <TabsContent value="hall-info"><HallInfoTab settings={settings} /></TabsContent>
        <TabsContent value="booking-rules"><BookingRulesTab settings={settings} /></TabsContent>
        <TabsContent value="payment"><PaymentTab settings={settings} /></TabsContent>
        <TabsContent value="social">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Edit social links directly in the database or via the hall_settings table (keys: social_facebook, social_instagram, social_whatsapp).</p>
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Admin notification email (key: admin_notification_email) can be updated via hall_settings table in Supabase.</p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}
