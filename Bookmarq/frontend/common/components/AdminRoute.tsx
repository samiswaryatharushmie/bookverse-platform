import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/user/auth/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasAccess = user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_STAFF');

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
