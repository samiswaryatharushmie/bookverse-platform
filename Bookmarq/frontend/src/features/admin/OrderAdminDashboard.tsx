import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import {
  Loader2, CreditCard, CheckCircle, Clock, Save, Undo2,
  ShoppingBag, PackageCheck, Warehouse, Package, Truck, Home, XCircle,
  Eye, EyeOff, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Delivery step definitions ─────────────────────────────────────────────
const DELIVERY_STEPS = [
  { key: 'ORDER_PLACED',        label: 'Order Placed',          icon: ShoppingBag  },
  { key: 'PACKING',             label: 'Order Packing',         icon: PackageCheck },
  { key: 'LEFT_WAREHOUSE',      label: 'Left Warehouse',        icon: Warehouse    },
  { key: 'HANDED_TO_COURIER',   label: 'Handed to Courier',     icon: Package      },
  { key: 'OUT_FOR_DELIVERY',    label: 'Out for Delivery',      icon: Truck        },
  { key: 'DELIVERED',           label: 'Delivered',             icon: Home         },
];

function getStepIndex(status: string) {
  return DELIVERY_STEPS.findIndex(s => s.key === status);
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'ORDER_PLACED':      return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case 'PACKING':           return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    case 'LEFT_WAREHOUSE':    return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
    case 'HANDED_TO_COURIER': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
    case 'OUT_FOR_DELIVERY':  return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    case 'DELIVERED':         return 'bg-green-500/20 text-green-400 border-green-500/40';
    case 'CANCELLED':         return 'bg-red-500/20 text-red-400 border-red-500/40';
    default:                  return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
  }
}

