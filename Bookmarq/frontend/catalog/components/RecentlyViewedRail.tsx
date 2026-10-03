import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';

interface RecentBook {
  id: string;
  title: string;
  slug: string;
  coverUrl?: string;
  author?: string;
}

export default function RecentlyViewedRail() {
  const [recentBooks, setRecentBooks] = useState<RecentBook[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recently_viewed');
      if (stored) {
        setRecentBooks(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  if (recentBooks.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-[var(--color-border)] animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <History className="text-[var(--color-accent)]" size={20} />
        <h2 className="text-xl font-bold font-display">Recently Viewed</h2>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
        {recentBooks.map((book) => (
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
            {book.author && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1">{book.author}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
