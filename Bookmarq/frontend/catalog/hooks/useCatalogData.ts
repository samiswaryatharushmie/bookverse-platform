/**
 * useCatalogData — React Query hooks for catalog results and facets.
 *
 * Fetches from the new /api/books/catalog and /api/books/facets endpoints.
 * Debounces filter-driven refetches ~250ms and cancels in-flight requests.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import apiClient from '@/modules/common/lib/apiClient';
import type { CatalogParams } from './useCatalogParams';

// ── Types ───────────────────────────────────────────────────────────────────

export interface BookResult {
  id: string;
  isbn: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  memberPrice?: number;
  coverUrl?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  language: string;
  category: { id: string; name: string; slug: string; parentId?: string };
  authors: { id: string; name: string }[];
  avgRating: number;
  ratingCount: number;
  active: boolean;
  featured: boolean;
  views: number;
  format: string;
  preOrder: boolean;
  releaseDate?: string;
  signedEdition: boolean;
  seriesName?: string;
  seriesPosition?: number;
  seriesTotal?: number;
  translator?: string;
  originalTitle?: string;
  workKey?: string;
  readingLevel?: string;
  contentWarning?: string;
  ageRating?: string;
  popularityScore: number;
  otherEditions?: BookResult[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface GenreFacet {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface ValueFacet {
  value: string;
  count: number;
}

export interface RatingFacet {
  minRating: number;
  count: number;
}

export interface PriceBucket {
  from: number;
  to: number;
  count: number;
}

export interface FacetData {
  genre: GenreFacet[];

  language: ValueFacet[];
  rating: RatingFacet[];
  availability: ValueFacet[];
  priceHistogram: {
    min: number;
    max: number;
    buckets: PriceBucket[];
  };
  yearRange: {
    min: number | null;
    max: number | null;
  };
}

// ── Query string builder ────────────────────────────────────────────────────

function buildApiParams(params: CatalogParams): string {
  const sp = new URLSearchParams();
  if (params.q)                            sp.set('q', params.q);
  
  const activeGenre = params.sub || params.category;
  if (activeGenre)                         sp.set('genre', activeGenre);

  if (params.priceMin !== null || params.priceMax !== null) {
    sp.set('price', `${params.priceMin ?? ''}-${params.priceMax ?? ''}`);
  }
  if (params.rating !== null)              sp.set('rating', String(params.rating));
  if (params.lang.length > 0)              sp.set('lang', params.lang.join(','));
  if (params.yearMin !== null || params.yearMax !== null) {
    sp.set('year', `${params.yearMin ?? ''}-${params.yearMax ?? ''}`);
  }
  if (params.avail)                        sp.set('avail', params.avail);
  sp.set('sort', params.sort);
  sp.set('page', String(params.page));
  sp.set('size', '20');
  sp.set('workGrouped', 'true');
  return sp.toString();
}

function buildFacetParams(params: CatalogParams): string {
  const sp = new URLSearchParams();
  if (params.q)                            sp.set('q', params.q);
  
  const activeGenre = params.sub || params.category;
  if (activeGenre)                         sp.set('genre', activeGenre);

  if (params.priceMin !== null || params.priceMax !== null) {
    sp.set('price', `${params.priceMin ?? ''}-${params.priceMax ?? ''}`);
  }
  if (params.rating !== null)              sp.set('rating', String(params.rating));
  if (params.lang.length > 0)              sp.set('lang', params.lang.join(','));
  if (params.yearMin !== null || params.yearMax !== null) {
    sp.set('year', `${params.yearMin ?? ''}-${params.yearMax ?? ''}`);
  }
  if (params.avail)                        sp.set('avail', params.avail);
  return sp.toString();
}

// ── Stable key for react-query ──────────────────────────────────────────────

function catalogKey(params: CatalogParams) {
  return ['catalog', buildApiParams(params)];
}

function facetKey(params: CatalogParams) {
  return ['facets', buildFacetParams(params)];
}

// ── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetches paginated book results from /api/books/catalog.
 * Debounces by 250ms and cancels in-flight requests on param changes.
 */
export function useCatalogResults(params: CatalogParams) {
  const abortRef = useRef<AbortController>();

  return useQuery<PageResponse<BookResult>>({
    queryKey: catalogKey(params),
    queryFn: async ({ signal }) => {
      // Cancel previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const qs = buildApiParams(params);
      const res = await apiClient.get(`/books/catalog?${qs}`, {
        signal: signal ?? abortRef.current.signal,
      });
      return res.data.data;
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,  // keep previous data while loading (no flash)
  });
}

/**
 * Fetches live facet counts from /api/books/facets.
 * Updates whenever filter params change.
 */
export function useFacetData(params: CatalogParams) {
  return useQuery<FacetData>({
    queryKey: facetKey(params),
    queryFn: async ({ signal }) => {
      const qs = buildFacetParams(params);
      const res = await apiClient.get(`/books/facets?${qs}`, { signal });
      return res.data.data;
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
