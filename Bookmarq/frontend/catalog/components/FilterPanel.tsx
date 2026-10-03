/**
 * FilterPanel — Desktop sidebar filter panel with all faceted filters.
 *
 * Each option shows a live result count for what would remain if selected.
 * Counts update as other facets change. Zero-count options are disabled, not hidden
 * (hiding them makes the panel jump around).
 *
 * Multi-select within a facet is OR; across facets is AND.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CatalogParams } from '../hooks/useCatalogParams';
import type { FacetData, ValueFacet, RatingFacet } from '../hooks/useCatalogData';

interface FilterPanelProps {
  params: CatalogParams;
  facets: FacetData | undefined;
  toggleFacet: (facet: 'lang', value: string) => void;
  setParams: (updater: Partial<CatalogParams> | ((prev: CatalogParams) => Partial<CatalogParams>)) => void;
}



const LANG_LABELS: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  ja: 'Japanese', zh: 'Chinese', si: 'Sinhala', ta: 'Tamil',
};

const AVAIL_LABELS: Record<string, string> = {
  in_stock: 'In Stock',
  out_of_stock: 'Out of Stock',
  pre_order: 'Pre-Order',
};

const RATING_STARS = ['★★★★★', '★★★★', '★★★', '★★', '★'];

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--color-border)] pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={open}
      >
        <h4 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          {title}
        </h4>
        {open ? (
          <ChevronUp size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]" />
        ) : (
          <ChevronDown size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function FacetCheckbox({
  label,
  count,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-2 py-1 cursor-pointer group transition-colors ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg-surface)]
                   text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0
                   accent-[var(--color-accent)]"
      />
      <span className={`text-sm flex-1 ${
        checked ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text-primary)]'
      } group-hover:text-[var(--color-accent)] transition-colors`}>
        {label}
      </span>
      <span className={`text-xs tabular-nums ${
        count === 0 ? 'text-[var(--color-text-muted)]/50' : 'text-[var(--color-text-muted)]'
      }`}>
        {count}
      </span>
    </label>
  );
}

export default function FilterPanel({ params, facets, toggleFacet, setParams }: FilterPanelProps) {
  // Price range slider local state (debounced updates to URL)
  const [localPriceMin, setLocalPriceMin] = useState<string>('');
  const [localPriceMax, setLocalPriceMax] = useState<string>('');
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync local price state from URL params
  useEffect(() => {
    setLocalPriceMin(params.priceMin !== null ? String(params.priceMin) : '');
    setLocalPriceMax(params.priceMax !== null ? String(params.priceMax) : '');
  }, [params.priceMin, params.priceMax]);

  const handlePriceChange = useCallback(
    (min: string, max: string) => {
      setLocalPriceMin(min);
      setLocalPriceMax(max);
      if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
      priceDebounceRef.current = setTimeout(() => {
        setParams({
          priceMin: min ? Number(min) : null,
          priceMax: max ? Number(max) : null,
        });
      }, 250);
    },
    [setParams]
  );

  if (!facets) return null;

  return (
    <div className="space-y-0">
      {/* Price Range */}
      <CollapsibleSection title="Price (LKR)">
        <div className="space-y-3">
          {/* Price histogram */}
          {facets.priceHistogram.buckets.length > 0 && Math.max(...facets.priceHistogram.buckets.map(b => b.count)) > 0 && (
            <div className="h-12 flex items-end gap-px" aria-hidden="true">
              {facets.priceHistogram.buckets.map((bucket, i) => {
                const maxCount = Math.max(...facets.priceHistogram.buckets.map(b => b.count));
                const height = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
                const isInRange =
                  (params.priceMin === null || bucket.to >= params.priceMin) &&
                  (params.priceMax === null || bucket.from <= params.priceMax);
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all ${
                      isInRange
                        ? 'bg-[var(--color-accent)] opacity-60 hover:opacity-80'
                        : 'bg-[var(--color-border)] opacity-30'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`LKR ${bucket.from.toFixed(0)}–${bucket.to.toFixed(0)}: ${bucket.count} books`}
                  />
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              className="input w-full text-sm py-1.5 px-2 h-auto"
              value={localPriceMin}
              onChange={(e) => handlePriceChange(e.target.value, localPriceMax)}
              aria-label="Minimum price"
            />
            <span className="text-[var(--color-text-muted)]">–</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              className="input w-full text-sm py-1.5 px-2 h-auto"
              value={localPriceMax}
              onChange={(e) => handlePriceChange(localPriceMin, e.target.value)}
              aria-label="Maximum price"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Rating */}
      <CollapsibleSection title="Rating">
        {facets.rating.map((r: RatingFacet) => (
          <label
            key={r.minRating}
            className={`flex items-center gap-2 py-1 cursor-pointer group transition-colors ${
              r.count === 0 && params.rating !== r.minRating ? 'opacity-40' : ''
            }`}
          >
            <input
              type="radio"
              name="rating"
              checked={params.rating === r.minRating}
              onChange={() =>
                setParams({ rating: params.rating === r.minRating ? null : r.minRating })
              }
              disabled={r.count === 0 && params.rating !== r.minRating}
              className="w-4 h-4 border-[var(--color-border)] bg-[var(--color-bg-surface)]
                         text-[var(--color-accent)] accent-[var(--color-accent)]"
            />
            <span className={`text-sm flex-1 ${
              params.rating === r.minRating
                ? 'text-[var(--color-accent)] font-medium'
                : 'text-[var(--color-text-primary)]'
            } group-hover:text-[var(--color-accent)]`}>
              {r.minRating}+ ★
            </span>
            <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
              {r.count}
            </span>
          </label>
        ))}
      </CollapsibleSection>

      {/* Language */}
      <CollapsibleSection title="Language" defaultOpen={false}>
        {facets.language.map((lang: ValueFacet) => (
          <FacetCheckbox
            key={lang.value}
            label={LANG_LABELS[lang.value] || lang.value}
            count={lang.count}
            checked={params.lang.includes(lang.value)}
            onChange={() => toggleFacet('lang', lang.value)}
            disabled={lang.count === 0 && !params.lang.includes(lang.value)}
          />
        ))}
      </CollapsibleSection>

      {/* Year Range */}
      <CollapsibleSection title="Publication Year" defaultOpen={false}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={facets.yearRange.min ?? 1900}
            max={facets.yearRange.max ?? new Date().getFullYear()}
            placeholder={String(facets.yearRange.min ?? 'From')}
            className="input w-full text-sm py-1.5 px-2 h-auto"
            value={params.yearMin ?? ''}
            onChange={(e) =>
              setParams({ yearMin: e.target.value ? Number(e.target.value) : null })
            }
            aria-label="From year"
          />
          <span className="text-[var(--color-text-muted)]">–</span>
          <input
            type="number"
            min={facets.yearRange.min ?? 1900}
            max={facets.yearRange.max ?? new Date().getFullYear()}
            placeholder={String(facets.yearRange.max ?? 'To')}
            className="input w-full text-sm py-1.5 px-2 h-auto"
            value={params.yearMax ?? ''}
            onChange={(e) =>
              setParams({ yearMax: e.target.value ? Number(e.target.value) : null })
            }
            aria-label="To year"
          />
        </div>
      </CollapsibleSection>

      {/* Availability */}
      <CollapsibleSection title="Availability">
        {facets.availability.map((a: ValueFacet) => (
          <label
            key={a.value}
            className={`flex items-center gap-2 py-1 cursor-pointer group transition-colors ${
              a.count === 0 && params.avail !== a.value ? 'opacity-40' : ''
            }`}
          >
            <input
              type="radio"
              name="availability"
              checked={params.avail === a.value}
              onChange={() =>
                setParams({ avail: params.avail === a.value ? '' : a.value })
              }
              disabled={a.count === 0 && params.avail !== a.value}
              className="w-4 h-4 border-[var(--color-border)] bg-[var(--color-bg-surface)]
                         text-[var(--color-accent)] accent-[var(--color-accent)]"
            />
            <span className={`text-sm flex-1 ${
              params.avail === a.value
                ? 'text-[var(--color-accent)] font-medium'
                : 'text-[var(--color-text-primary)]'
            } group-hover:text-[var(--color-accent)]`}>
              {AVAIL_LABELS[a.value] || a.value}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
              {a.count}
            </span>
          </label>
        ))}
      </CollapsibleSection>
    </div>
  );
}
