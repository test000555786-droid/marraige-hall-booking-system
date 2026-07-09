import type { Metadata } from 'next'
import { getGalleryItems } from '@/lib/queries'
import GalleryGrid from '@/components/public/GalleryGrid'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse our gallery of beautiful weddings, receptions, and celebrations hosted at Shubh Vivah Marriage Hall.',
}

export const revalidate = 3600

export default async function GalleryPage() {
  const { data: items, error } = await getGalleryItems()

  return (
    <>
      <section className="relative flex h-72 items-center justify-center overflow-hidden bg-navy pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80')` }}
        />
        <div className="relative z-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">Our Gallery</p>
          <h1 className="font-serif text-display-md text-cream-100 md:text-display-lg">Captured Memories</h1>
          <p className="mt-3 text-cream-300/70">Every photo tells a story of joy, love, and celebration</p>
        </div>
      </section>

      <section className="bg-cream py-12 lg:py-20">
        <div className="container">
          {error ? (
            <p className="text-center text-muted-foreground">Unable to load gallery. Please try again later.</p>
          ) : (
            <GalleryGrid items={items ?? []} />
          )}
        </div>
      </section>
    </>
  )
}
