import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Book } from '@/modules/catalog/CatalogPage';
import WishlistButton from '@/modules/order/wishlist/WishlistButton';

interface BookCarouselProps {
  title: string;
  subtitle?: string;
  books: Book[];
  viewAllLink?: string;
}

export default function BookCarousel({ title, subtitle, books, viewAllLink }: BookCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isScrollingManually = useRef(false);

  const smoothScroll = (container: HTMLDivElement, distance: number, duration: number) => {
    isScrollingManually.current = true;
    const startScrollLeft = container.scrollLeft;
    const startTime = performance.now();
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.scrollLeft = startScrollLeft + (distance * easeOutQuart(progress));
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        isScrollingManually.current = false;
      }
    };
    requestAnimationFrame(animateScroll);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8;
      smoothScroll(current, direction === 'left' ? -scrollAmount : scrollAmount, 800);
    }
  };

  const displayBooks = books.length > 4 ? [...books, ...books] : books;

  useEffect(() => {
    let animationFrameId: number;
    const container = scrollContainerRef.current;
    if (!container || displayBooks.length <= 4) return;

    const autoScroll = () => {
      if (!isHovered && !isScrollingManually.current) {
        container.scrollLeft += 0.8;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, displayBooks.length]);

  if (books.length === 0) return null;

  return (
    <section className="bg-[var(--color-bg-primary)] py-6 overflow-hidden border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">{title}</h2>
            {subtitle && <p className="mt-2 text-[var(--color-text-muted)]">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link to={viewAllLink} className="hidden sm:flex text-[var(--color-accent)] hover:text-[var(--color-accent-soft)] transition-colors items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
        
      <div 
        className="relative group mx-auto max-w-[100vw]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setTimeout(() => setIsHovered(false), 1500)}
      >
        <button 
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-[var(--color-bg-elevated)] hover:scale-105"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-[var(--color-bg-elevated)] hover:scale-105"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 px-4 sm:px-6 lg:px-8 scrollbar-hide" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayBooks.map((book, index) => (
            <Link 
              key={`${book.id}-${index}`} 
              to={`/book/${book.slug}`} 
              className="group/card flex flex-col h-full shrink-0 w-32 sm:w-40 md:w-48 lg:w-52"
            >
              <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-black/20 mb-4 border border-white/5 group-hover/card:border-[var(--color-accent)] transition-all duration-300 relative group-hover/card:shadow-2xl group-hover/card:-translate-y-1">
                {book.coverUrl ? (
                  <img src={book.coverUrl?.startsWith('http') ? book.coverUrl : `http://localhost:8080${book.coverUrl}`} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-white/20">
                    <BookOpen className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10" onClick={(e) => e.preventDefault()}>
                  <WishlistButton bookId={book.id} />
                </div>
              </div>
              <div className="flex-1 flex flex-col px-1">
                <h3 className="font-bold text-[var(--color-text-primary)] group-hover/card:text-[var(--color-accent)] transition-colors line-clamp-2 leading-snug mb-1 text-sm sm:text-base">
                  {book.title}
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mb-2 line-clamp-1 uppercase tracking-wider font-semibold">
                  {book.authors?.map(a => a.name).join(', ') || (book as any).authorName}
                </p>
                <div className="mt-auto pt-1 flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text-primary)] text-xs sm:text-sm">Rs {book.price.toFixed(2)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {viewAllLink && (
        <div className="mt-4 flex sm:hidden justify-center px-4">
           <Link to={viewAllLink} className="text-[var(--color-accent)] hover:text-[var(--color-accent-soft)] transition-colors flex items-center gap-1 font-medium">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
