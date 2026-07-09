'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError('')
    const supabase = createSupabaseBrowserClient()

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) { setServerError(error.message); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', authData.user.id)
      .single()

    if (!profile || !['admin', 'owner'].includes(profile.role) || !profile.is_active) {
      await supabase.auth.signOut()
      setServerError('Access denied. This portal is for administrators only.')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  const fc = (err: boolean) => cn(
    'w-full rounded-lg border px-4 py-3 text-sm text-navy outline-none transition-all',
    err ? 'border-red-400 bg-red-50' : 'border-cream-500 bg-white focus:border-gold focus:ring-2 focus:ring-gold/20'
  )

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-gradient shadow-gold-lg">
            <Shield size={28} className="text-navy" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gold">Admin Portal</h1>
          <p className="mt-1 text-sm text-cream-400/60">Shubh Vivah Marriage Hall</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-cream-200">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@shubhvivahhall.in"
                {...register('email')}
                className={cn(fc(!!errors.email), 'bg-white/10 text-cream-100 placeholder:text-cream-400/50 border-white/20 focus:border-gold')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400" role="alert">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-cream-200">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={cn(fc(!!errors.password), 'bg-white/10 text-cream-100 placeholder:text-cream-400/50 border-white/20 focus:border-gold pr-10')}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400/50 hover:text-cream-200 transition-colors"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400" role="alert">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-lg border border-red-500/30 bg-red-900/30 px-4 py-3" role="alert">
                <p className="text-sm text-red-300">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign In to Admin'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-cream-400/40">
          Not an admin?{' '}
          <a href="/" className="text-gold hover:text-gold-300 transition-colors">
            Return to website
          </a>
        </p>
      </div>
    </div>
  )
}
