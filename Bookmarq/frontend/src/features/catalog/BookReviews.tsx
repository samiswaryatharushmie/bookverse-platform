import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../auth/context/AuthContext';
import { Loader2, Star, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function BookReviews({ bookId }: { bookId: string }) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', bookId],
    queryFn: async () => {
      const res = await apiClient.get(`/reviews/${bookId}`);
      return res.data.data;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingReviewId) {
        await apiClient.put(`/reviews/edit/${editingReviewId}`, payload);
      } else {
        await apiClient.post(`/reviews/${bookId}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
      toast.success(editingReviewId ? 'Review updated!' : 'Review posted successfully!');
      setShowForm(false);
      setEditingReviewId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      await apiClient.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
      toast.success('Review deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submitMutation.mutate({
      rating: parseInt(formData.get('rating') as string, 10),
      title: formData.get('title'),
      body: formData.get('body')
    });
  };

  const startEdit = (review: any) => {
    setEditingReviewId(review.id);
    setShowForm(true);
    // Ideally we would populate the form here, but simple implementation is fine
    setTimeout(() => {
      const form = document.getElementById('review-form') as HTMLFormElement;
      if (form) {
        (form.elements.namedItem('rating') as HTMLSelectElement).value = review.rating;
        (form.elements.namedItem('title') as HTMLInputElement).value = review.title;
        (form.elements.namedItem('body') as HTMLTextAreaElement).value = review.body;
      }
    }, 0);
  };

  return (
    <div className="mt-16 border-t border-[var(--color-border)] pt-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        {isAuthenticated && !showForm && (
          <button onClick={() => { setEditingReviewId(null); setShowForm(true); }} className="btn btn-secondary mt-4 sm:mt-0">
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-8 bg-[var(--color-bg-primary)] p-6" id="review-form-container">
          <h3 className="font-bold text-lg mb-4">{editingReviewId ? 'Edit your review' : 'Write your review'}</h3>
          <form id="review-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <select name="rating" required className="input max-w-[150px]">
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" name="title" required className="input w-full" placeholder="Summarize your thoughts..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review</label>
              <textarea name="body" required className="input w-full min-h-[100px]" placeholder="What did you like or dislike?"></textarea>
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={submitMutation.isPending} className="btn btn-primary">
                {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingReviewId ? 'Update Review' : 'Submit Review')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingReviewId(null); }} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-center py-12 card bg-[var(--color-bg-primary)]">
          No reviews yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review: any) => (
            <div key={review.id} className="card p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1 text-[var(--color-accent)]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-[var(--color-border)]'}`} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  {review.verifiedPurchase && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle className="h-3 w-3" /> Verified Purchase
                    </span>
                  )}
                  <span className="text-xs text-[var(--color-text-muted)]">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <h4 className="font-bold mb-2">{review.title}</h4>
              <p className="text-sm text-[var(--color-text-primary)] mb-4">{review.body}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-[var(--color-text-muted)]">By {review.userName}</p>
                {user?.id === review.userId && (
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(review)} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors p-1" title="Edit Review">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => { if(confirm('Delete review?')) deleteMutation.mutate(review.id); }} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-1" title="Delete Review">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
