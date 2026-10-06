import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist, useRemoveFromWishlist } from './useWishlist';
import { useAuth } from '../auth/context/AuthContext';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { data: wishlist, isLoading } = useWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <Heart className="mx-auto h-12 w-12 text-[var(--color-text-muted)]" />
        <h2 className="mt-4 text-2xl font-bold">Sign in to view your wishlist</h2>
        <Link to="/login" className="btn btn-primary mt-6 inline-flex">Sign In</Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading wishlist...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl font-bold">My Wishlist</h1>

      {!wishlist?.items?.length ? (
        <div className="card p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-[var(--color-text-muted)]" />
          <h3 className="mt-4 text-lg font-semibold">Your wishlist is empty</h3>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Explore our catalog and find something you'd like to read.
          </p>
          <Link to="/books" className="btn btn-primary mt-6 inline-flex">Browse Books</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlist.items.map((item) => (
            <div key={item.id} className="card group flex flex-col p-4 relative">
              <button 
                onClick={() => removeFromWishlist(item.book.id)}
                className="absolute top-6 right-6 z-10 rounded-full bg-[var(--color-bg-elevated)] p-2 text-[var(--color-danger)] opacity-0 shadow-lg backdrop-blur-md transition-all hover:bg-[var(--color-danger)] hover:text-white group-hover:opacity-100"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              
              <Link to={`/books/${item.book.slug}`} className="flex-1">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[var(--color-bg-surface)]">
                  {item.book.coverUrl ? (
                    <img src={item.book.coverUrl} alt={item.book.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">No Cover</div>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-1">
                  <h3 className="line-clamp-1 font-semibold">{item.book.title}</h3>
                  <p className="line-clamp-1 text-sm text-[var(--color-text-muted)]">
                    {item.book.authors?.map((a: any) => a.name).join(', ')}
                  </p>
                  <p className="mt-2 font-medium text-[var(--color-accent)]">Rs {item.book.price?.toFixed(2)}</p>
                </div>
              </Link>

              <button className="btn btn-primary mt-4 flex w-full items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
