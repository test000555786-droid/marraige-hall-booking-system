'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { profileSchema, type ProfileFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'
import type { DbProfile } from '@/types/database'

export default function ProfileForm({ profile }: { profile: DbProfile }) {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.full_name, phone: profile.phone ?? '' },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setServerError(''); setSuccess(false)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('profiles').update({ full_name: data.fullName, phone: data.phone || null }).eq('id', profile.id)
    if (error) { setServerError(error.message); return }
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const fc = (err: boolean) => cn('w-full rounded-lg border px-4 py-3 text-sm text-navy outline-none transition-all', err ? 'border-red-400 bg-red-50' : 'border-cream-500 bg-white focus:border-gold focus:ring-2 focus:ring-gold/20')

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="pf-name" className="mb-1.5 block text-sm font-medium text-navy">Full Name</label>
        <input id="pf-name" type="text" {...register('fullName')} className={fc(!!errors.fullName)} />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Email</label>
        <input type="email" value={profile.email} disabled className="w-full rounded-lg border border-cream-500 bg-cream px-4 py-3 text-sm text-muted-foreground cursor-not-allowed" />
        <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
      </div>
      <div>
        <label htmlFor="pf-phone" className="mb-1.5 block text-sm font-medium text-navy">Phone Number</label>
        <input id="pf-phone" type="tel" {...register('phone')} className={fc(!!errors.phone)} placeholder="+91 98765 43210" />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>
      {serverError && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3"><p className="text-sm text-red-700">{serverError}</p></div>}
      {success && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600" /><p className="text-sm text-green-700">Profile updated successfully!</p></div>}
      <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-navy shadow-gold hover:bg-gold-400 disabled:opacity-60 transition-all">
        {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : 'Save Changes'}
      </button>
    </form>
  )
}
