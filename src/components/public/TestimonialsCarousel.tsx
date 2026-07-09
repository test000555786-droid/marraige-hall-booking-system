'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { cn, EVENT_TYPE_LABELS, formatDate } from '@/lib/utils'
import type { DbTestimonial } from '@/types/database'

export default function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: DbTestimonial[]
}) {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % testimonials.length)
  }, [testimonials.length])

  const prev = () => {
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, next, testimonials.length])

  if (testimonials.length === 0) return null

  const t = testimonials[current]

  return (
    <div className="relative mx-auto max-w-3xl" aria-label="Testimonials carousel">
      <div
        key={t.id}
        className="animate-fade-in rounded-2xl border border-cream-500 bg-white p-8 shadow-sm md:p-10"
      >
        {/* Stars */}
        <div className="flex gap-1" aria-label={`Rating: ${t.rating} out of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={18}
              className={i < t.rating ? 'fill-gold text-gold' : 'text-cream-500'}
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="mt-5">
          <p className="font-serif text-lg leading-relaxed text-navy md:text-xl">
            &ldquo;{t.message}&rdquo;
          </p>
        </blockquote>

        {/* Author */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-gradient font-serif text-lg font-bold text-navy">
            {t.customer_name[0]}
          </div>
          <div>
            <p className="font-semibold text-navy">{t.customer_name}</p>
            <p className="text-sm text-muted-foreground">
              {EVENT_TYPE_LABELS[t.event_type]}
              {t.event_date && ` · ${formatDate(t.event_date, 'MMM yyyy')}`}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {testimonials.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-500 bg-white text-navy transition-all hover:border-gold hover:text-gold"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5" role="tablist" aria-label="Testimonial navigation">
            {testimonials.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => { setCurrent(i); setIsAutoPlaying(false) }}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === current ? 'w-6 bg-gold' : 'w-2 bg-cream-500 hover:bg-gold-300'
                )}
              />
            ))}
          </div>

          <button
            onClick={() => { next(); setIsAutoPlaying(false) }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-500 bg-white text-navy transition-all hover:border-gold hover:text-gold"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
