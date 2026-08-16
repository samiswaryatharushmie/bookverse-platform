import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import RootLayout from './RootLayout';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import HomePage from '../features/home/HomePage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import { AuthProvider } from '../features/auth/context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import ProfilePage from '../features/profile/ProfilePage';
import UserListPage from '../features/admin/UserListPage';
import CatalogPage from '../features/catalog/CatalogPage';
import BookDetailPage from '../features/catalog/BookDetailPage';
import ErrorBoundary from '../components/ErrorBoundary';
import AdminLayout from './AdminLayout';
import CatalogDashboard from '../features/admin/CatalogDashboard';
import InventoryDashboard from '../features/admin/InventoryDashboard';
import OrderAdminDashboard from '../features/admin/OrderAdminDashboard';
import ReviewAdminDashboard from '../features/admin/ReviewAdminDashboard';
import ScrollToTop from '../components/ScrollToTop';

import CartPage from '../features/cart/CartPage';
import CheckoutPage from '../features/order/CheckoutPage';
import OrderHistoryPage from '../features/order/OrderHistoryPage';
import WishlistPage from '../features/wishlist/WishlistPage';
import SupportPage from '../features/support/SupportPage';
import MyTicketsPage from '../features/support/MyTicketsPage';
import SupportDashboard from '../features/admin/SupportDashboard';
import ReportsDashboard from '../features/admin/ReportsDashboard';
import AdminPromotions from '../features/admin/AdminPromotions';
import AdminPanelPage from '../features/admin/AdminPanelPage';
import FinanceDashboard from '../features/admin/FinanceDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Root application component.
 * Provides routing, query client, and toast notifications.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Fixed animated background — rendered via portal directly into document.body */}
      <AnimatedBackground />
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              
              {/* Catalog Routes */}
              <Route path="books" element={<ErrorBoundary><CatalogPage /></ErrorBoundary>} />
              <Route path="book/:slug" element={<ErrorBoundary><BookDetailPage /></ErrorBoundary>} />
              <Route path="support" element={<SupportPage />} />
              
              {/* Protected Routes */}
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile/tickets"
                element={
                  <ProtectedRoute>
                    <MyTicketsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                {/* Staff Dashboard - Orders is the index */}
                <Route index element={<OrderAdminDashboard />} />
                <Route path="catalog" element={<CatalogDashboard />} />
                <Route path="inventory" element={<InventoryDashboard />} />
                <Route path="reviews" element={<ReviewAdminDashboard />} />
                <Route path="support" element={<SupportDashboard />} />
                
                {/* Password-Locked Admin Panel */}
                <Route path="admin-panel" element={<AdminPanelPage />} />
                <Route path="users" element={<UserListPage />} />
                <Route path="promotions" element={<AdminPromotions />} />
                
                {/* Password-Locked Finance Dashboard */}
                <Route path="finance" element={<FinanceDashboard />} />
                <Route path="reports" element={<ReportsDashboard />} />
              </Route>
              <Route
                path="cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--color-bg-elevated)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-danger)',
              secondary: 'var(--color-bg-elevated)',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
