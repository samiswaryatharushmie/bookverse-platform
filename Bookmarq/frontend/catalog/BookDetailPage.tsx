import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/modules/common/lib/apiClient';
import { Book } from './CatalogPage';
import { ArrowLeft, BookOpen, Star, ShoppingCart, Info, CheckCircle2, BellRing, Mail, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

import BookReviews from '@/modules/marketing/BookReviews';
import WishlistButton from '@/modules/order/wishlist/WishlistButton';
import RelatedBooks from './RelatedBooks';
import BookCoverShowcase from './components/BookCoverShowcase';
import { useAuth } from '@/modules/user/auth/context/AuthContext';

export default function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activePrice, setActivePrice] = useState<number>(0);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');

  const { data: book, isLoading, isError } = useQuery<Book>({
    queryKey: ['book', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/books/${slug}`);
      return res.data.data;
    },
    retry: false
  });

  const { data: stockQuantity } = useQuery({
    queryKey: ['book-stock', book?.id],
    queryFn: async () => {
      if (!book?.id) return 0;
      const res = await apiClient.get(`/admin/inventory/${book.id}/stock`);
      return res.data.data;
    },
    enabled: !!book?.id
  });

  // Set initial price once book loads
  useEffect(() => {
    if (book && activePrice === 0) {
      setActivePrice(book.price);
    }
  }, [book, activePrice]);

  useEffect(() => {
    if (book) {
      const recentStr = localStorage.getItem('recently_viewed');
      let recent: any[] = recentStr ? JSON.parse(recentStr) : [];
      recent = recent.filter(b => b.id !== book.id);
      recent.unshift({ id: book.id, title: book.title, slug: book.slug, coverUrl: book.coverUrl, author: book.authors?.[0]?.name });
      localStorage.setItem('recently_viewed', JSON.stringify(recent.slice(0, 10)));
    }
  }, [book]);

  const handleAddToCart = async () => {
    if (!book) return;
    try {
      await apiClient.post('/cart/items', { bookId: book.id, quantity: 1 });
      toast.success('Added to cart!');
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

  const notifyMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!book) return;
      await apiClient.post('/restock-notifications', { bookId: book.id, email });
    },
    onSuccess: () => {
      toast.success(`We'll email you when "${book?.title}" is back in stock!`);
      setShowNotifyForm(false);
      setNotifyEmail('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  });

  const handleNotifyClick = () => {
    if (user?.email) {
      notifyMutation.mutate(user.email);
    } else {
      setShowNotifyForm(true);
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyEmail) {
      notifyMutation.mutate(notifyEmail);
    }
  };

  const handleShare = async () => {
    if (!book) return;
    const shareData = {
      title: book.title,
      text: `Check out ${book.title} on The Antiquarian!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-[var(--color-accent)] blur-xl opacity-20 rounded-full animate-pulse" />
          <BookOpen className="animate-spin text-[var(--color-accent)] relative z-10" size={48} />
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-panel p-10 max-w-md">
          <h2 className="text-2xl font-display text-gradient-brass mb-4">Tome Not Found</h2>
          <p className="text-[var(--color-text-muted)] mb-6">The archives hold no record of this text.</p>
          <button onClick={() => navigate('/#catalog-section')} className="btn-premium">Return to Catalog</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Actions */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/#catalog-section')}
            className="group flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-widest uppercase font-mono">Back to Archives</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors text-sm font-medium"
            title="Share this book"
          >
            <Share2 size={18} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Majestic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-20">
          
          {/* Left Column: Cover Showcase */}
          <div className="lg:col-span-5 relative z-10">
            <BookCoverShowcase book={book} />
          </div>

          {/* Right Column: Book Details */}
          <div className="lg:col-span-7 flex flex-col justify-center relative z-20">
            {/* Ambient background glow for text area */}
            <div className="absolute -inset-10 bg-gradient-to-br from-[var(--color-bg-elevated)] to-transparent opacity-50 blur-3xl pointer-events-none -z-10" />

            <div className="mb-6">
              {book.category && (
                <Link to={`/?category=${book.category.id}#catalog-section`} className="text-[var(--color-accent)] text-sm font-bold uppercase tracking-widest hover:text-[var(--color-accent-hover)] transition-colors">
                  {book.category.name}
                </Link>
              )}
              <h1 className="text-5xl lg:text-6xl font-display text-[var(--color-text-primary)] mt-3 mb-4 leading-tight">
                {book.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 text-lg text-[var(--color-text-muted)]">
                <span>Penned by</span>
                {book.authors?.map((author, idx) => (
                  <span key={author.id}>
                    <span className="text-[var(--color-accent-soft)] transition-all">
                      {author.name}
                    </span>
                    {idx < book.authors.length - 1 && " & "}
                  </span>
                ))}
              </div>
            </div>

            {/* Rating Summary */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1 bg-[var(--color-bg-surface)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                <Star className="fill-[var(--color-accent)] text-[var(--color-accent)]" size={16} />
                <span className="font-bold text-[var(--color-text-primary)]">{book.avgRating.toFixed(1)}</span>
                <span className="text-sm text-[var(--color-text-muted)] ml-1">({book.ratingCount} reviews)</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                {stockQuantity === undefined ? (
                  <span className="opacity-50">Checking stock...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} className={stockQuantity > 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"} />
                    {stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </>
                )}
              </div>
            </div>


            {/* Synopsis Panel */}
            <div className="glass-panel p-6 mb-8 text-[var(--color-text-muted)] leading-relaxed text-lg">
              <p>{book.description}</p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-4">
              {stockQuantity === 0 ? (
                <button
                  onClick={handleNotifyClick}
                  disabled={notifyMutation.isPending}
                  className="btn-premium flex-1 md:flex-none text-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] disabled:opacity-60"
                >
                  <BellRing size={20} />
                  {notifyMutation.isPending ? 'Submitting…' : 'Notify Me When Available'}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="btn-premium flex-1 md:flex-none text-lg"
                >
                  <ShoppingCart size={20} />
                  Add to Cart — LKR {activePrice.toFixed(2)}
                </button>
              )}

              <WishlistButton bookId={book.id} />

              <button className="btn-premium-outline hover-lift flex-1 md:flex-none">
                <BookOpen size={20} />
                Look Inside
              </button>
            </div>

            {/* Guest email capture for restock notifications */}
            {showNotifyForm && (
              <form
                onSubmit={handleNotifySubmit}
                className="glass-panel mt-4 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="email"
                    autoFocus
                    required
                    placeholder="you@example.com"
                    aria-label="Email for restock notification"
                    className="input w-full text-sm bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2.5"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={notifyMutation.isPending}
                  className="btn-premium text-sm px-5 py-2.5 disabled:opacity-60"
                >
                  {notifyMutation.isPending ? 'Submitting…' : 'Notify Me'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotifyForm(false)}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Cancel
                </button>
              </form>
            )}
            
            {/* Metadata Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--color-border)] grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-[var(--color-text-muted)]">
              <div>
                <span className="block font-bold text-[var(--color-text-primary)] mb-1">Published</span>
                {book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'Unknown'}
              </div>
              <div>
                <span className="block font-bold text-[var(--color-text-primary)] mb-1">Publisher</span>
                {book.publisher || 'Independent'}
              </div>
              <div>
                <span className="block font-bold text-[var(--color-text-primary)] mb-1">Pages</span>
                {book.pageCount}
              </div>
              <div>
                <span className="block font-bold text-[var(--color-text-primary)] mb-1">ISBN</span>
                {book.isbn}
              </div>
            </div>

          </div>
        </div>

        {/* Lower Section: Reviews & Related */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-24">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-display text-[var(--color-text-primary)] mb-8 flex items-center gap-3">
              Scholar Reviews
              <div className="h-px bg-[var(--color-border)] flex-grow ml-4"></div>
            </h2>
            <BookReviews bookId={book.id} />
          </div>
          
          <div className="lg:col-span-1 space-y-12">
            <div className="glass-panel p-6">
              <h3 className="text-xl font-display text-[var(--color-accent)] mb-6 flex items-center gap-2">
                <Info size={18} />
                About the Author
              </h3>
              {book.authors?.map(author => (
                <div key={author.id} className="mb-4 last:mb-0">
                  <span className="text-sm font-bold text-[var(--color-text-primary)] transition-colors inline-flex items-center gap-1 mb-1">
                    {author.name}
                  </span>
                  <p className="text-[var(--color-text-muted)] text-sm">No biography available in the archives.</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xl font-display text-[var(--color-text-primary)] mb-6">Related Tomes</h3>
              <RelatedBooks categoryId={book.category?.id || ''} currentBookId={book.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
