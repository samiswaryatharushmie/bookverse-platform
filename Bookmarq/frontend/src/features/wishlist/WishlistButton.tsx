import { Heart } from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from './useWishlist';
import { useNavigate } from 'react-router-dom';

export default function WishlistButton({ bookId, className = "" }: { bookId: string, className?: string }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: wishlist } = useWishlist();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  const isWishlisted = wishlist?.items?.some((item) => item.book?.id === bookId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation if wrapped in a link
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(bookId);
    } else {
      addToWishlist(bookId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`rounded-full p-2 transition-all backdrop-blur-md shadow-sm border border-[var(--color-border)] ${
        isWishlisted 
          ? 'bg-[var(--color-danger)] text-white border-[var(--color-danger)]' 
          : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-danger)]'
      } ${className}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
    </button>
  );
}
