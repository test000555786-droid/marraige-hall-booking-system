import type { HallSettings } from '@/types/database'
import { Trophy, Heart, Star, Users } from 'lucide-react'

export default function StatsBar({ settings }: { settings: HallSettings }) {
  const stats = [
    { icon: Heart, value: settings.hall_events_count || '5000+', label: 'Happy Celebrations' },
    { icon: Trophy, value: settings.hall_years_experience || '22+', label: 'Years of Excellence' },
    { icon: Users, value: '50,000+', label: 'Guests Welcomed' },
    { icon: Star, value: '4.9/5', label: 'Average Rating' },
  ]

  return (
    <section className="bg-gold py-6" aria-label="Key statistics">
      <div className="container">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10">
                <Icon size={18} className="text-navy" aria-hidden="true" />
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-navy">{value}</p>
                <p className="text-xs font-medium text-navy/70">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
