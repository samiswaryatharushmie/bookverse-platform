import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import {
  DollarSign, Loader2, TrendingUp, ShoppingBag,
  Download, BarChart3, Filter, CheckCircle, CreditCard, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

type DateRange = 'ALL_TIME' | 'LAST_30_DAYS' | 'LAST_7_DAYS';

function FinanceContent() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange>('ALL_TIME');
  const [activeTab, setActiveTab] = useState<'reports' | 'refunds'>('reports');

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['finance-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/orders');
      return res.data.data as any[];
    }
  });

  const refundMutation = useMutation({
    mutationFn: async (id: string) => apiClient.put(`/admin/orders/${id}/refund`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-orders'] });
      toast.success('Refund processed successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to process refund')
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const now = new Date().getTime();
    return orders.filter(o => {
      const orderDate = new Date(o.createdAt).getTime();
      if (dateRange === 'LAST_7_DAYS') return now - orderDate <= 7 * 24 * 60 * 60 * 1000;
      if (dateRange === 'LAST_30_DAYS') return now - orderDate <= 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  }, [orders, dateRange]);

  // Refund-eligible orders: confirmed payments that can be refunded
  const refundableOrders = orders?.filter((o: any) =>
    o.paymentStatus === 'CONFIRMED' && o.status === 'CANCELLED'
  ) ?? [];

  const refundedOrders = orders?.filter((o: any) => o.paymentStatus === 'REFUNDED') ?? [];

  // Stats
  const totalRevenue = filteredOrders.reduce((sum: number, o: any) => sum + (o.grandTotal ?? 0), 0);
  const confirmedRevenue = filteredOrders.reduce((sum: number, o: any) =>
    o.paymentStatus === 'CONFIRMED' ? sum + (o.grandTotal ?? 0) : sum, 0);
  const pendingRevenue = totalRevenue - confirmedRevenue;
  const refundedTotal = filteredOrders.reduce((sum: number, o: any) =>
    o.paymentStatus === 'REFUNDED' ? sum + (o.grandTotal ?? 0) : sum, 0);
    
  // Mock profit margin calculation (30% of revenue)
  const totalProfit = totalRevenue * 0.30;

  // Status counts
  const statusCounts: Record<string, number> = {};
  filteredOrders.forEach((o: any) => {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  });

  // Book frequency
  const bookFrequency: Record<string, { title: string; count: number; revenue: number }> = {};
  filteredOrders.forEach((o: any) => {
    o.items?.forEach((item: any) => {
      const key = item.book?.id;
      if (!key) return;
      if (!bookFrequency[key]) bookFrequency[key] = { title: item.book.title, count: 0, revenue: 0 };
      bookFrequency[key].count += item.quantity ?? 0;
      bookFrequency[key].revenue += item.total ?? 0;
    });
  });
  const topBooks = Object.values(bookFrequency).sort((a, b) => b.count - a.count).slice(0, 10);

  // Monthly breakdown
  const monthlyData: Record<string, { orders: number; revenue: number }> = {};
  filteredOrders.forEach((o: any) => {
    const month = new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!monthlyData[month]) monthlyData[month] = { orders: 0, revenue: 0 };
    monthlyData[month].orders += 1;
    monthlyData[month].revenue += o.grandTotal ?? 0;
  });
  const months = Object.entries(monthlyData).slice(-6);
  const maxMonthRevenue = Math.max(...months.map(([, d]) => d.revenue), 1);

  // Export CSV
  const handleExport = () => {
    if (filteredOrders.length === 0) return;
    const rows = [
      ['Order Number', 'Date', 'Status', 'Payment Status', 'Subtotal', 'Tax', 'Shipping', 'Grand Total'],
      ...filteredOrders.map((o: any) => [
        o.orderNumber, new Date(o.createdAt).toLocaleDateString(), o.status, o.paymentStatus,
        o.subtotal?.toFixed(2), o.taxTotal?.toFixed(2), o.shippingFee?.toFixed(2), o.grandTotal?.toFixed(2)
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarq-financial-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10">
            <DollarSign className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Finance Dashboard</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Financial reports, revenue analytics, and refund management.</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] border border-transparent'
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Financial Reports
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'refunds'
              ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] border border-transparent'
          }`}
        >
          <RefreshCw className="h-4 w-4" /> Refund Requests
          {refundableOrders.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {refundableOrders.length}
            </span>
          )}
        </button>
      </div>

      {ordersLoading ? (
        <div className="flex justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
        </div>
      ) : activeTab === 'reports' ? (
        <>
          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg px-3 py-1">
              <Filter className="h-4 w-4 text-[var(--color-text-muted)]" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="bg-transparent border-none text-sm outline-none cursor-pointer py-1"
              >
                <option value="ALL_TIME">All Time</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
              </select>
            </div>
            <button onClick={handleExport} disabled={filteredOrders.length === 0} className="btn btn-secondary px-4 py-2 shrink-0 flex items-center gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Revenue', value: `Rs ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Total Profit (Est)', value: `Rs ${totalProfit.toFixed(2)}`, icon: TrendingUp, color: 'text-[var(--color-accent)]', bg: 'bg-[var(--color-accent)]/10' },
              { label: 'Total Orders', value: filteredOrders.length, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Confirmed Revenue', value: `Rs ${confirmedRevenue.toFixed(2)}`, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Pending Revenue', value: `Rs ${pendingRevenue.toFixed(2)}`, icon: Loader2, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { label: 'Refunded Total', value: `Rs ${refundedTotal.toFixed(2)}`, icon: RefreshCw, color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card p-6 flex items-center gap-5">
                <div className={`p-4 rounded-xl ${bg} ${color} shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Monthly Revenue Chart */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[var(--color-accent)]" />
                Monthly Revenue (Last 6 Months)
              </h2>
              {months.length === 0 ? (
                <p className="text-[var(--color-text-muted)] text-center py-8">No data available yet.</p>
              ) : (
                <div className="flex items-end gap-4 h-48">
                  {months.map(([month, data]) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-text-muted)]">
                        {data.revenue > 0 ? `Rs ${(data.revenue / 1000).toFixed(1)}k` : '0'}
                      </span>
                      <div className="w-full rounded-t-lg bg-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/60 transition-colors relative overflow-hidden"
                        style={{ height: `${(data.revenue / maxMonthRevenue) * 160 + 4}px` }}>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[var(--color-accent)] to-[var(--color-accent-soft)] rounded-t-lg" style={{ height: '100%' }} />
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)] text-center leading-tight">{month}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Status Breakdown */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-6">Order Status Breakdown</h2>
              <div className="space-y-3">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const pct = filteredOrders.length ? Math.round((count / filteredOrders.length) * 100) : 0;
                  const barColor = status === 'DELIVERED' ? 'bg-green-500' : status === 'CANCELLED' ? 'bg-red-500' : status === 'ORDER_PLACED' ? 'bg-blue-500' : 'bg-purple-500';
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[var(--color-text-primary)]">{status.replace(/_/g, ' ')}</span>
                        <span className="text-[var(--color-text-muted)]">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--color-bg-surface)] overflow-hidden">
                        <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(statusCounts).length === 0 && (
                  <p className="text-[var(--color-text-muted)] text-center py-8">No order data available.</p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--color-border)] grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase mb-1">Pending Payments</p>
                  <p className="text-lg font-bold text-orange-400">Rs {pendingRevenue.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase mb-1">Confirmed Revenue</p>
                  <p className="text-lg font-bold text-green-400">Rs {confirmedRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Books Table */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="font-bold text-lg">Top Selling Books</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] uppercase border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-3 font-semibold">#</th>
                    <th className="px-6 py-3 font-semibold">Book Title</th>
                    <th className="px-6 py-3 font-semibold">Units Sold</th>
                    <th className="px-6 py-3 font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {topBooks.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-[var(--color-text-muted)]">No sales data yet.</td></tr>
                  ) : (
                    topBooks.map((book, idx) => (
                      <tr key={book.title} className="hover:bg-[var(--color-bg-primary)] transition-colors">
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-[var(--color-text-muted)]'}`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{book.title}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-[var(--color-accent)]">{book.count}</span>
                          <span className="text-[var(--color-text-muted)] text-xs ml-1">units</span>
                        </td>
                        <td className="px-6 py-4 font-bold">Rs {book.revenue.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Refund Requests Tab */
        <div className="space-y-6">
          {/* Refund Pending */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-400" /> Pending Refund Requests
              {refundableOrders.length > 0 && (
                <span className="text-sm font-medium text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                  {refundableOrders.length} pending
                </span>
              )}
            </h2>
            {refundableOrders.length === 0 ? (
              <div className="card p-12 text-center text-[var(--color-text-muted)]">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                <p>No pending refund requests. All caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {refundableOrders.map((order: any) => (
                  <div key={order.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-orange-500">
                    <div>
                      <h3 className="font-bold">{order.orderNumber}</h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.paymentMethod === 'CARD' ? 'Card' : 'Bank Transfer'}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {order.items?.length} items • Status: <span className="text-red-400">{order.status.replace(/_/g, ' ')}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-[var(--color-text-primary)]">Rs {order.grandTotal?.toFixed(2)}</span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Approve refund of Rs ${order.grandTotal?.toFixed(2)} for ${order.orderNumber}?`)) {
                            refundMutation.mutate(order.id);
                          }
                        }}
                        disabled={refundMutation.isPending}
                        className="btn bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border-green-500/50 px-4 py-2 flex items-center gap-2"
                      >
                        {refundMutation.isPending && refundMutation.variables === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Approve Refund
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Refunds */}
          {refundedOrders.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-purple-400" /> Completed Refunds
              </h2>
              <div className="card overflow-hidden p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] uppercase border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Order</th>
                      <th className="px-6 py-3 font-semibold">Date</th>
                      <th className="px-6 py-3 font-semibold">Method</th>
                      <th className="px-6 py-3 font-semibold">Amount</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {refundedOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-[var(--color-bg-primary)] transition-colors">
                        <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)]">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className="badge text-xs bg-purple-500/20 text-purple-400 border-purple-500/40">
                            {order.paymentMethod === 'CARD' ? 'Card' : 'Bank'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold">Rs {order.grandTotal?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="badge bg-purple-500/20 text-purple-400 border-purple-500/40 flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" /> Refunded
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FinanceDashboard() {
  return <FinanceContent />;
}
