import { Link } from 'react-router-dom';
import type { GenreFacet } from '../hooks/useCatalogData';
import { BookOpen, Compass, Sparkles, Rocket, Ghost, Heart, Search, Zap, Microscope, Trophy } from 'lucide-react';

interface Props {
  genres: GenreFacet[];
  currentGenres: string[];
}

const ICONS: Record<string, React.ElementType> = {
  'fiction': BookOpen,
  'science-fiction': Rocket,
  'fantasy': Sparkles,
  'mystery': Search,
  'thriller': Zap,
  'horror': Ghost,
  'romance': Heart,
  'science': Microscope,
  'history': Compass,
  'sports': Trophy
};

export default function GenreCarousel({ genres, currentGenres }: Props) {
  if (!genres || genres.length === 0) return null;

  // Show only top 10 genres to keep it clean
  const topGenres = genres.slice(0, 10);

  return (
    <div className="mb-8 overflow-hidden animate-fade-in">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Explore Categories</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
        {topGenres.map(genre => {
          const isSelected = currentGenres.includes(genre.slug);
          const Icon = ICONS[genre.slug] || Compass;
          
          return (
            <Link
              key={genre.id}
              to={isSelected ? '?' : `?genre=${genre.slug}`}
              className={`shrink-0 flex flex-col items-center justify-center p-4 rounded-xl w-28 h-28 border transition-all ${
                isSelected 
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] shadow-sm' 
                  : 'border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:shadow-md hover:-translate-y-1'
              }`}
            >
              <Icon size={28} className={isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'} />
              <span className="font-bold text-sm mt-3 text-center leading-tight line-clamp-2">{genre.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
