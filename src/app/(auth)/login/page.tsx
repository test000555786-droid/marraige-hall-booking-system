'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
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

    // Check role for redirect
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
    const role = (profile as any)?.role
    if (role === 'admin' || role === 'owner') {
      router.push('/admin')
    } else {
      router.push(redirect)
    }
    router.refresh()
  }

  const fc = (err: boolean) => cn('w-full rounded-lg border px-4 py-3 text-sm bg-white/10 text-cream-100 placeholder:text-cream-400/50 outline-none transition-all', err ? 'border-red-400' : 'border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20')

  return (
    <>
      <h1 className="font-serif text-2xl font-bold text-cream-100 mb-1">Welcome Back</h1>
      <p className="text-sm text-cream-400/70 mb-6">Sign in to your account</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-cream-200">Email</label>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} className={fc(!!errors.email)} aria-invalid={!!errors.email} />
          {errors.email && <p className="mt-1 text-xs text-red-400" role="alert">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-cream-200">Password</label>
          <div className="relative">
            <input id="password" type={showPwd ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" {...register('password')} className={cn(fc(!!errors.password), 'pr-10')} aria-invalid={!!errors.password} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400/50 hover:text-cream-200" aria-label={showPwd ? 'Hide password' : 'Show password'}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400" role="alert">{errors.password.message}</p>}
        </div>

        {serverError && <div className="rounded-lg bg-red-900/30 border border-red-500/30 px-4 py-3" role="alert"><p className="text-sm text-red-300">{serverError}</p></div>}

        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 font-semibold text-navy shadow-gold hover:bg-gold-400 transition-all disabled:opacity-60">
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-cream-400/70">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-gold hover:text-gold-300 transition-colors">Create one</Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-white/5" />}>
      <LoginForm />
    </Suspense>
  )
}
