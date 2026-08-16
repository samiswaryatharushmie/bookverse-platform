import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, PackageSearch, BookOpen, Star, Users, ArrowLeft, Shield, DollarSign, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();

  // All staff get access to these core features
  const navItems = [
    { name: 'Orders', path: '/admin', icon: ShoppingBag },
    { name: 'Inventory', path: '/admin/inventory', icon: PackageSearch },
    { name: 'Catalog', path: '/admin/catalog', icon: BookOpen },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Support', path: '/admin/support', icon: Users },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[var(--color-bg-base)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--color-bg-primary)] border-r border-[var(--color-border)] p-4 flex-shrink-0 flex flex-col h-auto md:min-h-screen">
        <div className="mb-6 hidden md:block">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
          <div className="mt-4 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-accent)]/10">
              <LayoutDashboard className="h-5 w-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[var(--color-text-primary)]">Staff Dashboard</h2>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal font-medium ${
                  isActive
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-[var(--color-accent)]' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Admin-Only Dashboards - only visible to admins */}
        {user?.roles?.includes('ROLE_ADMIN') && (
          <div className="hidden md:block mt-6 pt-4 border-t border-[var(--color-border)] space-y-2">
            <Link
              to="/admin/admin-panel"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium group ${
                location.pathname === '/admin/admin-panel' || location.pathname === '/admin/users' || location.pathname === '/admin/promotions'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  : 'text-[var(--color-text-muted)] hover:bg-purple-500/5 hover:text-purple-400 border border-transparent hover:border-purple-500/20'
              }`}
            >
              <Shield className={`h-5 w-5 ${location.pathname === '/admin/admin-panel' ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
              <span className="flex-1">Admin Dashboard</span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </Link>
            <Link
              to="/admin/finance"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium group ${
                location.pathname === '/admin/finance' || location.pathname === '/admin/reports'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-[var(--color-text-muted)] hover:bg-emerald-500/5 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20'
              }`}
            >
              <DollarSign className={`h-5 w-5 ${location.pathname === '/admin/finance' ? 'text-emerald-400' : 'group-hover:text-emerald-400'}`} />
              <span className="flex-1">Finance Dashboard</span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
