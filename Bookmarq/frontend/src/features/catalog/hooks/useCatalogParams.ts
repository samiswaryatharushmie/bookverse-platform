/**
 * useCatalogParams — Single source of truth for catalog URL ↔ state.
 *
 * Every piece of filter/sort/pagination state lives in the URL.
 * This hook reads from and writes to useSearchParams, so:
 * - Deep links reproduce results exactly
 * - Browser back/forward walks filter history
 * - Filter changes replace history (no push)
 * - Navigating to a book detail pushes
 *
 * Multi-select facets are comma-joined.
 * Omit params at their default value so clean URLs stay clean.
 */
import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo, useRef } from 'react';

export interface CatalogParams {
  q: string;
  category: string | null; // top-level category UUID
  sub: string | null;      // subcategory UUID

  priceMin: number | null;
  priceMax: number | null;
  rating: number | null;   // min rating threshold (1-5)
  lang: string[];          // language codes
  yearMin: number | null;
  yearMax: number | null;
  avail: string;           // 'in_stock' | 'out_of_stock' | 'pre_order' | ''
  sort: string;            // price_asc, price_desc, date_desc, rating_desc, popularity, title_asc, relevance
  view: 'grid' | 'list';
  density: 'compact' | 'comfortable';
  page: number;
}

const DEFAULTS: CatalogParams = {
  q: '',
  category: null,
  sub: null,

  priceMin: null,
  priceMax: null,
  rating: null,
  lang: [],
  yearMin: null,
  yearMax: null,
  avail: '',
  sort: 'popularity',
  view: 'grid',
  density: 'comfortable',
  page: 0,
};

