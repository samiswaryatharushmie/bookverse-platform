import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/apiClient';
import { Link } from 'react-router-dom';
import { BookResult } from '../hooks/useCatalogData';
import { Layers } from 'lucide-react';

interface CuratedShelf {
  id: string;
  title: string;
  slug: string;
  description: string;
  books: BookResult[];
}

export default function CuratedShelves() {
  const { data: shelves, isLoading } = useQuery<CuratedShelf[]>({
    queryKey: ['curated-shelves'],
    queryFn: async () => {
      const res = await apiClient.get('/shelves');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000 // 5 mins
  });

  if (isLoading || !shelves || shelves.length === 0) return null;

  return (
    <div className="flex flex-col gap-12 mt-12 pt-8 border-t border-[var(--color-border)] animate-fade-in">
      {shelves.map((shelf) => (
        <div key={shelf.id}>
          <div className="flex flex-col mb-6">
            <div className="flex items-center gap-2">
              <Layers className="text-[var(--color-accent)]" size={20} />
              <h2 className="text-xl font-bold font-display">{shelf.title}</h2>
            </div>
            {shelf.description && (
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{shelf.description}</p>
            )}
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
            {shelf.books.map((book) => {
              if (!book) return null;
              return (
              <Link 
                key={book.id} 
                to={`/book/${book.slug}`}
                className="group flex flex-col shrink-0 w-32 md:w-40 hover:-translate-y-1 transition-transform"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] group-hover:border-[var(--color-accent)] mb-3 relative shadow-sm">
                  {book.coverUrl ? (
                    <img src={book.coverUrl.startsWith('http') ? book.coverUrl : `http://localhost:8080${book.coverUrl}`} alt={book.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full p-3 bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center text-center text-xs font-serif font-bold">
                      {book.title}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-[var(--color-accent)] transition-colors">
                  {book.title}
                </h3>
                {book.authors && book.authors.length > 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1">{book.authors[0].name}</p>
                )}
              </Link>
            )})}
          </div>
        </div>
      ))}
    </div>
  );
}
