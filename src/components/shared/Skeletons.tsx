// ============================================================
// LoadingSkeleton — reusable skeleton blocks
// ============================================================

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`skeleton h-4 w-full rounded ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-cream-500 bg-white p-6 animate-pulse">
      <div className="skeleton h-48 w-full rounded-xl mb-4" />
      <div className="skeleton h-5 w-3/4 rounded mb-2" />
      <div className="skeleton h-4 w-full rounded mb-1" />
      <div className="skeleton h-4 w-5/6 rounded mb-4" />
      <div className="skeleton h-10 w-full rounded-lg" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="skeleton h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-14 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="skeleton h-16 w-full" />
      <div className="skeleton mt-0 h-72 w-full" />
      <div className="container py-12 space-y-6">
        <div className="skeleton h-8 w-1/3 mx-auto rounded" />
        <div className="grid grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}
