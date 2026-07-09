import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import AdminPaymentsClient from '@/components/admin/AdminPaymentsClient'

export const metadata: Metadata = { title: 'Payment Verification — Admin' }

export default async function AdminPaymentsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createSupabaseServerClient()
  const tab = searchParams.tab ?? 'pending'

  const statusMap: Record<string, string> = { pending: 'pending', verified: 'verified', rejected: 'rejected' }
  const paymentStatus = statusMap[tab] ?? 'pending'

  const { data: payments } = await supabase
    .from('payments')
    .select('*, booking:bookings(*, venue:venues(name))')
    .eq('status', paymentStatus)
    .order('created_at', { ascending: tab === 'pending' }) // oldest first for pending
    .limit(50)

  const { count: pendingCount } = await supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-navy">Payment Verification</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review and verify customer payment screenshots</p>
      </div>
      <AdminPaymentsClient payments={payments ?? []} currentTab={tab} pendingCount={pendingCount ?? 0} />
    </div>
  )
}
