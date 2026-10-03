import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/apiClient';
import { UserPlus, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface Author {
  id: string;
  name: string;
  slug: string;
  biography?: string;
  imageUrl?: string;
}

interface Props {
  query: string;
}

export default function AuthorSpotlightCard({ query }: Props) {
  const { data: authors } = useQuery<Author[]>({
    queryKey: ['authors-all'],
    queryFn: async () => {
      const res = await apiClient.get('/authors');
      return res.data.data;
    },
    staleTime: 60 * 60 * 1000 // 1 hour
  });

  if (!query || !authors) return null;

  const matchedAuthor = authors.find(a => a.name.toLowerCase() === query.toLowerCase().trim());
  
  if (!matchedAuthor) return null;

  const handleFollow = () => {
    toast.success(`You are now following ${matchedAuthor.name}`);
  };

  return (
    <div className="bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start animate-fade-in shadow-lg">
      <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-full overflow-hidden bg-[var(--color-bg-elevated)] border-2 border-[var(--color-border)] shadow-inner flex items-center justify-center text-4xl text-[var(--color-text-muted)] font-serif">
        {matchedAuthor.imageUrl ? (
          <img src={matchedAuthor.imageUrl} alt={matchedAuthor.name} className="w-full h-full object-cover" />
        ) : (
          matchedAuthor.name.charAt(0).toUpperCase()
        )}
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-2xl font-bold font-display mb-1 flex items-center justify-center md:justify-start gap-2">
          {matchedAuthor.name}
        </h2>
        
        {matchedAuthor.biography ? (
          <p className="text-[var(--color-text-muted)] text-sm mb-4 leading-relaxed line-clamp-3">
            {matchedAuthor.biography}
          </p>
        ) : (
          <p className="text-[var(--color-text-muted)] text-sm mb-4 italic">
            Acclaimed author of multiple bestselling books.
          </p>
        )}
        
        <div className="flex items-center justify-center md:justify-start gap-3">
          <button 
            onClick={handleFollow}
            className="btn btn-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            <UserPlus size={16} />
            Follow Author
          </button>
          
          <button className="btn btn-outline px-4 py-2 text-sm flex items-center gap-2">
            <BookOpen size={16} />
            View Bibliography
          </button>
        </div>
      </div>
    </div>
  );
}
