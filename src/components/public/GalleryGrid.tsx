'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { cn, capitalize } from '@/lib/utils'
import type { DbGallery, GalleryCategory } from '@/types/database'

const CATEGORIES: { value: GalleryCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'weddings', label: 'Weddings' },
  { value: 'receptions', label: 'Receptions' },
  { value: 'engagements', label: 'Engagements' },
  { value: 'decor', label: 'Décor' },
  { value: 'venue', label: 'Venue' },
]

export default function GalleryGrid({ items }: { items: DbGallery[] }) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered =
    activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goPrev = () => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : null))
  }
  const goNext = () => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % filtered.length : null))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goPrev()
    if (e.key === 'ArrowRight') goNext()
    if (e.key === 'Escape') closeLightbox()
  }

  const activeItem = lightboxIndex !== null ? filtered[lightboxIndex] : null

  return (
    <>
      {/* Category filters */}
      <div
        className="mb-8 flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="Gallery categories"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            role="tab"
            aria-selected={activeCategory === cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all',
              activeCategory === cat.value
                ? 'bg-gold text-navy shadow-gold'
                : 'border border-cream-500 bg-white text-navy hover:border-gold hover:text-gold'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No images in this category yet.</p>
      ) : (
        <div
          className="columns-2 gap-3 sm:columns-3 md:gap-4 lg:columns-4"
          role="list"
          aria-label="Gallery images"
        >
          {filtered.map((item, index) => (
            <div
              key={item.id}
              role="listitem"
              className="group relative mb-3 overflow-hidden rounded-xl bg-cream-500 md:mb-4 cursor-zoom-in"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={item.thumbnail_url ?? item.url}
                alt={item.caption ?? `Gallery photo ${index + 1}`}
                width={400}
                height={300}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/60 opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn size={28} className="text-white" />
                {item.caption && (
                  <p className="mt-2 px-3 text-center text-xs font-medium text-white">{item.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {activeItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          tabIndex={-1}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X size={22} />
          </button>

          {/* Prev */}
          {filtered.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeItem.url}
              alt={activeItem.caption ?? 'Gallery image'}
              width={1200}
              height={800}
              className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain"
              priority
            />
            {/* Caption + download */}
            <div className="mt-3 flex items-center justify-between px-2">
              <p className="text-sm text-white/80">
                {activeItem.caption ?? ''}
                <span className="ml-3 text-white/40">
                  {lightboxIndex + 1} / {filtered.length}
                </span>
              </p>
              <a
                href={activeItem.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Download image"
              >
                <Download size={12} /> Download
              </a>
            </div>
          </div>

          {/* Next */}
          {filtered.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      )}
    </>
  )
}
