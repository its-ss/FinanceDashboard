export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="shimmer h-4 w-24 rounded" />
        <div className="shimmer h-9 w-9 rounded-lg" />
      </div>
      <div className="shimmer h-8 w-32 rounded mb-2" />
      <div className="shimmer h-3 w-20 rounded" />
    </div>
  );
}

export function SkeletonChart({ height = 280 }: { height?: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
      <div className="shimmer h-5 w-40 rounded mb-1" />
      <div className="shimmer h-3 w-28 rounded mb-4" />
      <div className="shimmer rounded" style={{ height }} />
    </div>
  );
}
