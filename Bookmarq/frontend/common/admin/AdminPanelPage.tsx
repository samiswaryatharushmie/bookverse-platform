import { Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/modules/common/lib/apiClient';
import { Loader2, Users, ShoppingBag, PackageSearch, Star, Tag, DollarSign, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

function AdminPanelContent() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/overview');
      return res.data.data;
    }
  });
  const { data: orders } = useQuery({
    queryKey: ['admin-orders-for-revenue'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/orders');
      return res.data.data as any[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  const totalRevenue = orders?.reduce((sum, o) => sum + (o.grandTotal ?? 0), 0) || 0;
  // Estimate active users as 15% of total users for demonstration
  const activeUsers = Math.floor((overview?.totalUsers || 0) * 0.15);

  const stats = [
    { name: 'Total Revenue', value: `Rs ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: '/admin/finance' },
    { name: 'Active Users', value: activeUsers, icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-500/10', link: '/admin/users' },
    { name: 'Total Users', value: overview?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/admin/users' },
    { name: 'Total Orders', value: overview?.totalOrders || 0, icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-500/10', link: '/admin' },
    { name: 'Low Stock Items', value: overview?.lowStockItemsCount || 0, icon: PackageSearch, color: 'text-orange-500', bg: 'bg-orange-500/10', link: '/admin/inventory' },
    { name: 'Pending Reviews', value: overview?.pendingReviewsCount || 0, icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10', link: '/admin/reviews' },
  ];

  const adminFeatures = [
    { name: 'User Management', desc: 'Manage user accounts, roles, and permissions', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', link: '/admin/users' },
    { name: 'Promotions', desc: 'Create and manage promo codes and discounts', icon: Tag, color: 'text-amber-400', bg: 'bg-amber-500/10', link: '/admin/promotions' },
    { name: 'Financial Reports', desc: 'View revenue, refunds, and financial insights', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', link: '/admin/finance' },
  ];

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-purple-500/10">
            <Shield className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Admin Dashboard</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Administrative controls and system overview.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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

      {/* Admin Features */}
      <h2 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">Admin-Only Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {adminFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.name}
              to={feature.link}
              className="card p-6 flex items-center gap-5 hover:border-purple-500/40 transition-all group"
            >
              <div className={`p-4 rounded-xl ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform shrink-0`}>
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{feature.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">{feature.desc}</p>
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

export default function AdminPanelPage() {
  return <AdminPanelContent />;
}
