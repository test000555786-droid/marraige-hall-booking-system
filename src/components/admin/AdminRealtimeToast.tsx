'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function AdminRealtimeToast() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
      }, (payload) => {
        const b = payload.new as { booking_ref: string; customer_name: string }
        toast.info(`📋 New Booking: ${b.booking_ref}`, {
          description: `From ${b.customer_name}`,
          action: { label: 'View', onClick: () => window.location.href = `/admin/bookings` },
          duration: 8000,
        })
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'payments',
      }, (payload) => {
        toast.info('💳 New Payment Submitted', {
          description: 'A customer has submitted a payment for verification.',
          action: { label: 'Verify', onClick: () => window.location.href = '/admin/payments' },
          duration: 8000,
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return null
}
