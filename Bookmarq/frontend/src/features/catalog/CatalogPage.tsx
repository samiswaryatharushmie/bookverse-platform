import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import { Filter, BookOpen, TrendingUp, SearchX, Sparkles, BrainCircuit, Search } from 'lucide-react';

import WishlistButton from '../wishlist/WishlistButton';
import { useCatalogParams } from './hooks/useCatalogParams';
import { useCatalogResults, useFacetData, BookResult } from './hooks/useCatalogData';
import FilterPanel from './components/FilterPanel';
import CategoryPills from './components/CategoryPills';
import FilterChips from './components/FilterChips';
import ResultsToolbar from './components/ResultsToolbar';
import MobileBottomSheet from './components/MobileBottomSheet';
import { SkeletonGrid } from './components/SkeletonCard';
import BookCard from './components/BookCard';
import CompareTray from './components/CompareTray';
import RecentlyViewedRail from './components/RecentlyViewedRail';
import RecommendedRail from './components/RecommendedRail';
import CuratedShelves from './components/CuratedShelves';
import AuthorSpotlightCard from './components/AuthorSpotlightCard';


// Restore legacy exports for other components that might still use them
export type Book = BookResult;
export type Category = { id: string; name: string; slug: string; parentId?: string };
export type Author = { id: string; name: string; slug?: string };

// Legacy SearchResult for Hybrid Search
interface SearchResult {
  book: BookResult;
  bm25Score: number;
  semanticScore: number;
  rrfScore: number;
}

