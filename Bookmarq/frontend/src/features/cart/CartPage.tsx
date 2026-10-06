import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import { Loader2, Trash2, ShoppingCart, ArrowRight, Bookmark, ArrowDown, TrendingDown, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

// ── Bulk Discount Tiers ──────────────────────────────────────────────────
function getBulkDiscount(quantity: number): { percent: number; label: string } {
  if (quantity >= 6) return { percent: 15, label: '15% Bulk Discount' };
  if (quantity >= 3) return { percent: 10, label: '10% Bulk Discount' };
  return { percent: 0, label: '' };
}

function getNextTierMessage(quantity: number): string {
  if (quantity < 3) return `Add ${3 - quantity} more for 10% off!`;
  if (quantity < 6) return `Add ${6 - quantity} more for 15% off!`;
  return '';
}

// ── Saved for Later helpers ──────────────────────────────────────────────
interface SavedItem {
  bookId: string;
  title: string;
  isbn: string;
  coverUrl: string;
  savedPrice: number;
  slug: string;
  savedAt: number;
}

function getSavedItems(): SavedItem[] {
  try {
    return JSON.parse(localStorage.getItem('saved_for_later') || '[]');
  } catch { return []; }
}

function saveSavedItems(items: SavedItem[]) {
  localStorage.setItem('saved_for_later', JSON.stringify(items));
}

export default function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<SavedItem[]>(getSavedItems());
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await apiClient.get(`/cart`);
      return res.data.data;
    }
  });

  // Fetch current prices for saved items to detect price drops
  useEffect(() => {
    if (savedItems.length === 0) return;
    const fetchPrices = async () => {
      const prices: Record<string, number> = {};
      for (const item of savedItems) {
        try {
          const res = await apiClient.get(`/books/${item.slug}`);
          prices[item.bookId] = res.data.data.price;
        } catch {
          // ignore failed fetches
        }
      }
      setCurrentPrices(prices);
    };
    fetchPrices();
  }, [savedItems.length]);

  const removeMutation = useMutation({
    mutationFn: async (bookId: string) => {
      await apiClient.delete(`/cart/items/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed');
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ bookId, quantity }: { bookId: string; quantity: number }) => {
      await apiClient.put(`/cart/items/${bookId}`, { bookId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => {
      toast.error('Failed to update quantity');
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async (bookId: string) => {
      await apiClient.post('/cart/items', { bookId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => {
      toast.error('Failed to add item to cart');
    }
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/cart`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    }
  });

  // Save for Later handler
  const handleSaveForLater = (item: any) => {
    const newSaved: SavedItem = {
      bookId: item.book.id,
      title: item.book.title,
      isbn: item.book.isbn,
      coverUrl: item.book.coverUrl,
      savedPrice: item.unitPrice || (item.total / item.quantity),
      slug: item.book.slug,
      savedAt: Date.now(),
    };
    const updated = [...savedItems.filter(s => s.bookId !== item.book.id), newSaved];
    setSavedItems(updated);
    saveSavedItems(updated);
    removeMutation.mutate(item.book.id);
    toast.success('Saved for later');
  };

  // Move back to cart
  const handleMoveToCart = (saved: SavedItem) => {
    addToCartMutation.mutate(saved.bookId);
    const updated = savedItems.filter(s => s.bookId !== saved.bookId);
    setSavedItems(updated);
    saveSavedItems(updated);
    toast.success('Moved to cart');
  };

  // Remove from saved
  const handleRemoveSaved = (bookId: string) => {
    const updated = savedItems.filter(s => s.bookId !== bookId);
    setSavedItems(updated);
    saveSavedItems(updated);
    toast.success('Removed from saved');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  const hasCartItems = cart && cart.items && cart.items.length > 0;

  // Calculate totals with bulk discounts
  let discountedSubtotal = 0;
  let totalBulkSavings = 0;
  if (hasCartItems) {
    cart.items.forEach((item: any) => {
      const discount = getBulkDiscount(item.quantity);
      const lineTotal = item.total;
      const savings = lineTotal * (discount.percent / 100);
      discountedSubtotal += lineTotal - savings;
      totalBulkSavings += savings;
    });
  }

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {!hasCartItems && savedItems.length === 0 ? (
        <div className="mx-auto max-w-3xl py-16 px-4 text-center animate-fade-in">
          <ShoppingCart className="h-16 w-16 mx-auto text-[var(--color-text-muted)] opacity-50 mb-6" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-[var(--color-text-muted)] mb-8">Looks like you haven't added any books to your cart yet.</p>
          <Link to="/books" className="btn btn-primary px-8">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            {/* Cart Items */}
            {hasCartItems && (
              <>
                <div className="card p-0 overflow-hidden">
                  <ul className="divide-y divide-[var(--color-border)]">
                    {cart.items.map((item: any) => {
                      const discount = getBulkDiscount(item.quantity);
                      const lineTotal = item.total;
                      const savings = lineTotal * (discount.percent / 100);
                      const discountedTotal = lineTotal - savings;
                      const nextTier = getNextTierMessage(item.quantity);

                      return (
                        <li key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-[var(--color-bg-primary)] transition-colors">
                          <div className="h-24 w-16 bg-[var(--color-bg-surface)] shrink-0 border border-[var(--color-border)] rounded overflow-hidden">
                            {item.book.coverUrl ? (
                              <img src={item.book.coverUrl?.startsWith('http') ? item.book.coverUrl : `http://localhost:8080${item.book.coverUrl}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                                <ShoppingCart className="h-6 w-6 opacity-20" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <Link to={`/book/${item.book.slug}`} className="font-semibold text-lg text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                                {item.book.title}
                              </Link>
                              <p className="text-sm text-[var(--color-text-muted)] mb-1">ISBN: {item.book.isbn}</p>
                              {/* Bulk discount badge */}
                              {discount.percent > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full animate-fade-in">
                                  <Tag className="h-3 w-3" /> {discount.label}
                                </span>
                              )}
                              {nextTier && (
                                <p className="text-xs text-[var(--color-accent)] mt-1 flex items-center gap-1">
                                  <TrendingDown className="h-3 w-3" /> {nextTier}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-4 sm:mt-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[var(--color-text-muted)]">Qty:</span>
                                <div className="flex items-center bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded overflow-hidden">
                                  <button
                                    onClick={() => updateQuantityMutation.mutate({ bookId: item.book.id, quantity: Math.max(1, item.quantity - 1) })}
                                    disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                                    className="px-2 py-1 hover:bg-[var(--color-bg-elevated)] transition-colors disabled:opacity-50"
                                  >
                                    -
                                  </button>
                                  <span className="font-medium px-3 py-1 border-x border-[var(--color-border)]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantityMutation.mutate({ bookId: item.book.id, quantity: item.quantity + 1 })}
                                    disabled={updateQuantityMutation.isPending}
                                    className="px-2 py-1 hover:bg-[var(--color-bg-elevated)] transition-colors disabled:opacity-50"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  {discount.percent > 0 ? (
                                    <>
                                      <span className="text-sm line-through text-[var(--color-text-muted)]">Rs {lineTotal.toFixed(2)}</span>
                                      <span className="font-bold text-green-400 ml-2">Rs {discountedTotal.toFixed(2)}</span>
                                    </>
                                  ) : (
                                    <span className="font-bold">Rs {lineTotal.toFixed(2)}</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleSaveForLater(item)}
                                  className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] p-2 transition-colors"
                                  aria-label="Save for later"
                                  title="Save for later"
                                >
                                  <Bookmark className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => removeMutation.mutate(item.book.id)}
                                  className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-2 transition-colors"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="mt-6 flex justify-between">
                   <button onClick={() => clearMutation.mutate()} className="text-sm text-[var(--color-danger)] hover:underline flex items-center gap-1">
                     <Trash2 className="h-4 w-4" /> Clear Cart
                   </button>
                   <Link to="/books" className="text-sm text-[var(--color-accent)] hover:underline">
                     Continue Shopping
                   </Link>
                </div>
              </>
            )}

            {/* Saved for Later Section */}
            {savedItems.length > 0 && (
              <div className={hasCartItems ? 'mt-10' : ''}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-[var(--color-accent)]" />
                  Saved for Later
                  <span className="text-sm font-normal text-[var(--color-text-muted)]">({savedItems.length} items)</span>
                </h2>
                <div className="space-y-3">
                  {savedItems.map((saved) => {
                    const currentPrice = currentPrices[saved.bookId];
                    const hasPriceDrop = currentPrice !== undefined && currentPrice < saved.savedPrice;
                    
                    return (
                      <div key={saved.bookId} className={`card p-4 flex flex-col sm:flex-row items-center gap-4 ${hasPriceDrop ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
                        <div className="h-16 w-12 bg-[var(--color-bg-surface)] shrink-0 border border-[var(--color-border)] rounded overflow-hidden">
                          {saved.coverUrl ? (
                            <img src={saved.coverUrl?.startsWith('http') ? saved.coverUrl : `http://localhost:8080${saved.coverUrl}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                              <ShoppingCart className="h-4 w-4 opacity-20" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--color-text-primary)] line-clamp-1">{saved.title}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">ISBN: {saved.isbn}</p>
                          {hasPriceDrop && (
                            <div className="flex items-center gap-2 mt-1 animate-fade-in">
                              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ArrowDown className="h-3 w-3" /> Price dropped!
                              </span>
                              <span className="text-xs line-through text-[var(--color-text-muted)]">Rs {saved.savedPrice.toFixed(2)}</span>
                              <span className="text-xs font-bold text-green-400">Rs {currentPrice.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMoveToCart(saved)}
                            className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                          >
                            <ShoppingCart className="h-3 w-3" /> Move to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveSaved(saved.bookId)}
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-2 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {hasCartItems && (
            <div className="lg:col-span-4">
              <div className="card sticky top-24">
                <h2 className="text-xl font-bold mb-6 border-b border-[var(--color-border)] pb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-[var(--color-text-muted)]">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span>Rs {cart.subtotal.toFixed(2)}</span>
                  </div>
                  {totalBulkSavings > 0 && (
                    <div className="flex justify-between text-green-400 animate-fade-in">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" /> Bulk Discount
                      </span>
                      <span>- Rs {totalBulkSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Tax</span>
                    <span>Rs {(discountedSubtotal * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Shipping</span>
                    <span>Rs 1200.00</span>
                  </div>
                  <div className="border-t border-[var(--color-border)] my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>Rs {(discountedSubtotal + (discountedSubtotal * 0.15) + 1200).toFixed(2)}</span>
                  </div>
                  {totalBulkSavings > 0 && (
                    <p className="text-xs text-green-400 text-center bg-green-500/5 rounded-lg py-2 border border-green-500/10">
                      🎉 You're saving Rs {totalBulkSavings.toFixed(2)} with bulk discounts!
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="btn btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                >
                  Checkout <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