function parseCommaSeparated(val: string | null): string[] {
  if (!val) return [];
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

function parseNumber(val: string | null): number | null {
  if (!val) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function parseRange(val: string | null): [number | null, number | null] {
  if (!val || !val.includes('-')) return [null, null];
  const parts = val.split('-', 2);
  return [parseNumber(parts[0]), parseNumber(parts[1])];
}

/**
 * Reads catalog state from URL search params.
 */
function readParams(searchParams: URLSearchParams): CatalogParams {
  const [priceMin, priceMax] = parseRange(searchParams.get('price'));
  const [yearMin, yearMax] = parseRange(searchParams.get('year'));

  return {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || null,
    sub: searchParams.get('sub') || null,

    priceMin,
    priceMax,
    rating: parseNumber(searchParams.get('rating')),
    lang: parseCommaSeparated(searchParams.get('lang')),
    yearMin,
    yearMax,
    avail: searchParams.get('avail') || '',
    sort: searchParams.get('sort') || DEFAULTS.sort,
    view: (searchParams.get('view') as 'grid' | 'list') || DEFAULTS.view,
    density: (searchParams.get('density') as 'compact' | 'comfortable') || DEFAULTS.density,
    page: parseInt(searchParams.get('page') || '0', 10),
  };
}

/**
 * Serializes catalog state to URL search params.
 * Omits params at their default value so clean URLs stay clean.
 */
function writeParams(params: CatalogParams): URLSearchParams {
  const sp = new URLSearchParams();

  if (params.q)                           sp.set('q', params.q);
  if (params.category)                    sp.set('category', params.category);
  if (params.sub)                         sp.set('sub', params.sub);

  if (params.priceMin !== null || params.priceMax !== null) {
    sp.set('price', `${params.priceMin ?? ''}-${params.priceMax ?? ''}`);
  }
  if (params.rating !== null)             sp.set('rating', String(params.rating));
  if (params.lang.length > 0)             sp.set('lang', params.lang.join(','));
  if (params.yearMin !== null || params.yearMax !== null) {
    sp.set('year', `${params.yearMin ?? ''}-${params.yearMax ?? ''}`);
  }
  if (params.avail)                       sp.set('avail', params.avail);
  if (params.sort !== DEFAULTS.sort)      sp.set('sort', params.sort);
  if (params.view !== DEFAULTS.view)      sp.set('view', params.view);
  if (params.density !== DEFAULTS.density) sp.set('density', params.density);
  if (params.page > 0)                    sp.set('page', String(params.page));

  return sp;
}

export type ParamUpdater = Partial<CatalogParams> | ((prev: CatalogParams) => Partial<CatalogParams>);

export function useCatalogParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  const params = useMemo(() => readParams(searchParams), [searchParams]);

  /**
   * Update catalog params. Automatically resets page to 0 when filters change
   * (unless explicitly setting page). Uses replaceState to avoid polluting
   * browser history with every filter toggle.
   */
  const setParams = useCallback(
    (updater: ParamUpdater) => {
      setSearchParams(prev => {
        const current = readParams(prev);
        const changes = typeof updater === 'function' ? updater(current) : updater;

        // If any filter changed (not just page/view/density), reset page to 0
        const isFilterChange = Object.keys(changes).some(
          k => !['page', 'view', 'density'].includes(k)
        );

        const merged: CatalogParams = {
          ...current,
          ...changes,
          ...(isFilterChange && !('page' in changes) ? { page: 0 } : {}),
        };

        return writeParams(merged);
      }, { replace: true });  // replace history, don't push
    },
    [setSearchParams]
  );

  /**
   * Toggle a value in a multi-select facet (genre, format, language).
   * If the value is already selected, remove it. Otherwise, add it.
   */
  const toggleFacet = useCallback(
    (facet: 'lang', value: string) => {
      setParams(prev => {
        const current = prev.lang;
        const next = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        return { lang: next };
      });
    },
    [setParams]
  );

  /**
   * Remove a single active filter value.
   */
  const removeFilter = useCallback(
    (facet: string, value?: string) => {
      setParams(prev => {
        switch (facet) {
          case 'q':       return { q: '' };
          case 'category':return { category: null, sub: null };
          case 'sub':     return { sub: null };

          case 'lang':    return { lang: prev.lang.filter(v => v !== value) };
          case 'price':   return { priceMin: null, priceMax: null };
          case 'rating':  return { rating: null };
          case 'year':    return { yearMin: null, yearMax: null };
          case 'avail':   return { avail: '' };
          default:        return {};
        }
      });
    },
    [setParams]
  );

  /**
   * Clear all filters and reset to defaults.
   */
  const clearAll = useCallback(() => {
    setParams({ ...DEFAULTS });
  }, [setParams]);

  /**
   * Get the AbortController for the current request cycle.
   * Cancels any in-flight request from the previous cycle.
   */
  const getAbortSignal = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    return abortRef.current.signal;
  }, []);

  /**
   * Build the query string for the /api/books/catalog backend endpoint.
   */
  const toApiQueryString = useCallback((): string => {
    const sp = new URLSearchParams();
    if (params.q)                           sp.set('q', params.q);
    const activeGenre = params.sub || params.category;
    if (activeGenre)                        sp.set('genre', activeGenre);

    if (params.priceMin !== null || params.priceMax !== null) {
      sp.set('price', `${params.priceMin ?? ''}-${params.priceMax ?? ''}`);
    }
    if (params.rating !== null)             sp.set('rating', String(params.rating));
    if (params.lang.length > 0)             sp.set('lang', params.lang.join(','));
    if (params.yearMin !== null || params.yearMax !== null) {
      sp.set('year', `${params.yearMin ?? ''}-${params.yearMax ?? ''}`);
    }
    if (params.avail)                       sp.set('avail', params.avail);
    sp.set('sort', params.sort);
    sp.set('page', String(params.page));
    sp.set('size', '20');
    return sp.toString();
  }, [params]);

  /**
   * Count active filters (for mobile badge).
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (params.q) count++;
    if (params.category) count++;
    if (params.sub) count++;

    if (params.priceMin !== null || params.priceMax !== null) count++;
    if (params.rating !== null) count++;
    count += params.lang.length;
    if (params.yearMin !== null || params.yearMax !== null) count++;
    if (params.avail) count++;
    return count;
  }, [params]);

  return {
    params,
    setParams,
    toggleFacet,
    removeFilter,
    clearAll,
    getAbortSignal,
    toApiQueryString,
    activeFilterCount,
    debounceRef,
  };
}

export { DEFAULTS as CATALOG_DEFAULTS };
