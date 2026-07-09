import type { Metadata } from 'next'
import { getHallSettings } from '@/lib/queries'
import AdminSettingsClient from '@/components/admin/AdminSettingsClient'

export const metadata: Metadata = { title: 'Settings — Admin' }

export default async function AdminSettingsPage() {
  const settings = await getHallSettings()
  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="font-serif text-2xl font-bold text-navy">Hall Settings</h1><p className="text-sm text-muted-foreground mt-0.5">Manage all hall information, booking rules, and payment settings</p></div>
      <AdminSettingsClient settings={settings} />
    </div>
  )
}
