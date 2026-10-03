import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/apiClient';
import type { CatalogParams } from '../hooks/useCatalogParams';
import type { FacetData } from '../hooks/useCatalogData';

interface CategoryPillsProps {
  params: CatalogParams;
  setParams: (updater: Partial<CatalogParams> | ((prev: CatalogParams) => Partial<CatalogParams>)) => void;
  facets: FacetData | undefined;
  totalElements?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export default function CategoryPills({ params, setParams, facets, totalElements }: CategoryPillsProps) {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories-full'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data.data;
    }
  });

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const facetCounts = useMemo(() => {
    const map = new Map<string, number>();
    if (facets?.genre) {
      facets.genre.forEach(g => map.set(g.id, g.count));
      
      // Aggregate subcategory counts into their parents
      categories.forEach(c => {
        if (c.parentId) {
          const subCount = map.get(c.id) || 0;
          if (subCount > 0) {
            const parentCount = map.get(c.parentId) || 0;
            map.set(c.parentId, parentCount + subCount);
          }
        }
      });
    }
    return map;
  }, [facets, categories]);

  // Derived arrays
  const topCategories = categories.filter(c => !c.parentId);
  const activeTopCategory = topCategories.find(c => c.id === params.category);
  
  const subCategories = activeTopCategory
    ? categories.filter(c => c.parentId === activeTopCategory.id)
    : [];

  const handleTopLevelSelect = (categoryId: string) => {
    if (params.category === categoryId) {
      // Deselect if already selected
      setParams({ category: null, sub: null });
    } else {
      // Select new top-level, reset sub
      setParams({ category: categoryId, sub: null });
    }
    setIsMoreOpen(false);
  };

  const handleSubSelect = (subId: string) => {
    if (params.sub === subId) {
      setParams({ sub: null });
    } else {
      setParams({ sub: subId });
    }
  };

  // Split top categories into visible row and "More" dropdown
  const VISIBLE_COUNT = 6;
  const visibleCategories = topCategories.slice(0, VISIBLE_COUNT);
  const hiddenCategories = topCategories.slice(VISIBLE_COUNT);

  // Helper to render a top-level pill
  const renderPill = (cat: Category) => {
    const isSelected = params.category === cat.id;
    const hasZeroResults = (facetCounts.get(cat.id) || 0) === 0 && !isSelected;
    
    return (
      <button
        key={cat.id}
        type="button"
        role="radio"
        aria-checked={isSelected}
        disabled={hasZeroResults}
        onClick={() => handleTopLevelSelect(cat.id)}
        className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)] ${
          isSelected
            ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]'
            : hasZeroResults
            ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]/50 border border-[var(--color-border)] cursor-not-allowed'
            : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent-soft)] hover:text-[var(--color-accent)]'
        }`}
      >
        {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
        {cat.name}
      </button>
    );
  };

  if (topCategories.length === 0) return null;

  return (
    <div className="mb-6 card p-4 overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Browse by category
        </h3>
        {totalElements !== undefined && (
          <div className="text-sm text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text-primary)]">{totalElements}</span> results
          </div>
        )}
      </div>

      {/* Row 1: Top-level Categories */}
      <div 
        role="radiogroup" 
        aria-label="Category"
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:pb-0 sm:overflow-visible sm:flex-wrap"
      >
        {visibleCategories.map(renderPill)}

        {/* More Dropdown (Desktop) */}
        {hiddenCategories.length > 0 && (
          <div className="relative hidden sm:block shrink-0" ref={moreRef}>
            <button
              type="button"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              aria-expanded={isMoreOpen}
              className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm border transition-all ${
                hiddenCategories.some(c => c.id === params.category) || isMoreOpen
                  ? 'border-[var(--color-accent-soft)] text-[var(--color-accent)] bg-[var(--color-accent)]/5'
                  : 'border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-soft)] bg-[var(--color-bg-surface)]'
              }`}
            >
              More <ChevronDown className={`h-4 w-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-xl z-50 p-2 grid gap-1 animate-fade-in">
                {hiddenCategories.map((cat) => {
                  const isSelected = params.category === cat.id;
                  const hasZeroResults = (facetCounts.get(cat.id) || 0) === 0 && !isSelected;
                  
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={hasZeroResults}
                      onClick={() => handleTopLevelSelect(cat.id)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                          : hasZeroResults
                          ? 'text-[var(--color-text-muted)]/50 cursor-not-allowed'
                          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-accent)]'
                      }`}
                    >
                      {cat.name}
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Mobile: Render all hidden categories inline so user can scroll to them */}
        <div className="flex sm:hidden items-center gap-2">
          {hiddenCategories.map(renderPill)}
        </div>
      </div>

      {/* Row 2: Subcategories (Animated) */}
      <div 
        role="radiogroup" 
        aria-label="Subcategory"
        aria-live="polite"
        className={`transition-all duration-300 ease-in-out origin-top overflow-hidden ${
          params.category && subCategories.length > 0
            ? 'max-h-40 opacity-100 mt-4 pt-4 border-t border-[var(--color-border)]'
            : 'max-h-0 opacity-0 mt-0 border-transparent'
        }`}
      >
        {activeTopCategory && (
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
            <span className="text-[13px] text-[var(--color-text-muted)] shrink-0 pl-1">
              In {activeTopCategory.name}:
            </span>
            <div className="flex items-center gap-2">
              {subCategories.map((sub) => {
                const isSelected = params.sub === sub.id;
                const hasZeroResults = (facetCounts.get(sub.id) || 0) === 0 && !isSelected;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={hasZeroResults}
                    onClick={() => handleSubSelect(sub.id)}
                    className={`shrink-0 rounded-full px-3 py-1 text-[13px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                      isSelected
                        ? 'bg-[var(--color-accent)] text-[var(--color-bg-primary)] font-medium'
                        : hasZeroResults
                        ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]/50 border border-[var(--color-border)]/50 cursor-not-allowed'
                        : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
