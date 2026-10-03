import { useState, useEffect } from 'react';

export interface SavedSearch {
  id: string;
  name: string;
  url: string;
  createdAt: number;
}

const STORAGE_KEY = 'saved_searches';

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  }, [searches]);

  const saveSearch = (name: string, url: string) => {
    const newSearch: SavedSearch = {
      id: Math.random().toString(36).substring(7),
      name,
      url,
      createdAt: Date.now()
    };
    setSearches(prev => [newSearch, ...prev]);
  };

  const removeSearch = (id: string) => {
    setSearches(prev => prev.filter(s => s.id !== id));
  };

  return { searches, saveSearch, removeSearch };
}
