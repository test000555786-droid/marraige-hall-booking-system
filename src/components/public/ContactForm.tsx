'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Loader2, CheckCircle2, Send } from 'lucide-react'
import { contactSchema, type ContactFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setServerError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setSubmitted(true)
      reset()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-xl bg-green-50 border border-green-200 px-8 py-12 text-center">
        <CheckCircle2 size={48} className="text-green-600 mb-4" />
        <h3 className="font-serif text-xl font-semibold text-green-800">Message Sent!</h3>
        <p className="mt-2 text-sm text-green-700">
          Thank you for reaching out. We'll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-5 text-sm font-medium text-green-700 underline hover:no-underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  const fieldClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border bg-white px-4 py-3 text-sm text-navy outline-none transition-all',
      hasError
        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
        : 'border-cream-500 focus:border-gold focus:ring-2 focus:ring-gold/20'
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-navy">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="c-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            {...register('name')}
            className={fieldClass(!!errors.name)}
            aria-describedby={errors.name ? 'c-name-err' : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p id="c-name-err" className="mt-1 text-xs text-red-600" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-navy">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="c-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            className={fieldClass(!!errors.email)}
            aria-describedby={errors.email ? 'c-email-err' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="c-email-err" className="mt-1 text-xs text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="c-phone" className="mb-1.5 block text-sm font-medium text-navy">
          Phone Number
        </label>
        <input
          id="c-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          {...register('phone')}
          className={fieldClass(!!errors.phone)}
          aria-describedby={errors.phone ? 'c-phone-err' : undefined}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && (
          <p id="c-phone-err" className="mt-1 text-xs text-red-600" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="c-subject" className="mb-1.5 block text-sm font-medium text-navy">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="c-subject"
          type="text"
          placeholder="e.g. Venue enquiry for December wedding"
          {...register('subject')}
          className={fieldClass(!!errors.subject)}
          aria-describedby={errors.subject ? 'c-subject-err' : undefined}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && (
          <p id="c-subject-err" className="mt-1 text-xs text-red-600" role="alert">
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="c-message" className="mb-1.5 block text-sm font-medium text-navy">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="c-message"
          rows={5}
          placeholder="Tell us about your event, expected guest count, preferred dates..."
          {...register('message')}
          className={cn(fieldClass(!!errors.message), 'resize-y')}
          aria-describedby={errors.message ? 'c-message-err' : undefined}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <p id="c-message-err" className="mt-1 text-xs text-red-600" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3" role="alert">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3.5 text-sm font-semibold text-navy shadow-gold transition-all hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> Sending...</>
        ) : (
          <><Send size={16} /> Send Message</>
        )}
      </button>
    </form>
  )
}
