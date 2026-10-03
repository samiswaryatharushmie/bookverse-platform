/**
 * FilterChips — Active filter chips above the results.
 * One chip per selected value, each with its own X, plus a "Clear all" button.
 * This is the primary removal affordance on mobile.
 */
import { X } from 'lucide-react';
import type { CatalogParams } from '../hooks/useCatalogParams';
import type { GenreFacet } from '../hooks/useCatalogData';

interface FilterChipsProps {
  params: CatalogParams;
  removeFilter: (facet: string, value?: string) => void;
  clearAll: () => void;
  genres: GenreFacet[];  // for resolving genre UUID → name
}



const LANG_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  zh: 'Chinese',
  si: 'Sinhala',
  ta: 'Tamil',
};

const AVAIL_LABELS: Record<string, string> = {
  in_stock: 'In Stock',
  out_of_stock: 'Out of Stock',
  pre_order: 'Pre-Order',
};

export default function FilterChips({ params, removeFilter, clearAll, genres }: FilterChipsProps) {
  const chips: { label: string; facet: string; value?: string }[] = [];

  // Query chip
  if (params.q) {
    chips.push({ label: `"${params.q}"`, facet: 'q' });
  }

  // Category chips
  if (params.sub) {
    const genre = genres.find(g => g.id === params.sub);
    chips.push({ label: `Subcategory: ${genre?.name || params.sub}`, facet: 'sub' });
  } else if (params.category) {
    const genre = genres.find(g => g.id === params.category);
    chips.push({ label: `Category: ${genre?.name || params.category}`, facet: 'category' });
  }



  // Price chip
  if (params.priceMin !== null || params.priceMax !== null) {
    const min = params.priceMin !== null ? `LKR ${params.priceMin}` : '0';
    const max = params.priceMax !== null ? `LKR ${params.priceMax}` : '∞';
    chips.push({ label: `${min} – ${max}`, facet: 'price' });
  }

  // Rating chip
  if (params.rating !== null) {
    chips.push({ label: `${params.rating}+ ★`, facet: 'rating' });
  }

  // Language chips
  for (const lang of params.lang) {
    chips.push({ label: LANG_LABELS[lang] || lang, facet: 'lang', value: lang });
  }

  // Year chip
  if (params.yearMin !== null || params.yearMax !== null) {
    const min = params.yearMin ?? '...';
    const max = params.yearMax ?? '...';
    chips.push({ label: `${min}–${max}`, facet: 'year' });
  }

  // Availability chip
  if (params.avail) {
    chips.push({ label: AVAIL_LABELS[params.avail] || params.avail, facet: 'avail' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4" role="list" aria-label="Active filters">
      {chips.map((chip, i) => (
        <button
          key={`${chip.facet}-${chip.value ?? i}`}
          onClick={() => removeFilter(chip.facet, chip.value)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                     bg-[var(--color-accent)]/10 text-[var(--color-accent)]
                     border border-[var(--color-accent)]/25
                     hover:bg-[var(--color-accent)]/20 hover:border-[var(--color-accent)]/40
                     transition-all duration-200 group"
          role="listitem"
          aria-label={`Remove filter: ${chip.label}`}
        >
          <span className="font-medium">{chip.label}</span>
          <X
            size={14}
            className="opacity-60 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        </button>
      ))}

      {chips.length > 1 && (
        <button
          onClick={clearAll}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)]
                     transition-colors font-medium px-2 py-1"
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
