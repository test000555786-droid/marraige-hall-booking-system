'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('')
    const supabase = createSupabaseBrowserClient()

    // Check for duplicate phone
    const { data: existing } = await supabase.from('profiles').select('id').eq('phone', data.phone).limit(1)
    if (existing && existing.length > 0) {
      setServerError('A user with this phone number already exists.')
      return
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName, phone: data.phone } },
    })
    if (error) { setServerError(error.message); return }

    // Update phone in profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ phone: data.phone }).eq('id', user.id)

    // Send welcome email
    await fetch('/api/auth/welcome', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.email, name: data.fullName }) })

    router.push('/dashboard')
    router.refresh()
  }

  const fc = (err: boolean) => cn('w-full rounded-lg border px-4 py-3 text-sm bg-white/10 text-cream-100 placeholder:text-cream-400/50 outline-none transition-all', err ? 'border-red-400' : 'border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20')

  return (
    <>
      <h1 className="font-serif text-2xl font-bold text-cream-100 mb-1">Create Account</h1>
      <p className="text-sm text-cream-400/70 mb-6">Join to book and manage your events</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium text-cream-200">Full Name</label>
          <input id="full-name" type="text" autoComplete="name" placeholder="Your full name" {...register('fullName')} className={fc(!!errors.fullName)} />
          {errors.fullName && <p className="mt-1 text-xs text-red-400" role="alert">{errors.fullName.message}</p>}
        </div>
        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-cream-200">Email</label>
          <input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} className={fc(!!errors.email)} />
          {errors.email && <p className="mt-1 text-xs text-red-400" role="alert">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-medium text-cream-200">Phone Number</label>
          <input id="reg-phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" {...register('phone')} className={fc(!!errors.phone)} />
          {errors.phone && <p className="mt-1 text-xs text-red-400" role="alert">{errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-cream-200">Password</label>
          <div className="relative">
            <input id="reg-password" type={showPwd ? 'text' : 'password'} autoComplete="new-password" placeholder="Min. 8 chars, 1 uppercase, 1 number" {...register('password')} className={cn(fc(!!errors.password), 'pr-10')} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400/50 hover:text-cream-200" aria-label="Toggle password">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400" role="alert">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="confirm-pwd" className="mb-1.5 block text-sm font-medium text-cream-200">Confirm Password</label>
          <input id="confirm-pwd" type="password" autoComplete="new-password" placeholder="Repeat password" {...register('confirmPassword')} className={fc(!!errors.confirmPassword)} />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-400" role="alert">{errors.confirmPassword.message}</p>}
        </div>

        {serverError && <div className="rounded-lg bg-red-900/30 border border-red-500/30 px-4 py-3" role="alert"><p className="text-sm text-red-300">{serverError}</p></div>}

        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all disabled:opacity-60">
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-cream-400/70">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-gold hover:text-gold-300 transition-colors">Sign in</Link>
      </p>
    </>
  )
}
