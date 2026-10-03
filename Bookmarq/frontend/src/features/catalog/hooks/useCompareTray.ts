import { useState, useEffect } from 'react';
import type { BookResult } from './useCatalogData';

const STORAGE_KEY = 'compare_tray';

export function useCompareTray() {
  const [compareItems, setCompareItems] = useState<BookResult[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (book: BookResult) => {
    setCompareItems((prev) => {
      if (prev.find((i) => i.id === book.id)) return prev;
      if (prev.length >= 3) {
        // max 3 items
        return [...prev.slice(1), book];
      }
      return [...prev, book];
    });
  };

  const removeFromCompare = (bookId: string) => {
    setCompareItems((prev) => prev.filter((i) => i.id !== bookId));
  };

  const clearCompare = () => setCompareItems([]);

  const isComparing = (bookId: string) => compareItems.some((i) => i.id === bookId);

  return {
    compareItems,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isComparing,
  };
}
