import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { Book } from './CatalogPage';

export default function RelatedBooks({ categoryId, currentBookId }: { categoryId: string, currentBookId: string }) {
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['related-books', categoryId],
    queryFn: async () => {
      const res = await apiClient.get(`/books?categoryId=${categoryId}&size=5&active=true`);
      return res.data.data;
    }
  });

  if (isLoading || !pageData || pageData.content.length <= 1) {
    return null; // Don't show anything if loading or no other books in category
  }

  // Filter out the current book and take up to 4
  const relatedBooks = pageData.content.filter((b: Book) => b.id !== currentBookId).slice(0, 4);

  if (relatedBooks.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-[var(--color-border)]">
      <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {relatedBooks.map((book: Book) => (
          <Link key={book.id} to={`/book/${book.slug}`} className="group flex flex-col h-full">
            <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-[var(--color-bg-surface)] mb-4 border border-[var(--color-border)] group-hover:border-[var(--color-accent)] transition-colors relative">
              {book.coverUrl ? (
                <img src={book.coverUrl?.startsWith('http') ? book.coverUrl : `http://localhost:8080${book.coverUrl}`} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-[var(--color-text-muted)]">
                  <BookOpen className="h-10 w-10 opacity-20" />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1 leading-tight mb-1">
                {book.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-1 line-clamp-1">
                {book.authors?.map(a => a.name).join(', ')}
              </p>
              <div className="mt-auto pt-1 font-bold text-sm">
                Rs {book.price.toFixed(2)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
