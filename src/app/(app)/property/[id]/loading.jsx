export default function PropertyLoading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col animate-pulse">
      {/* Property header skeleton */}
      <div className="border-b border-border bg-white px-6 py-5">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-base rounded" />
            <div className="h-3.5 w-32 bg-base rounded" />
          </div>
          <div className="flex gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-right space-y-1">
                <div className="h-6 w-10 bg-base rounded ml-auto" />
                <div className="h-3 w-16 bg-base rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="border-b border-border bg-surface px-6 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            <div className="h-7 w-36 bg-base rounded-lg" />
            <div className="h-7 w-36 bg-base rounded-lg" />
          </div>
          <div className="h-7 w-24 bg-base rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6">
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          {/* Header row */}
          <div className="flex gap-4 px-4 py-3 border-b border-border bg-base">
            {[190, 72, 100, 140, 80, 70, 50, 60, 50, 130, 130, 60, 140].map((w, i) => (
              <div key={i} className="h-3 bg-border rounded flex-shrink-0" style={{ width: w }} />
            ))}
          </div>
          {/* Data rows */}
          {[...Array(8)].map((_, row) => (
            <div key={row} className="flex gap-4 px-4 py-3 border-b border-border last:border-b-0">
              <div className="h-4 w-44 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-16 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-20 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-32 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-16 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-10 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-8 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-10 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-8 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-24 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-20 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-8 bg-base rounded flex-shrink-0" />
              <div className="h-4 w-28 bg-base rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
