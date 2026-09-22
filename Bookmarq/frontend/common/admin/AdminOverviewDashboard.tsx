import { useQuery } from '@tanstack/react-query';
import apiClient from '@/modules/common/lib/apiClient';
import { Loader2, Users, ShoppingBag, PackageSearch, Star } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/user/auth/context/AuthContext';

export default function AdminOverviewDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/overview`);
      return res.data.data;
    }
  });

  if (!isAdmin) {
    return <Navigate to="/admin/orders" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  const stats = [
    { name: 'Total Users', value: overview?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/admin/users' },
    { name: 'Total Orders', value: overview?.totalOrders || 0, icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-500/10', link: '/admin/orders' },
    { name: 'Low Stock Items', value: overview?.lowStockItemsCount || 0, icon: PackageSearch, color: 'text-orange-500', bg: 'bg-orange-500/10', link: '/admin/inventory' },
    { name: 'Pending Reviews', value: overview?.pendingReviewsCount || 0, icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10', link: '/admin/reviews' },
  ];

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Admin Overview</h1>
        <p className="text-[var(--color-text-muted)] mt-2">Welcome to the Bookmarq admin console.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} to={stat.link} className="card p-6 flex items-center gap-6 hover:border-[var(--color-accent)] transition-all group cursor-pointer">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{stat.name}</p>
                <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{stat.value}</p>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="card p-12 text-center border-dashed">
        <h2 className="text-xl font-bold mb-2">System is running smoothly</h2>
        <p className="text-[var(--color-text-muted)]">All micro-services are operational and responding within normal parameters.</p>
      </div>
    </div>
  );
}