export default function CatalogPage() {
  const {
    params,
    setParams,
    toggleFacet,
    removeFilter,
    clearAll,
    activeFilterCount,
  } = useCatalogParams();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Local state for the search input to allow typing without immediate URL updates
  const [searchInput, setSearchInput] = useState(params.q);
  useEffect(() => {
    setSearchInput(params.q);
  }, [params.q]);

  const [scholarMode, setScholarMode] = useState(false);
  const [lexicalWeight, setLexicalWeight] = useState(1.0);
  const [semanticWeight, setSemanticWeight] = useState(1.0);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.page]);

  // ── Data Fetching ────────────────────────────────────────────────────────

  const { data: facets, isLoading: facetsLoading } = useFacetData(params);
  const { data: pageData, isLoading: catalogLoading, isFetching: catalogFetching } = useCatalogResults(params);

  // Autocomplete Suggestions
  const { data: suggestions = [] } = useQuery<string[]>({
    queryKey: ['autocomplete', searchInput],
    queryFn: async () => {
      const res = await apiClient.get(`/books/search/autocomplete?q=${searchInput}`);
      return res.data.data;
    },
    enabled: searchInput.length > 1
  });

  // Hybrid Search (Scholar Mode active or simply when 'q' is present)
  // Currently, the spec says we use the facet catalog for standard, 
  // but if we want to keep hybrid search for 'q', we fetch it here.
  const { data: searchResults, isLoading: searchLoading, isFetching: searchFetching } = useQuery<SearchResult[]>({
    queryKey: ['hybrid-search', params.q, lexicalWeight, semanticWeight],
    queryFn: async () => {
      const res = await apiClient.get(`/books/search/hybrid?query=${params.q}&lexicalWeight=${lexicalWeight}&semanticWeight=${semanticWeight}`);
      return res.data.data;
    },
    enabled: !!params.q
  });

  const isLoading = (catalogLoading && !pageData) || (searchLoading && !searchResults);
  const isFetching = catalogFetching || searchFetching;

  const displayedBooks = params.q 
    ? (searchResults?.map(r => ({ ...r.book, bm25Score: r.bm25Score, semanticScore: r.semanticScore, rrfScore: r.rrfScore })) || []) 
    : (pageData?.content || []);

  const totalElements = params.q ? displayedBooks.length : (pageData?.totalElements || 0);

  // Fallbacks
  const firstWord = params.q.split(' ')[0] || '';
  const { data: fallbackBooks = [] } = useQuery<BookResult[]>({
    queryKey: ['books-fallback', firstWord],
    queryFn: async () => {
      if (firstWord.length > 2) {
        const res = await apiClient.get(`/books/catalog?q=${firstWord}&size=4`);
        if (res.data.data.content.length > 0) return res.data.data.content;
      }
      const fallbackRes = await apiClient.get('/books/catalog?sort=popularity&size=4');
      return fallbackRes.data.data.content;
    },
    enabled: !!params.q && displayedBooks.length === 0 && !isLoading
  });



  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ q: searchInput });
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setParams({ q: suggestion });
  };

  // ── Rendering ────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* Mobile Filter Button */}
      <div className="md:hidden flex gap-2 mb-4">
        <button 
          onClick={() => setMobileFiltersOpen(true)}
          className="flex-1 btn btn-secondary flex items-center justify-center gap-2 py-3"
        >
          <Filter size={18} />
          Filters {activeFilterCount > 0 && <span className="bg-[var(--color-accent)] text-[var(--color-bg-primary)] px-2 py-0.5 rounded-full text-xs">{activeFilterCount}</span>}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <form onSubmit={handleSearch} className="relative z-40">
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search books..." 
                className="input pl-9 w-full"
                autoComplete="off"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              
              {searchInput.length > 1 && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md shadow-xl overflow-hidden backdrop-blur-xl animate-fade-in z-50">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectSuggestion(sug)}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/20 hover:text-[var(--color-accent)] transition-colors border-b border-[var(--color-border)] last:border-0"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
              <button type="submit" className="hidden">Search</button>
            </form>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="text-xs text-[var(--color-accent)] font-medium hover:underline">
                    Clear All
                  </button>
                )}
              </div>
              
              {facetsLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-[var(--color-bg-surface)] rounded mb-3" />
                      <div className="space-y-2 pl-2">
                        <div className="h-3 w-32 bg-[var(--color-bg-surface)] rounded" />
                        <div className="h-3 w-28 bg-[var(--color-bg-surface)] rounded" />
                        <div className="h-3 w-36 bg-[var(--color-bg-surface)] rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <FilterPanel params={params} setParams={setParams} facets={facets} toggleFacet={toggleFacet} />
              )}
            </div>
            
            <CompareTray />
          </div>
        </aside>

        {/* Mobile Bottom Sheet */}
        <MobileBottomSheet
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          title="Filters"
          footer={
            <div className="flex gap-3">
              <button onClick={clearAll} className="btn btn-secondary flex-1">Clear All</button>
              <button onClick={() => setMobileFiltersOpen(false)} className="btn btn-primary flex-1">Show Results</button>
            </div>
          }
        >
          <FilterPanel params={params} setParams={setParams} facets={facets} toggleFacet={toggleFacet} />
        </MobileBottomSheet>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Library Catalog</h1>
              {params.q && (
                <p className="text-[var(--color-text-muted)] mt-1">
                  Search results for <span className="text-[var(--color-text-primary)] font-semibold">"{params.q}"</span>
                </p>
              )}
            </div>
            
            {/* Scholar Mode Toggle */}
            <button 
              onClick={() => setScholarMode(!scholarMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 shrink-0 ${scholarMode ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)] glow-brass' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-soft)]'}`}
            >
              <BrainCircuit size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Scholar Mode</span>
            </button>
          </div>
          
          {/* Category Pill Navigation */}
          <CategoryPills 
            params={params} 
            setParams={setParams} 
            facets={facets} 
            totalElements={pageData?.totalElements}
          />

          {/* Scholar Mode Controls */}
          {scholarMode && params.q && (
            <div className="mb-8 p-4 glass-panel-surface border-[var(--color-accent)]/30 animate-fade-in rounded-xl">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 w-full">
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-info)]">Lexical Weight (BM25)</label>
                    <span className="text-xs font-mono bg-[var(--color-bg-primary)] px-2 py-0.5 rounded border border-[var(--color-border)]">{lexicalWeight.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="0" max="2" step="0.1" 
                    value={lexicalWeight} 
                    onChange={(e) => setLexicalWeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[var(--color-bg-primary)] rounded-lg appearance-none cursor-pointer border border-[var(--color-border)]"
                  />
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-1 text-center italic">Controls the impact of keyword matching</div>
                </div>
                
                <div className="h-8 w-px bg-[var(--color-border)] hidden md:block"></div>

                <div className="flex-1 w-full">
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-success)]">Semantic Weight (Cosine)</label>
                    <span className="text-xs font-mono bg-[var(--color-bg-primary)] px-2 py-0.5 rounded border border-[var(--color-border)]">{semanticWeight.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="0" max="2" step="0.1" 
                    value={semanticWeight} 
                    onChange={(e) => setSemanticWeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[var(--color-bg-primary)] rounded-lg appearance-none cursor-pointer border border-[var(--color-border)]"
                  />
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-1 text-center italic">Controls the impact of neural vector similarity</div>
                </div>
              </div>
            </div>
          )}

          <FilterChips 
            params={params} 
            removeFilter={removeFilter} 
            clearAll={clearAll} 
            genres={facets?.genre || []} 
          />

          <ResultsToolbar 
            params={params} 
            setParams={setParams} 
            totalElements={totalElements} 
            hasQuery={!!params.q}
          />



          {/* Results Grid / List */}
          <div className={isFetching && !isLoading ? 'opacity-50 transition-opacity pointer-events-none' : ''}>
            {isLoading ? (
              <SkeletonGrid view={params.view} />
            ) : displayedBooks.length === 0 ? (
              <div className="space-y-12">
                <div className="text-center py-20 card bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-primary)] border-dashed border-2 border-[var(--color-border)] animate-fade-in">
                  <div className="w-20 h-20 bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <SearchX className="h-10 w-10 text-[var(--color-text-muted)] opacity-70" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-2">No Tomes Discovered</h3>
                  <p className="text-[var(--color-text-muted)] max-w-md mx-auto">The archives hold no record matching your current filters and queries. Try broadening your search.</p>
                  <button 
                    onClick={clearAll}
                    className="btn-premium mt-8 mx-auto flex items-center justify-center gap-2 px-6"
                  >
                    Clear all filters
                  </button>
                </div>

                {fallbackBooks.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[var(--color-accent)]" /> Are you looking for?
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {fallbackBooks.map(book => (
                        <Link key={book.id} to={`/book/${book.slug}`} className="group flex flex-col h-full">
                          <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-[var(--color-bg-surface)] mb-4 border border-[var(--color-border)] group-hover:border-[var(--color-accent)] transition-colors relative">
                            {book.coverUrl ? (
                              <img src={book.coverUrl?.startsWith('http') ? book.coverUrl : `http://localhost:8080${book.coverUrl}`} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-[var(--color-text-muted)]">
                                <BookOpen className="h-10 w-10 opacity-20" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <WishlistButton bookId={book.id} />
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col">
                            <h3 className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1 leading-tight mb-1">
                              {book.title}
                            </h3>
                            <p className="text-sm text-[var(--color-text-muted)] mb-1 line-clamp-1">
                              {book.authors?.map(a => a.name).join(', ')}
                            </p>
                            <div className="mt-auto pt-1 font-bold text-sm flex items-baseline gap-2">
                              LKR {book.price.toFixed(2)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>

                
                {params.q && <AuthorSpotlightCard query={params.q} />}
                
                <div className={
                  params.view === 'grid' 
                    ? `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 ${params.density === 'compact' ? 'gap-4' : 'gap-6'}`
                    : `flex flex-col ${params.density === 'compact' ? 'gap-3' : 'gap-4'}`
                }>
                  {displayedBooks.map((book) => (
                    <BookCard 
                      key={book.id} 
                      book={book} 
                      view={params.view}
                      density={params.density}
                      scholarMode={scholarMode} 
                      hasQuery={!!params.q} 
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {!params.q && pageData && pageData.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center gap-2 bg-[var(--color-bg-surface)] p-1 rounded-lg border border-[var(--color-border)]">
                      <button 
                        disabled={pageData.first}
                        onClick={() => setParams({ page: Math.max(0, params.page - 1) })}
                        className="px-3 py-1.5 text-sm rounded-md disabled:opacity-30 hover:bg-[var(--color-bg-elevated)] transition-colors font-medium"
                      >
                        Prev
                      </button>
                      <span className="text-sm font-medium px-4 text-[var(--color-text-muted)]">
                        Page {pageData.number + 1} of {pageData.totalPages}
                      </span>
                      <button 
                        disabled={pageData.last}
                        onClick={() => setParams({ page: params.page + 1 })}
                        className="px-3 py-1.5 text-sm rounded-md disabled:opacity-30 hover:bg-[var(--color-bg-elevated)] transition-colors font-medium"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
            
            {!params.q && activeFilterCount === 0 && params.page === 0 && (
              <>
                <RecommendedRail />
                <RecentlyViewedRail />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