// ── Delivery Status Slider component ──────────────────────────────────────
function DeliveryStatusSlider({
  order,
  onUpdate,
  isLoading,
}: {
  order: any;
  onUpdate: (status: string) => void;
  isLoading: boolean;
}) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  
  // Sync if order status changes externally
  useEffect(() => {
    setSelectedStatus(order.status);
  }, [order.status]);

  const isCancelled = order.status === 'CANCELLED';
  const orderIdx = isCancelled ? -1 : getStepIndex(order.status);
  const currentIdx = isCancelled ? -1 : getStepIndex(selectedStatus);
  const hasChanges = selectedStatus !== order.status && !isCancelled;

  const handleUpdate = () => {
    if (hasChanges) {
      onUpdate(selectedStatus);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(order.status);
  };

  return (
    <div className="space-y-5">
      {/* Slider Track */}
      <div className="relative pt-2 pb-6">
        {/* Background track */}
        <div className="absolute top-[26px] left-[20px] right-[20px] h-1.5 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)]" />
        
        {/* Filled progress track */}
        {!isCancelled && currentIdx >= 0 && (
          <div
            className="absolute top-[26px] left-[20px] h-1.5 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${(currentIdx / (DELIVERY_STEPS.length - 1)) * (100 - (40 / (DELIVERY_STEPS.length)))}%`,
              background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-soft, var(--color-accent)))',
              boxShadow: '0 0 12px var(--color-accent)',
            }}
          />
        )}

        {/* Step nodes */}
        <div className="relative flex justify-between">
          {DELIVERY_STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = !isCancelled && i < currentIdx;
            const isCurrent = !isCancelled && i === currentIdx;
            const isOrderActual = !isCancelled && i === orderIdx;
            const canClick = !isCancelled && i > orderIdx && !isLoading;

            return (
              <div key={step.key} className="flex flex-col items-center gap-2 flex-1 group">
                <button
                  type="button"
                  disabled={!canClick}
                  onClick={() => canClick && setSelectedStatus(step.key)}
                  className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${
                    done
                      ? 'bg-[var(--color-accent)] border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/30'
                      : isCurrent
                      ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] ring-4 ring-[var(--color-accent)]/20 shadow-lg shadow-[var(--color-accent)]/20'
                      : isCancelled
                      ? 'bg-[var(--color-bg-surface)] border-[var(--color-border)] opacity-40'
                      : canClick
                      ? 'bg-[var(--color-bg-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]/10 hover:shadow-lg hover:shadow-[var(--color-accent)]/10 cursor-pointer'
                      : 'bg-[var(--color-bg-surface)] border-[var(--color-border)]'
                  }`}
                  title={canClick ? `Select: ${step.label}` : step.label}
                >
                  {done ? (
                    <CheckCircle className="h-5 w-5 text-black" />
                  ) : (
                    <Icon className={`h-4.5 w-4.5 ${
                      isCurrent ? 'text-[var(--color-accent)]'
                      : canClick ? 'text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)]'
                    } transition-colors`} />
                  )}
                  {/* Pulse animation on current unsaved selection */}
                  {isCurrent && hasChanges && (
                    <span className="absolute inset-0 rounded-full border-2 border-[var(--color-accent)] animate-ping opacity-20" />
                  )}
                </button>
                <div className="text-center">
                  <p className={`text-[10px] font-semibold leading-tight transition-colors ${
                    isCurrent ? 'text-[var(--color-accent)]'
                    : done ? 'text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-muted)]'
                  }`}>
                    {step.label}
                  </p>
                  {isOrderActual && (
                    <span className="inline-block mt-1 text-[8px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                      Current
                    </span>
                  )}
                  {isCurrent && hasChanges && (
                    <span className="inline-block mt-1 text-[8px] font-bold uppercase tracking-widest text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-full animate-fade-in">
                      Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {hasChanges && (
          <div className="flex-1 flex gap-3 animate-fade-in">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isLoading}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Update Status
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="btn btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <Undo2 className="h-4 w-4" /> Cancel
            </button>
          </div>
        )}

        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
          isCancelled
            ? 'border-red-500/40 bg-red-500/10 flex-1'
            : hasChanges 
              ? 'border-[var(--color-border)] hidden' 
              : 'border-[var(--color-border)] hover:border-red-500/40 flex-1'
        }`}>
          <XCircle className={`h-4 w-4 ${isCancelled ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`} />
          <span className={`text-sm font-medium flex-1 ${isCancelled ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
            {isCancelled ? 'Order Cancelled' : 'Cancel this order'}
          </span>
          {!isCancelled ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onUpdate('CANCELLED')}
              className="btn btn-secondary text-xs px-3 py-1 text-red-400 hover:border-red-500/50 hover:bg-red-500/10 flex items-center gap-1"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
              Cancel Order
            </button>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Current</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function OrderAdminDashboard() {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/orders');
      return res.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      apiClient.put(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Delivery status updated'); },
    onError:   () => toast.error('Failed to update status')
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: string }) =>
      apiClient.put(`/admin/orders/${id}/payment-status`, { paymentStatus }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Payment status updated'); },
    onError:   () => toast.error('Failed to update payment status')
  });

  const refundMutation = useMutation({
    mutationFn: async (id: string) => apiClient.put(`/admin/orders/${id}/refund`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order refunded successfully'); },
    onError:   (err: any) => toast.error(err.response?.data?.message || 'Failed to refund order')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/admin/orders/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order deleted successfully'); },
    onError:   (err: any) => toast.error(err.response?.data?.message || 'Failed to delete order')
  });

  const totalRevenue     = orders?.reduce((s: number, o: any) => o.paymentStatus === 'CONFIRMED' ? s + o.grandTotal : s, 0) ?? 0;
  const pendingPayments  = orders?.filter((o: any) => o.paymentStatus !== 'CONFIRMED').length ?? 0;
  const confirmedOrders  = orders?.filter((o: any) => o.paymentStatus === 'CONFIRMED').length ?? 0;
  const pendingReceipts  = orders?.filter((o: any) => o.paymentMethod === 'BANK_TRANSFER' && o.paymentReceiptUrl && o.paymentStatus !== 'CONFIRMED').length ?? 0;

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Order Management</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Manage order delivery status and confirm payments.</p>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Confirmed Revenue', value: `Rs ${totalRevenue.toFixed(2)}`, icon: CreditCard,   color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Pending Payments',  value: pendingPayments,                 icon: Clock,         color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Confirmed Orders',  value: confirmedOrders,                 icon: CheckCircle,   color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
          { label: 'Receipts to Verify',value: pendingReceipts,                 icon: ShoppingBag,   color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}><Icon className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
              <p className="text-xl font-bold text-[var(--color-text-primary)] mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Orders table ──────────────────────────────────────────────── */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] uppercase border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Order</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Delivery Status</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-accent)]" /></td></tr>
              ) : orders?.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-[var(--color-text-muted)]">No orders found</td></tr>
              ) : (
                orders?.map((order: any) => (
                  <>
                    {/* Main row */}
                    <tr key={order.id} className="hover:bg-[var(--color-bg-primary)] transition-colors">
                      <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge text-xs ${order.paymentMethod === 'CARD' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-purple-500/20 text-purple-400 border-purple-500/40'}`}>
                          {order.paymentMethod === 'CARD' ? 'Card' : 'Bank'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">Rs {order.grandTotal?.toFixed(2)}</td>

                      {/* Delivery status badge */}
                      <td className="px-6 py-4">
                        <span className={`badge flex items-center gap-1 w-fit ${statusBadgeClass(order.status)}`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Payment status toggle */}
                      <td className="px-6 py-4">
                        {order.paymentStatus === 'REFUNDED' ? (
                          <span className="badge bg-purple-500/20 text-purple-400 border-purple-500/40 flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" /> Refunded
                          </span>
                        ) : order.paymentStatus === 'CONFIRMED' ? (
                          <div className="flex items-center gap-2">
                            <span className="badge bg-green-500/20 text-green-400 border-green-500/40 flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" /> Confirmed
                            </span>
                            <div className="flex flex-col gap-1">
                              <button onClick={() => updatePaymentMutation.mutate({ id: order.id, paymentStatus: 'PENDING' })}
                                className="text-xs text-[var(--color-text-muted)] hover:text-orange-400 underline">
                                Undo
                              </button>
                              <button onClick={() => {
                                  if (window.confirm('Are you sure you want to refund this order?')) {
                                    refundMutation.mutate(order.id);
                                  }
                                }}
                                disabled={refundMutation.isPending}
                                className="text-xs text-[var(--color-text-muted)] hover:text-red-400 underline">
                                {refundMutation.isPending && refundMutation.variables === order.id ? 'Refunding...' : 'Refund'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {order.paymentReceiptUrl && (
                              <a
                                href={`http://localhost:8080${order.paymentReceiptUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[var(--color-accent)] underline block mb-1"
                              >
                                View Receipt
                              </a>
                            )}
                            <button
                              onClick={() => updatePaymentMutation.mutate({ id: order.id, paymentStatus: 'CONFIRMED' })}
                              disabled={updatePaymentMutation.isPending}
                              className="btn btn-secondary px-3 py-1 text-xs flex items-center gap-1.5 text-green-400 hover:border-green-500 hover:bg-green-500/10 whitespace-nowrap"
                            >
                              {updatePaymentMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />}
                              Confirm Payment
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Delivery step toggle */}
                          <button
                            onClick={() => setExpandedDelivery(expandedDelivery === order.id ? null : order.id)}
                            className={`btn px-2.5 py-1.5 text-xs flex items-center gap-1 ${expandedDelivery === order.id ? 'btn-primary' : 'btn-secondary'}`}
                          >
                            <Truck className="h-3 w-3" />
                            Update
                          </button>
                          {/* Items toggle */}
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="btn btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1"
                          >
                            {expandedOrder === order.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            Items
                          </button>
                          
                          {['COMPLETED', 'DELIVERED', 'REFUNDED', 'CANCELLED'].includes(order.status) && (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to permanently delete this order?')) {
                                  deleteMutation.mutate(order.id);
                                }
                              }}
                              disabled={deleteMutation.isPending && deleteMutation.variables === order.id}
                              className="btn btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1 text-red-500 hover:text-red-500 hover:border-red-500"
                              title="Delete Order"
                            >
                              {(deleteMutation.isPending && deleteMutation.variables === order.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Delivery step updater panel */}
                    {expandedDelivery === order.id && (
                      <tr key={`${order.id}-delivery`}>
                        <td colSpan={7} className="px-8 py-4 bg-[var(--color-bg-primary)]">
                          <div className="max-w-lg">
                            <h4 className="font-bold mb-4 text-sm flex items-center gap-2">
                              <Truck className="h-4 w-4 text-[var(--color-accent)]" />
                              Update Delivery Status — {order.orderNumber}
                            </h4>
                            <DeliveryStatusSlider
                              order={order}
                              onUpdate={(status) => updateStatusMutation.mutate({ id: order.id, status })}
                              isLoading={updateStatusMutation.isPending}
                            />
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Expanded items panel */}
                    {expandedOrder === order.id && (
                      <tr key={`${order.id}-items`}>
                        <td colSpan={7} className="px-8 py-4 bg-[var(--color-bg-primary)]">
                          <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-[var(--color-bg-surface)]">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs text-[var(--color-text-muted)] font-semibold uppercase">Book</th>
                                  <th className="px-4 py-2 text-left text-xs text-[var(--color-text-muted)] font-semibold uppercase">Qty</th>
                                  <th className="px-4 py-2 text-right text-xs text-[var(--color-text-muted)] font-semibold uppercase">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--color-border)]">
                                {order.items?.map((item: any) => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-2 font-medium">{item.book?.title}</td>
                                    <td className="px-4 py-2 text-[var(--color-text-muted)]">×{item.quantity}</td>
                                    <td className="px-4 py-2 text-right font-medium">Rs {item.total?.toFixed(2)}</td>
                                  </tr>
                                ))}
                                <tr className="bg-[var(--color-bg-surface)]">
                                  <td colSpan={2} className="px-4 py-2 text-right text-xs text-[var(--color-text-muted)]">Shipping Address:</td>
                                  <td className="px-4 py-2 text-right text-xs">{order.shippingAddressSnapshot}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
