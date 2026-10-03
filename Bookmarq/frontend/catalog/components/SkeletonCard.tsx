/**
 * SkeletonCard — Shimmer skeleton sized to the final book card.
 * No spinners, no CLS. Matches the exact aspect ratio and spacing.
 */

interface SkeletonCardProps {
  view: 'grid' | 'list';
}

export default function SkeletonCard({ view }: SkeletonCardProps) {
  if (view === 'list') {
    return (
      <div className="flex gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50 animate-pulse">
        <div className="w-20 h-28 rounded bg-[var(--color-bg-surface)] flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-[var(--color-bg-surface)] rounded w-3/4" />
          <div className="h-3 bg-[var(--color-bg-surface)] rounded w-1/2" />
          <div className="h-3 bg-[var(--color-bg-surface)] rounded w-1/4 mt-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-[2/3] w-full rounded-lg bg-[var(--color-bg-surface)] mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-[var(--color-bg-surface)] rounded w-3/4" />
        <div className="h-3 bg-[var(--color-bg-surface)] rounded w-1/2" />
        <div className="h-4 bg-[var(--color-bg-surface)] rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ view, count = 12 }: { view: 'grid' | 'list'; count?: number }) {
  return (
    <div className={
      view === 'grid'
        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'
        : 'flex flex-col gap-3'
    }>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} view={view} />
      ))}
    </div>
  );
}
