import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';

export interface WishlistItem {
  id: string;
  book: any; // We can type this properly later with Book type
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: string;
}

import { useAuth } from '../auth/context/AuthContext';

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await apiClient.get('/wishlists');
      return response.data.data as Wishlist;
    },
    enabled: isAuthenticated,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const response = await apiClient.post(`/wishlists/items/${bookId}`);
      return response.data.data as Wishlist;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['wishlist'], data);
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const response = await apiClient.delete(`/wishlists/items/${bookId}`);
      return response.data.data as Wishlist;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['wishlist'], data);
    },
  });
}
