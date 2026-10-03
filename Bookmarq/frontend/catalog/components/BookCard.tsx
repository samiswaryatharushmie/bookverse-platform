import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '@/modules/common/lib/apiClient';
import { ShoppingCart, Star, Eye, BookOpen, AlertTriangle, Medal, Sparkles, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import WishlistButton from '@/modules/order/wishlist/WishlistButton';
import { BookResult } from '../hooks/useCatalogData';
import { useCompareTray } from '../hooks/useCompareTray';
import LibraryStatusDropdown from './LibraryStatusDropdown';

interface BookCardProps {
  book: BookResult;
  view: 'grid' | 'list';
  density: 'compact' | 'comfortable';
  scholarMode?: boolean;
  hasQuery?: boolean;
}

// Deterministic color from ISBN string
function getCoverColor(isbn: string) {
  if (!isbn) return 'var(--color-accent)';
  let hash = 0;
  for (let i = 0; i < isbn.length; i++) {
    hash = isbn.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 25%)`;
}

export default function BookCard({ book, view, density, scholarMode, hasQuery }: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const { isComparing, addToCompare, removeFromCompare, compareItems } = useCompareTray();
  
  // Phase 3: Edition Collapsing
  const [activeEditionId, setActiveEditionId] = useState<string>(book.id);
  const allEditions = book.otherEditions ? [book, ...book.otherEditions] : [book];
  const activeBook = allEditions.find(e => e.id === activeEditionId) || book;

  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await apiClient.post('/cart/items', { bookId: activeBook.id, quantity: 1 });
      toast.success(`Added "${activeBook.title}" to cart`);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please login to add to cart');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      }
    }
  };

  const coverFallbackStyle = {
    backgroundColor: getCoverColor(activeBook.isbn),
  };

  const hasDiscount = activeBook.originalPrice && activeBook.originalPrice > activeBook.price;
  const discountPercent = hasDiscount
    ? Math.round(((activeBook.originalPrice! - activeBook.price) / activeBook.originalPrice!) * 100)
    : 0;

  const isNew = new Date(activeBook.releaseDate || '') > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // ── Grid View ────────────────────────────────────────────────────────────
  if (view === 'grid') {
    return (
      <>
        <Link 
          to={`/book/${activeBook.slug}`} 
          className="group flex flex-col h-full animate-fade-in"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Cover & Badges */}
          <div className={`w-full rounded-lg overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] group-hover:border-[var(--color-accent)] transition-colors relative shadow-sm hover:shadow-md ${density === 'compact' ? 'aspect-[3/4] mb-2' : 'aspect-[2/3] mb-3'}`}>
            
            {activeBook.coverUrl ? (
              <img src={activeBook.coverUrl?.startsWith('http') ? activeBook.coverUrl : `http://localhost:8080${activeBook.coverUrl}`} alt={activeBook.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            ) : (
              <div style={coverFallbackStyle} className="w-full h-full p-4 flex flex-col justify-between text-white/90">
                <div className="font-serif text-sm md:text-base leading-tight font-bold line-clamp-4 shadow-sm">{activeBook.title}</div>
                <div className="text-xs font-medium uppercase tracking-wider opacity-80 line-clamp-2">{activeBook.authors?.map(a => a.name).join(', ')}</div>
              </div>
            )}

            {/* Badges Container */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
              {activeBook.preOrder && <span className="bg-[var(--color-accent)] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">Pre-Order</span>}
              {hasDiscount && <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">{discountPercent}% Off</span>}
              {isNew && <span className="bg-[var(--color-success)] text-[var(--color-bg-primary)] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">New</span>}
              {activeBook.signedEdition && <span className="bg-[var(--color-warning)] text-[var(--color-bg-primary)] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><Sparkles size={10}/> Signed</span>}
            </div>

            {/* Quick Actions overlay */}
            <div className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-end gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0 opacity-100'}`}>
              <button 
                onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur text-white p-1.5 rounded-full transition-colors hidden md:block"
                aria-label="Quick view"
              >
                <Eye size={16} />
              </button>
              
              <LibraryStatusDropdown bookId={activeBook.id} />
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (isComparing(activeBook.id)) {
                    removeFromCompare(activeBook.id);
                  } else {
                    if (compareItems.length >= 3) toast.error('Compare limit reached');
                    else addToCompare(activeBook);
                  }
                }}
                className={`backdrop-blur p-1.5 rounded-full transition-colors hidden md:block ${isComparing(activeBook.id) ? 'bg-[var(--color-accent)] text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                aria-label="Compare"
              >
                <Scale size={16} />
              </button>

              <div onClick={e => e.preventDefault()} className="ml-auto">
                <WishlistButton bookId={activeBook.id} />
              </div>
            </div>
            
            {/* Hover Blurb (Desktop only) */}
            <div className={`absolute inset-0 bg-[var(--color-bg-elevated)]/95 backdrop-blur-sm p-4 flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center text-center ${!isHovered && 'pointer-events-none'}`}>
              <p className="text-sm text-[var(--color-text-primary)] line-clamp-6 italic mb-4">
                "{activeBook.description || 'No description available for this title.'}"
              </p>
              <button onClick={handleAddToCart} className="btn btn-primary w-full py-2 text-sm flex items-center justify-center gap-2">
                <ShoppingCart size={16} /> Add to Cart
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col px-1">
            <h3 className={`font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-tight mb-1 ${density === 'compact' ? 'text-sm line-clamp-1' : 'line-clamp-2'}`}>
              {activeBook.title}
            </h3>
            
            {activeBook.seriesName && (
              <p className="text-[10px] font-medium text-[var(--color-accent)] uppercase tracking-wider mb-0.5 line-clamp-1 hover:underline">
                {activeBook.seriesName} {activeBook.seriesPosition ? `— Book ${activeBook.seriesPosition}${activeBook.seriesTotal ? ` of ${activeBook.seriesTotal}` : ''}` : ''}
              </p>
            )}

            <p className={`text-[var(--color-text-muted)] mb-1 line-clamp-1 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
              {activeBook.authors?.map((a: any) => a.name).join(', ')}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-1.5">
              <Star size={12} className="text-[var(--color-warning)] fill-[var(--color-warning)]" />
              <span className="text-xs font-medium">{activeBook.avgRating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs text-[var(--color-text-muted)]">({activeBook.ratingCount || 0})</span>
            </div>
            
            {scholarMode && hasQuery && (
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between items-center bg-[var(--color-info)]/10 px-1.5 py-0.5 rounded text-[10px] text-[var(--color-info)]">
                  <span>Lexical</span>
                  <span className="font-mono">{(book as any).bm25Score?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-[var(--color-success)]/10 px-1.5 py-0.5 rounded text-[10px] text-[var(--color-success)]">
                  <span>Semantic</span>
                  <span className="font-mono">{(book as any).semanticScore?.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div className="mt-auto pt-1 flex items-baseline gap-2 flex-wrap">
              <span className={`font-bold ${density === 'compact' ? 'text-sm' : 'text-base'}`}>
                LKR {activeBook.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[var(--color-text-muted)] line-through">
                  LKR {activeBook.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
            {activeBook.memberPrice && (
              <div className="text-[10px] font-bold text-[var(--color-accent)]">
                LKR {activeBook.memberPrice.toFixed(2)} with Member Card
              </div>
            )}
            


            {/* Mobile Add to Cart */}
            <button 
              onClick={handleAddToCart}
              className="md:hidden mt-3 btn border border-[var(--color-border)] text-xs py-1.5 w-full flex items-center justify-center gap-1 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <ShoppingCart size={14} /> Add
            </button>
          </div>
        </Link>

        {/* Quick View Modal Stub */}
        {showQuickView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowQuickView(false)}>
            <div className="bg-[var(--color-bg-elevated)] p-6 rounded-xl max-w-2xl w-full flex gap-6" onClick={e => e.stopPropagation()}>
              <div className="w-1/3 aspect-[2/3] rounded overflow-hidden">
                 {book.coverUrl ? (
                    <img src={book.coverUrl?.startsWith('http') ? book.coverUrl : `http://localhost:8080${book.coverUrl}`} alt={book.title} className="w-full h-full object-cover" />
                 ) : (
                    <div style={coverFallbackStyle} className="w-full h-full" />
                 )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
                <p className="text-[var(--color-text-muted)] mb-4">{book.authors?.map(a => a.name).join(', ')}</p>
                <div className="font-bold text-xl mb-4">LKR {book.price.toFixed(2)}</div>
                <p className="text-sm line-clamp-5 mb-6">{book.description}</p>
                <div className="flex gap-4">
                  <button onClick={handleAddToCart} className="btn btn-primary flex-1">Add to Cart</button>
                  <Link to={`/book/${book.slug}`} className="btn btn-secondary flex-1 text-center">View Details</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── List View ────────────────────────────────────────────────────────────
  return (
    <Link 
      to={`/book/${activeBook.slug}`} 
      className={`group flex items-start rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50 hover:border-[var(--color-accent)] transition-colors animate-fade-in ${density === 'compact' ? 'p-3 gap-4' : 'p-4 gap-6'}`}
    >
      <div className={`rounded relative flex-shrink-0 overflow-hidden shadow-sm ${density === 'compact' ? 'w-20 aspect-[2/3]' : 'w-28 aspect-[2/3]'}`}>
        {activeBook.coverUrl ? (
          <img src={activeBook.coverUrl?.startsWith('http') ? activeBook.coverUrl : `http://localhost:8080${activeBook.coverUrl}`} alt={activeBook.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div style={coverFallbackStyle} className="w-full h-full p-2 flex flex-col justify-between text-white/90">
            <div className="font-serif text-[10px] leading-tight font-bold line-clamp-3">{activeBook.title}</div>
          </div>
        )}
        <div className="absolute top-1 left-1 flex flex-col gap-0.5 items-start z-10">
          {hasDiscount && <span className="bg-[var(--color-danger)] text-white text-[8px] font-bold uppercase px-1 py-0.5 rounded shadow">{discountPercent}% Off</span>}
          {isNew && <span className="bg-[var(--color-success)] text-[var(--color-bg-primary)] text-[8px] font-bold uppercase px-1 py-0.5 rounded shadow">New</span>}
        </div>
      </div>
      
      <div className="flex-1 min-w-0 py-1 flex flex-col h-full">
        <div className="flex justify-between items-start gap-4">
          <div>
            {activeBook.seriesName && (
              <p className="text-xs font-medium text-[var(--color-accent)] uppercase tracking-wider mb-1 hover:underline">
                {activeBook.seriesName} {activeBook.seriesPosition ? `— Book ${activeBook.seriesPosition}${activeBook.seriesTotal ? ` of ${activeBook.seriesTotal}` : ''}` : ''}
              </p>
            )}
            <h3 className={`font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-tight mb-1 ${density === 'compact' ? 'text-base line-clamp-1' : 'text-lg line-clamp-2'}`}>
              {activeBook.title}
            </h3>
            <p className={`text-[var(--color-text-muted)] mb-2 ${density === 'compact' ? 'text-sm' : ''}`}>
              {activeBook.authors?.map((a: any) => a.name).join(', ')}
            </p>
            {activeBook.translator && (
              <p className="text-xs text-[var(--color-text-muted)] italic mb-2">
                Translated by {activeBook.translator} {activeBook.originalTitle && `(Original: ${activeBook.originalTitle})`}
              </p>
            )}
            <div className="flex items-center gap-1 mb-2">
              <Star size={14} className="text-[var(--color-warning)] fill-[var(--color-warning)]" />
              <span className="text-sm font-medium">{activeBook.avgRating?.toFixed(1) || '0.0'}</span>
              <span className="text-sm text-[var(--color-text-muted)]">({activeBook.ratingCount || 0} reviews)</span>
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col items-end gap-3">
            <div className="text-right">
              <div className={`font-bold text-[var(--color-accent)] ${density === 'compact' ? 'text-base' : 'text-xl'}`}>
                LKR {activeBook.price.toFixed(2)}
              </div>
              {hasDiscount && (
                <div className="text-xs text-[var(--color-text-muted)] line-through mt-0.5">
                  LKR {activeBook.originalPrice?.toFixed(2)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (isComparing(activeBook.id)) {
                    removeFromCompare(activeBook.id);
                  } else {
                    if (compareItems.length >= 3) toast.error('Compare limit reached');
                    else addToCompare(activeBook);
                  }
                }}
                className={`p-1.5 rounded transition-colors hidden sm:block ${isComparing(activeBook.id) ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)]'}`}
                title="Compare"
              >
                <Scale size={16} />
              </button>
              <div onClick={e => e.preventDefault()}>
                <WishlistButton bookId={activeBook.id} />
              </div>
              <button onClick={handleAddToCart} className="btn btn-primary px-3 py-1.5 text-sm flex items-center gap-1.5 hidden sm:flex">
                <ShoppingCart size={14} /> Add
              </button>
            </div>
          </div>
        </div>
        
        {activeBook.description && density !== 'compact' && (
          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mt-2 max-w-2xl">
            {activeBook.description}
          </p>
        )}
        
        {/* Rich Metadata Badges (Desktop) */}
        {density !== 'compact' && (
          <div className="mt-auto pt-3 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-3 hidden md:flex">
              {activeBook.pageCount && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <BookOpen size={12}/> {activeBook.pageCount} pages
                </span>
              )}
              {activeBook.ageRating && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] px-1.5 py-0.5 rounded">
                  Age {activeBook.ageRating}
                </span>
              )}
              {activeBook.contentWarning && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-1.5 py-0.5 rounded" title={activeBook.contentWarning}>
                  <AlertTriangle size={12}/> Content Warning
                </span>
              )}
            </div>
            

          </div>
        )}

        {/* Mobile Add to Cart */}
        <button onClick={handleAddToCart} className="sm:hidden mt-4 btn border border-[var(--color-border)] text-sm py-2 w-full flex items-center justify-center gap-2 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </Link>
  );
}
