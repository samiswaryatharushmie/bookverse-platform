import { useState, useEffect } from 'react';

type ReadingStatus = 'NONE' | 'WANT_TO_READ' | 'CURRENTLY_READING' | 'READ' | 'OWNED';

const STORAGE_KEY = 'library_state';

export function useLibraryState() {
  const [library, setLibrary] = useState<Record<string, ReadingStatus>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }, [library]);

  const setStatus = (bookId: string, status: ReadingStatus) => {
    setLibrary(prev => {
      if (status === 'NONE') {
        const next = { ...prev };
        delete next[bookId];
        return next;
      }
      return { ...prev, [bookId]: status };
    });
  };

  const getStatus = (bookId: string) => library[bookId] || 'NONE';

  return { setStatus, getStatus, library };
}
