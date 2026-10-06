import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Loader2, Package, Calendar, MapPin, CreditCard,
  CheckCircle, Clock, Download, FileText,
  ShoppingBag, PackageCheck, Truck, Warehouse, Home, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../lib/apiClient';

// ── Delivery step definitions ─────────────────────────────────────────────
const DELIVERY_STEPS: { key: string; label: string; icon: any; desc: string }[] = [
  { key: 'ORDER_PLACED',        label: 'Order Placed',          icon: ShoppingBag,  desc: 'Your order has been received.' },
  { key: 'PACKING',             label: 'Order Packing',         icon: PackageCheck, desc: 'Your books are being packed.' },
  { key: 'LEFT_WAREHOUSE',      label: 'Left Warehouse',        icon: Warehouse,    desc: 'Your package has left our warehouse.' },
  { key: 'HANDED_TO_COURIER',   label: 'Handed to Courier',     icon: Package,      desc: 'Package picked up by the courier.' },
  { key: 'OUT_FOR_DELIVERY',    label: 'Out for Delivery',      icon: Truck,        desc: 'Your package is on its way to you!' },
  { key: 'DELIVERED',           label: 'Delivered',             icon: Home,         desc: 'Package delivered successfully!' },
];

function getStepIndex(status: string) {
  const idx = DELIVERY_STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

// ── Colour helpers ────────────────────────────────────────────────────────
function orderStatusColor(status: string) {
  switch (status) {
    case 'ORDER_PLACED':        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case 'PACKING':             return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    case 'LEFT_WAREHOUSE':      return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
    case 'HANDED_TO_COURIER':   return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
    case 'OUT_FOR_DELIVERY':    return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    case 'DELIVERED':           return 'bg-green-500/20 text-green-400 border-green-500/40';
    case 'CANCELLED':           return 'bg-red-500/20 text-red-400 border-red-500/40';
    case 'PRE_ORDER_PENDING':   return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    case 'AWAITING_FULFILLMENT':return 'bg-teal-500/20 text-teal-400 border-teal-500/40';
    case 'BACKORDERED':         return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    default:                    return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
  }
}

// ── Invoice helpers ───────────────────────────────────────────────────────
function downloadInvoicePdf(order: any) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(232, 168, 56);
  doc.text('Bookmarq - Invoice', 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Order #: ${order.orderNumber}`, 14, 32);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 38);
  
  const address = order.shippingAddressSnapshot ?? '';
  doc.text(`Ship to: ${address}`, 14, 44, { maxWidth: 180 });

  const addressLines = doc.splitTextToSize(`Ship to: ${address}`, 180).length;
  const tableStartY = 44 + (addressLines * 5) + 5;

  const tableColumn = ["Book", "Qty", "Unit Price", "Total"];
  const tableRows = (order.items ?? []).map((i: any) => [
    i.book?.title,
    i.quantity,
    `Rs ${(i.unitPrice ?? 0).toFixed(2)}`,
    `Rs ${(i.total ?? 0).toFixed(2)}`
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: tableStartY,
    theme: 'grid',
    headStyles: { fillColor: [26, 26, 46] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.text(`Subtotal: Rs ${(order.subtotal ?? 0).toFixed(2)}`, 14, finalY);
  doc.text(`Tax (15%): Rs ${(order.taxTotal ?? 0).toFixed(2)}`, 14, finalY + 6);
  doc.text(`Shipping: Rs ${(order.shippingFee ?? 0).toFixed(2)}`, 14, finalY + 12);
  
  doc.setFontSize(13);
  doc.setTextColor(232, 168, 56);
  doc.text(`Grand Total: Rs ${(order.grandTotal ?? 0).toFixed(2)}`, 14, finalY + 22);

  doc.save(`invoice_${order.orderNumber}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════
export default function OrderHistoryPage() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => { const res = await apiClient.get('/orders'); return res.data.data; }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiClient.put(`/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  });

  // Re-buy: add all items from a past order back to cart
  const handleRebuy = async (order: any) => {
    let added = 0;
    let failed = 0;
    for (const item of (order.items || [])) {
      try {
        await apiClient.post('/cart/items', { bookId: item.book?.id, quantity: item.quantity });
        added++;
      } catch {
        failed++;
      }
    }
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    if (added > 0) toast.success(`${added} item${added > 1 ? 's' : ''} added to cart!`);
    if (failed > 0) toast.error(`${failed} item${failed > 1 ? 's' : ''} could not be added (may be out of stock).`);
  };

  if (isLoading) return (
    <div className="flex justify-center p-24">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
    </div>
  );

  if (!orders || orders.length === 0) return (
    <div className="mx-auto max-w-3xl py-16 px-4 text-center animate-fade-in">
      <Package className="h-16 w-16 mx-auto text-[var(--color-text-muted)] opacity-50 mb-6" />
      <h2 className="text-2xl font-bold mb-2">No orders found</h2>
      <p className="text-[var(--color-text-muted)] mb-8">You haven't placed any orders yet.</p>
      <Link to="/books" className="btn btn-primary px-8">Start Shopping</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>

      <div className="space-y-8">
        {orders.map((order: any) => {
          const isCancelled = order.status === 'CANCELLED';
          const currentStep = isCancelled ? -1 : getStepIndex(order.status);

          return (
            <div key={order.id} className="card p-0 overflow-hidden">

              {/* ── Order Header ──────────────────────────────────────── */}
              <div className="bg-[var(--color-bg-primary)] px-6 py-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                  <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.shippingAddressSnapshot?.split(',')[0]}
                    </span>
                    {order.paymentMethod && (
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {order.paymentMethod === 'CARD' ? 'Card Payment' : 'Bank Transfer'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className={`badge flex items-center gap-1 ${orderStatusColor(order.status)}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                    {order.paymentStatus === 'CONFIRMED' ? (
                      <span className="badge bg-green-500/20 text-green-400 border-green-500/40 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Payment Confirmed
                      </span>
                    ) : (
                      <span className="badge bg-orange-500/20 text-orange-400 border-orange-500/40 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Payment Pending
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-lg">Rs {order.grandTotal?.toFixed(2)}</span>
                </div>
              </div>

              {/* ── Payment pending notice ────────────────────────────── */}
              {order.paymentStatus !== 'CONFIRMED' && (
                <div className="px-6 py-3 bg-orange-500/5 border-b border-orange-500/20 flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-orange-400">
                    {order.paymentMethod === 'BANK_TRANSFER'
                      ? 'Your bank transfer is being verified. Once confirmed, your order will be processed.'
                      : 'Payment is being processed. Your order will be confirmed shortly.'}
                  </p>
                </div>
              )}

              {/* ── Pre-Order / Backorder Notice ──────────────────── */}
              {['PRE_ORDER_PENDING', 'AWAITING_FULFILLMENT', 'BACKORDERED'].includes(order.status) && (
                <div className="px-6 py-3 bg-cyan-500/5 border-b border-cyan-500/20 flex items-start gap-2">
                  <Clock className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-cyan-400">
                      {order.status === 'PRE_ORDER_PENDING' && '📖 Pre-Order — This book hasn\'t been released yet.'}
                      {order.status === 'AWAITING_FULFILLMENT' && '⏳ Awaiting Fulfillment — Your order will be processed once stock is available.'}
                      {order.status === 'BACKORDERED' && '📦 Backordered — This item is temporarily out of stock and has been backordered.'}
                    </p>
                    {order.estimatedDate && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Estimated availability: <strong>{new Date(order.estimatedDate).toLocaleDateString()}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Delivery Tracking Timeline ────────────────────────── */}
              <div className="px-6 py-5 border-b border-[var(--color-border)]">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-5 flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Delivery Tracking
                </h4>

                {isCancelled ? (
                  <div className="flex items-center gap-3 text-red-400">
                    <div className="w-9 h-9 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Order Cancelled</p>
                      <p className="text-xs text-[var(--color-text-muted)]">This order has been cancelled.</p>
                    </div>
                  </div>
                ) : (
                  /* Horizontal stepper */
                  <div className="relative">
                    {/* Progress line */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-[var(--color-border)]" />
                    <div
                      className="absolute top-4 left-4 h-0.5 bg-[var(--color-accent)] transition-all duration-700"
                      style={{ width: `${(currentStep / (DELIVERY_STEPS.length - 1)) * (100 - (8 / DELIVERY_STEPS.length))}%` }}
                    />

                    <div className="relative flex justify-between">
                      {DELIVERY_STEPS.map((s, i) => {
                        const Icon = s.icon;
                        const done    = i < currentStep;
                        const current = i === currentStep;
                        return (
                          <div key={s.key} className="flex flex-col items-center gap-2 flex-1">
                            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all z-10 shrink-0 ${
                              done    ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                              : current ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] ring-4 ring-[var(--color-accent)]/20'
                              : 'bg-[var(--color-bg-primary)] border-[var(--color-border)]'
                            }`}>
                              <Icon className={`h-4 w-4 ${done ? 'text-black' : current ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`} />
                            </div>
                            <div className="text-center hidden sm:block">
                              <p className={`text-[10px] font-semibold leading-tight ${current ? 'text-[var(--color-accent)]' : done ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                                {s.label}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Current step description */}
                    <div className="mt-4 text-center">
                      <p className="text-sm font-semibold text-[var(--color-accent)]">{DELIVERY_STEPS[currentStep]?.label}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{DELIVERY_STEPS[currentStep]?.desc}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Order Items ───────────────────────────────────────── */}
              <div className="p-6">
                <ul className="divide-y divide-[var(--color-border)]">
                  {order.items?.map((item: any) => (
                    <li key={item.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="font-medium">{item.book?.title}</div>
                        <div className="text-[var(--color-text-muted)] text-sm">×{item.quantity}</div>
                      </div>
                      <div className="font-medium">Rs {item.total?.toFixed(2)}</div>
                    </li>
                  ))}
                </ul>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-1 text-sm">
                  <div className="flex justify-between text-[var(--color-text-muted)]"><span>Subtotal</span><span>Rs {order.subtotal?.toFixed(2)}</span></div>
                  <div className="flex justify-between text-[var(--color-text-muted)]"><span>Tax (15%)</span><span>Rs {order.taxTotal?.toFixed(2)}</span></div>
                  <div className="flex justify-between text-[var(--color-text-muted)]"><span>Shipping</span><span>Rs {order.shippingFee?.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-[var(--color-border)]">
                    <span>Total</span><span>Rs {order.grandTotal?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  {/* Download receipt (only for bank transfer + confirmed payment) */}
                  {order.paymentMethod === 'BANK_TRANSFER' && order.paymentStatus === 'CONFIRMED' && (
                    <button
                      onClick={() => downloadInvoicePdf(order)}
                      className="btn btn-secondary flex items-center gap-2 text-sm"
                    >
                      <Download className="h-4 w-4" /> Download Receipt
                    </button>
                  )}

                  {/* Always show invoice download for card */}
                  {order.paymentMethod === 'CARD' && (
                    <button
                      onClick={() => downloadInvoicePdf(order)}
                      className="btn btn-secondary flex items-center gap-2 text-sm"
                    >
                      <FileText className="h-4 w-4" /> View Invoice
                    </button>
                  )}

                  {/* Cancel Order */}
                  {order.status === 'ORDER_PLACED' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this order?')) {
                          cancelOrderMutation.mutate(order.id);
                        }
                      }}
                      disabled={cancelOrderMutation.isPending}
                      className="btn btn-secondary flex items-center gap-2 text-sm text-red-500 hover:border-red-500 hover:bg-red-500/10"
                    >
                      {cancelOrderMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Order'}
                    </button>
                  )}

                  {/* Re-buy: Add All to Cart */}
                  <button
                    onClick={() => handleRebuy(order)}
                    className="btn btn-secondary flex items-center gap-2 text-sm text-[var(--color-accent)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
                  >
                    <RefreshCw className="h-4 w-4" /> Add All to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
