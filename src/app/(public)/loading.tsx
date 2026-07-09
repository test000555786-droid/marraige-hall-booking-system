// src/app/(public)/loading.tsx
export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="h-16 bg-navy" />
      <div className="h-72 bg-navy/80" />
      <div className="container py-12">
        <div className="mx-auto h-8 w-48 rounded bg-cream-500 mb-8" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-cream-500 bg-white overflow-hidden">
              <div className="h-48 bg-cream-400" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-3/4 bg-cream-400 rounded" />
                <div className="h-4 bg-cream-400 rounded" />
                <div className="h-4 w-5/6 bg-cream-400 rounded" />
                <div className="h-10 bg-cream-400 rounded-lg mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
