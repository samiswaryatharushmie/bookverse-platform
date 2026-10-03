import { Book } from '../CatalogPage';

interface BookCoverShowcaseProps {
  book: Book;
}

export default function BookCoverShowcase({ book }: BookCoverShowcaseProps) {
  return (
    <div className="relative w-full max-w-md mx-auto group perspective-1000">
      {/* Background ambient glow matching the cover (simulated with brass/white glow) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-accent)]/20 to-white/5 blur-3xl rounded-full scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* 3D Container */}
      <div className="relative aspect-[2/3] w-full preserve-3d hover-lift duration-500">
        
        {/* The Actual Cover */}
        <img
          src={book.coverUrl ? (book.coverUrl.startsWith('http') ? book.coverUrl : 'http://localhost:8080' + book.coverUrl) : 'https://via.placeholder.com/400x600?text=No+Cover'}
          alt={book.title}
          className="absolute inset-0 w-full h-full object-cover rounded-md shadow-2xl z-10"
        />
        
        {/* Book Spine (3D illusion) */}
        <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/60 to-transparent z-20 rounded-l-md pointer-events-none" />
        
        {/* Glass reflection on cover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent z-20 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Best Seller / Featured Badge */}
        {book.featured && (
          <div className="absolute -top-3 -right-3 z-30">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-accent)] blur-md opacity-50 rounded-full" />
              <div className="relative bg-[var(--color-bg-primary)] border border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                Featured
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Surface Reflection */}
      <div className="absolute -bottom-8 left-10 right-10 h-16 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent z-30 pointer-events-none" />
      <img
        src={book.coverUrl || 'https://via.placeholder.com/400x600?text=No+Cover'}
        alt=""
        className="absolute -bottom-4 left-0 w-full h-1/3 object-cover rounded-md opacity-20 blur-sm transform scale-y-[-1] z-0"
      />
    </div>
  );
}
