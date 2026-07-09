// src/app/(auth)/layout.tsx
import Link from 'next/link'
import { getHallSettings } from '@/lib/queries'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const s = await getHallSettings()
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex flex-col items-center">
        <span className="font-serif text-2xl font-bold text-gold">{s.hall_name || 'Shubh Vivah'}</span>
        <span className="text-xs uppercase tracking-widest text-cream-400/60">Marriage Hall</span>
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        {children}
      </div>
      <p className="mt-6 text-xs text-cream-400/40">© {new Date().getFullYear()} {s.hall_name}</p>
    </div>
  )
}
