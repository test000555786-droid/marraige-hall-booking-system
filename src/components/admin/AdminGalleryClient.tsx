'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, Trash2, Loader2, Edit2, Check, X } from 'lucide-react'
import type { DbGallery } from '@/types/database'

const CATEGORIES = ['weddings', 'receptions', 'engagements', 'decor', 'venue', 'other'] as const

export default function AdminGalleryClient({
  items: initialItems,
  venues,
}: {
  items: DbGallery[]
  venues: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)

    try {
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.error(`${file.name}: Invalid file type`)
          continue
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name}: File too large (max 10MB)`)
          continue
        }

        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/gallery/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (json.error) { toast.error(`${file.name}: ${json.error}`); continue }
        toast.success(`${file.name} uploaded`)
      }
      router.refresh()
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Image deleted')
    } catch {
      toast.error('Failed to delete image')
    } finally {
      setDeleting(null) }
  }

  const handleSaveCaption = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: editCaption }) })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, caption: editCaption } : i))
      toast.success('Caption updated')
    } catch { toast.error('Failed to update') }
    finally { setEditingId(null) }
  }

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div className="rounded-2xl border-2 border-dashed border-cream-500 bg-white p-8 text-center hover:border-gold transition-colors">
        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" id="gallery-upload" onChange={handleUpload} />
        <label htmlFor="gallery-upload" className="cursor-pointer">
          {uploading
            ? <div className="flex flex-col items-center gap-2"><Loader2 size={32} className="animate-spin text-gold" /><p className="text-sm text-muted-foreground">Uploading...</p></div>
            : <div className="flex flex-col items-center gap-2"><Upload size={32} className="text-gold" /><p className="font-medium text-navy">Drop images or click to upload</p><p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Multiple files supported · Max 10MB each</p></div>
          }
        </label>
      </div>

      {/* Grid */}
      {items.length === 0
        ? <p className="py-12 text-center text-muted-foreground">No images yet. Upload some above.</p>
        : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl bg-cream-400">
                <div className="aspect-square relative">
                  <Image src={item.thumbnail_url ?? item.url} alt={item.caption ?? 'Gallery'} fill className="object-cover" sizes="200px" />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="self-end rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-50">
                    {deleting === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                  <button onClick={() => { setEditingId(item.id); setEditCaption(item.caption ?? '') }} className="self-start rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30">
                    <Edit2 size={12} />
                  </button>
                </div>

                {/* Caption edit */}
                {editingId === item.id && (
                  <div className="absolute inset-0 bg-white/95 p-2 flex flex-col gap-2">
                    <textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} rows={2} className="w-full rounded border border-cream-500 px-2 py-1 text-xs outline-none resize-none focus:border-gold" placeholder="Caption..." />
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveCaption(item.id)} className="flex-1 rounded bg-gold py-1 text-xs font-medium text-navy"><Check size={12} className="inline mr-1" />Save</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 rounded bg-cream py-1 text-xs text-navy"><X size={12} className="inline mr-1" />Cancel</button>
                    </div>
                  </div>
                )}

                {item.caption && (
                  <p className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-2 py-1 text-xs text-white">{item.caption}</p>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
