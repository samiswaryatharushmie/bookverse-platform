/**
 * ResultsToolbar — Sticky bar carrying result count, sort, view toggle, and density.
 *
 * Desktop: segmented control for sort. Mobile: dropdown.
 * Grid ↔ list toggle. Density toggle (compact / comfortable).
 */
import { Grid3x3, List, Maximize2, Minimize2, BookmarkPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CatalogParams } from '../hooks/useCatalogParams';
import { useSavedSearches } from '../hooks/useSavedSearches';

interface ResultsToolbarProps {
  params: CatalogParams;
  setParams: (updater: Partial<CatalogParams>) => void;
  totalElements: number;
  hasQuery: boolean;
}

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popular' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'date_desc', label: 'Newest' },
  { value: 'rating_desc', label: 'Top Rated' },
  { value: 'title_asc', label: 'A–Z' },
] as const;

export default function ResultsToolbar({ params, setParams, totalElements, hasQuery }: ResultsToolbarProps) {
  const { saveSearch } = useSavedSearches();
  const sortOptions = hasQuery
    ? [{ value: 'relevance', label: 'Relevance' }, ...SORT_OPTIONS]
    : SORT_OPTIONS;

  const handleSaveSearch = () => {
    const searchName = params.q ? `Search: "${params.q}"` : 'Saved Filter';
    saveSearch(searchName, window.location.search);
    toast.success(`Saved "${searchName}" to your searches`);
  };

  return (
    <div
      className="sticky top-16 z-30 bg-[var(--color-bg-primary)]/80 backdrop-blur-xl
                 border-b border-[var(--color-border)] py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Result count */}
        <div className="flex items-center gap-4">
          <p className="text-sm text-[var(--color-text-muted)] tabular-nums"
             role="status" aria-live="polite" aria-atomic="true">
            <span className="font-semibold text-[var(--color-text-primary)]">{totalElements.toLocaleString()}</span>
            {' '}books found
          </p>
          
          <button 
            onClick={handleSaveSearch}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 px-2 py-1 rounded transition-colors"
          >
            <BookmarkPlus size={14} />
            Save Search
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort — Desktop: segmented control */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--color-bg-surface)] rounded-lg p-1 border border-[var(--color-border)]">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setParams({ sort: opt.value })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  params.sort === opt.value
                    ? 'bg-[var(--color-accent)] text-[var(--color-bg-primary)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
                aria-pressed={params.sort === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort — Mobile: dropdown */}
          <select
            className="md:hidden input text-sm py-1.5 px-3 h-auto"
            value={params.sort}
            onChange={(e) => setParams({ sort: e.target.value })}
            aria-label="Sort by"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-[var(--color-bg-surface)] rounded-lg p-1 border border-[var(--color-border)]">
            <button
              onClick={() => setParams({ view: 'grid' })}
              className={`p-1.5 rounded-md transition-all ${
                params.view === 'grid'
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              aria-label="Grid view"
              aria-pressed={params.view === 'grid'}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setParams({ view: 'list' })}
              className={`p-1.5 rounded-md transition-all ${
                params.view === 'list'
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              aria-label="List view"
              aria-pressed={params.view === 'list'}
            >
              <List size={16} />
            </button>
          </div>

          {/* Density toggle */}
          <button
            onClick={() =>
              setParams({ density: params.density === 'comfortable' ? 'compact' : 'comfortable' })
            }
            className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
                       bg-[var(--color-bg-surface)] border border-[var(--color-border)] transition-all"
            aria-label={`Switch to ${params.density === 'comfortable' ? 'compact' : 'comfortable'} density`}
            title={params.density === 'comfortable' ? 'Compact view' : 'Comfortable view'}
          >
            {params.density === 'comfortable' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
