import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import {
  Loader2, CreditCard, Landmark, CheckCircle2,
  Upload, ArrowRight, ArrowLeft, Copy, Download, FileText, Timer, Gift
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AnimatedCardPayment from './AnimatedCardPayment';

// ── Bookstore bank details ────────────────────────────────────────────────
const BANK_DETAILS = {
  bankName:      'Bank of Ceylon',
  accountName:   'Bookmarq (Pvt) Ltd',
  accountNumber: '0123456789',
  branch:        'Colombo Fort Branch',
  swiftCode:     'BCEYLKLX',
};


type PaymentMethod = 'CARD' | 'BANK_TRANSFER';
type Step = 'address' | 'payment' | 'success';

// ── Helpers ───────────────────────────────────────────────────────────────
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied!`));
}

function downloadInvoicePdf(order: any, cart: any) {
  const items = order?.items ?? cart?.items ?? [];
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(232, 168, 56); // #e8a838
  doc.text('Bookmarq - Invoice', 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Order #: ${order?.orderNumber ?? 'N/A'}`, 14, 32);
  doc.text(`Date: ${order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`, 14, 38);
  
  // Handle multiline address
  const address = order?.shippingAddressSnapshot ?? '';
  doc.text(`Ship to: ${address}`, 14, 44, { maxWidth: 180 });

  const addressLines = doc.splitTextToSize(`Ship to: ${address}`, 180).length;
  const tableStartY = 44 + (addressLines * 5) + 5;

  const tableColumn = ["Book", "Qty", "Unit Price", "Total"];
  const tableRows = items.map((i: any) => [
    i.book?.title ?? i.title,
    i.quantity,
    `Rs ${(i.unitPrice ?? i.unitPriceSnapshot ?? 0).toFixed(2)}`,
    `Rs ${(i.total ?? (i.unitPriceSnapshot * i.quantity) ?? 0).toFixed(2)}`
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
  doc.text(`Subtotal: Rs ${(order?.subtotal ?? 0).toFixed(2)}`, 14, finalY);
  doc.text(`Tax (15%): Rs ${(order?.taxTotal ?? 0).toFixed(2)}`, 14, finalY + 6);
  doc.text(`Shipping: Rs ${(order?.shippingFee ?? 0).toFixed(2)}`, 14, finalY + 12);
  
  doc.setFontSize(13);
  doc.setTextColor(232, 168, 56);
  doc.text(`Grand Total: Rs ${(order?.grandTotal ?? 0).toFixed(2)}`, 14, finalY + 22);

  doc.save(`invoice_${order?.orderNumber ?? 'N/A'}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════
export default function CheckoutPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orderNumber]                         = useState('ORD-' + Date.now());
  const [step, setStep]                       = useState<Step>('address');
  const [paymentMethod, setPaymentMethod]     = useState<PaymentMethod>('BANK_TRANSFER');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes]                     = useState('');
  const [placedOrder, setPlacedOrder]         = useState<any>(null);
  const [receiptFile, setReceiptFile]         = useState<File | null>(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptUploaded, setReceiptUploaded]   = useState(false);

  // Gift wrapping
  const [isGift, setIsGift]                   = useState(false);
  const [giftMessage, setGiftMessage]         = useState('');

  // Stock reservation timer (10 minutes = 600 seconds)
  const [reservationSeconds, setReservationSeconds] = useState(600);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timerExpired, setTimerExpired]         = useState(false);

  // Promo code fields
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => { const res = await apiClient.get('/cart'); return res.data.data; }
  });

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Stock reservation countdown timer
  useEffect(() => {
    if (step === 'success') return;
    timerRef.current = setInterval(() => {
      setReservationSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerExpired(true);
          toast.error('Stock reservation expired. Items may no longer be available.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const timerMinutes = Math.floor(reservationSeconds / 60);
  const timerSecs = reservationSeconds % 60;

  const checkoutMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/orders/checkout', payload);
      return res.data.data;
    },
    onSuccess: (order, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setPlacedOrder(order);
      // For bank transfers, transition immediately
      if (variables.paymentMethod === 'BANK_TRANSFER') {
        setStep('success');
      }
    },
    onError: (err: any, variables: any) => {
      // For card payments the animated card UI handles the declined state visually.
      // Showing an extra toast would be confusing/redundant.
      if (variables?.paymentMethod !== 'CARD') {
        toast.error(err.response?.data?.message || 'Failed to place order. Items might be out of stock.');
      }
    }
  });

  const applyPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiClient.get(`/promotions/validate?code=${code}`);
      return res.data.data;
    },
    onSuccess: (discount) => {
      setDiscountPercentage(discount);
      setAppliedPromo(promoCode);
      toast.success(`Promo code applied! ${discount}% off`);
    },
    onError: (err: any) => {
      setDiscountPercentage(0);
      setAppliedPromo('');
      toast.error(err.response?.data?.message || 'Invalid or inactive promo code');
    }
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddressSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setShippingAddress(`${fd.get('line1')}, ${fd.get('city')}, ${fd.get('postalCode')}, ${fd.get('country')}`);
    const orderNotes = (fd.get('notes') as string) ?? '';
    const giftNote = isGift ? `[GIFT ORDER] Dedication: ${giftMessage}` : '';
    setNotes(giftNote ? `${giftNote}${orderNotes ? ' | ' + orderNotes : ''}` : orderNotes);
    setStep('payment');
  };

  // Build final notes including gift info
  const finalNotes = notes;

  const handleBankTransferOrder = () => {
    checkoutMutation.mutate({ shippingAddress, notes: finalNotes, paymentMethod: 'BANK_TRANSFER', orderNumber, promoCode: appliedPromo });
  };

  const handleAnimatedCardPay = (cardData: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (cardData.cvc === '999') {
        setTimeout(() => {
          toast.error('Payment declined by the issuing bank.');
          reject(new Error('Card Declined'));
        }, 500);
        return;
      }
      checkoutMutation.mutate(
        { shippingAddress, notes: finalNotes, paymentMethod: 'CARD', orderNumber, promoCode: appliedPromo },
        {
          onSuccess: () => {
            resolve();
            // Let the card animation play out for 3.5 seconds before transitioning
            setTimeout(() => setStep('success'), 3500);
          },
          onError: () => reject(new Error('Checkout failed'))
        }
      );
    });
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile || !placedOrder) return;
    setReceiptUploading(true);
    const fd = new FormData();
    fd.append('file', receiptFile);
    try {
      await apiClient.post(`/orders/${placedOrder.id}/payment-receipt`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setReceiptUploaded(true);
      toast.success('Payment receipt uploaded! Our team will verify shortly.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload receipt. Please try again.');
    } finally {
      setReceiptUploading(false);
    }
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (isLoading) return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" /></div>;
  if (step !== 'success' && !placedOrder && (!cart || !cart.items || cart.items.length === 0)) { navigate('/cart'); return null; }

  const subtotal = cart?.subtotal || 0;
  const discountTotal = subtotal * (discountPercentage / 100);
  const taxTotal = (subtotal - discountTotal) * 0.15;
  const shippingFee = 1200;
  const grandTotal = (subtotal - discountTotal + taxTotal + shippingFee).toFixed(2);

  // ── Stepper ───────────────────────────────────────────────────────────────
  const steps = ['Shipping', 'Payment', 'Confirmation'];
  const stepIdx = step === 'address' ? 0 : step === 'payment' ? 1 : 2;

  const isCardPayment = step === 'payment' && paymentMethod === 'CARD';

  return (
    <div className={`mx-auto ${isCardPayment ? 'max-w-5xl' : 'max-w-3xl'} transition-all duration-500 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in`}>
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>

      {/* ── Stock Reservation Timer ──────────────────────────────────── */}
      {step !== 'success' && (
        <div className={`flex items-center gap-2 mb-8 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
          timerExpired
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : reservationSeconds < 120
            ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 animate-pulse'
            : 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]'
        }`}>
          <Timer className="h-4 w-4" />
          {timerExpired ? (
            <span>⚠️ Reservation expired — stock is no longer held. Complete checkout quickly!</span>
          ) : (
            <span>
              ⏱ Stock reserved for <strong>{timerMinutes}:{timerSecs.toString().padStart(2, '0')}</strong>
            </span>
          )}
        </div>
      )}

      {/* ── Progress Stepper ────────────────────────────────────────── */}
      <div className="flex items-center mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 font-bold text-sm transition-all shrink-0 ${
              i < stepIdx ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-black'
              : i === stepIdx ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}>
              {i < stepIdx ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
            </div>
            <span className={`ml-2 text-sm font-medium ${i <= stepIdx ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-4 ${i < stepIdx ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`} />}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          STEP 1 — Shipping Address
      ══════════════════════════════════════════════════════════════ */}
      {step === 'address' && (
        <div className="card p-8">
          <h2 className="text-xl font-bold mb-6 pb-4 border-b border-[var(--color-border)]">Delivery Address</h2>
          <form onSubmit={handleAddressSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input name="line1" required className="input w-full" placeholder="123 Main St" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input name="city" required className="input w-full" placeholder="Colombo" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code *</label>
                <input name="postalCode" required className="input w-full" placeholder="00100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Country *</label>
                <input name="country" required defaultValue="Sri Lanka" className="input w-full" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Order Notes (Optional)</label>
                <textarea name="notes" className="input w-full min-h-[80px]" placeholder="Special delivery instructions..." />
              </div>
            </div>

            {/* ── Gift Wrapping Section ─────────────────────────── */}
            <div className="border-t border-[var(--color-border)] pt-5">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <Gift className={`h-5 w-5 ${isGift ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'} transition-colors`} />
                <div>
                  <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                    🎁 This is a gift
                  </span>
                  <p className="text-xs text-[var(--color-text-muted)]">Price will be hidden on the packing slip (Gift Receipt)</p>
                </div>
              </label>

              {isGift && (
                <div className="mt-4 ml-8 animate-fade-in">
                  <label className="block text-sm font-medium mb-1">Personalized Dedication</label>
                  <div className="relative">
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value.slice(0, 200))}
                      className="input w-full min-h-[100px]"
                      placeholder="Write a personal message for the recipient..."
                      maxLength={200}
                    />
                    <span className={`absolute bottom-2 right-3 text-xs ${giftMessage.length >= 180 ? 'text-orange-400' : 'text-[var(--color-text-muted)]'}`}>
                      {giftMessage.length}/200
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                    <Gift className="h-3 w-3" /> This message will be printed on a dedication card included with the order.
                  </p>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
              Continue to Payment <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 2 — Payment Method
      ══════════════════════════════════════════════════════════════ */}
      {step === 'payment' && (
        <div className="space-y-6">
          <button onClick={() => setStep('address')} className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Shipping
          </button>

          {/* Order summary mini */}
          <div className="card p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-muted)] text-sm">Subtotal</span>
              <span className="font-medium">Rs {subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Promo Code" 
                className="input flex-1 text-sm py-1.5"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                disabled={applyPromoMutation.isPending || !!appliedPromo}
              />
              {appliedPromo ? (
                <button 
                  onClick={() => {
                    setAppliedPromo('');
                    setPromoCode('');
                    setDiscountPercentage(0);
                  }}
                  className="btn btn-secondary py-1.5 px-3 text-sm"
                >
                  Remove
                </button>
              ) : (
                <button 
                  onClick={() => promoCode && applyPromoMutation.mutate(promoCode)}
                  disabled={!promoCode || applyPromoMutation.isPending}
                  className="btn btn-primary py-1.5 px-3 text-sm"
                >
                  {applyPromoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </button>
              )}
            </div>

            {discountPercentage > 0 && (
              <div className="flex justify-between items-center text-[var(--color-accent)]">
                <span className="text-sm">Discount ({discountPercentage}%)</span>
                <span className="font-medium">- Rs {discountTotal.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t border-[var(--color-border)] pt-3 mt-1">
              <span className="text-[var(--color-text-muted)] text-sm">Order Total</span>
              <span className="text-2xl font-bold text-[var(--color-accent)]">Rs {grandTotal}</span>
            </div>
          </div>

          {/* Method selector */}
          <div className="grid grid-cols-2 gap-4">
            {([
              { key: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Landmark, desc: 'Transfer via internet banking' },
              { key: 'CARD', label: 'Card Payment', icon: CreditCard, desc: 'Visa / MasterCard / Amex' },
            ] as const).map(({ key, label, icon: Icon, desc }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPaymentMethod(key)}
                className={`card p-5 flex flex-col items-center gap-3 text-center transition-all border-2 ${
                  paymentMethod === key
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                <Icon className={`h-8 w-8 ${paymentMethod === key ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`} />
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{desc}</p>
                </div>
                {paymentMethod === key && <CheckCircle2 className="h-5 w-5 text-[var(--color-accent)]" />}
              </button>
            ))}
          </div>

          {/* ── BANK TRANSFER section ──────────────────────────────── */}
          {paymentMethod === 'BANK_TRANSFER' && (
            <div className="card p-6 space-y-5">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Landmark className="h-5 w-5 text-[var(--color-accent)]" /> Bank Transfer Details
              </h3>

              {/* Bank detail rows */}
              <div className="rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)] overflow-hidden">
                {[
                  { label: 'Bank Name',       value: BANK_DETAILS.bankName },
                  { label: 'Account Name',    value: BANK_DETAILS.accountName },
                  { label: 'Account Number',  value: BANK_DETAILS.accountNumber },
                  { label: 'Branch',          value: BANK_DETAILS.branch },
                  { label: 'SWIFT Code',      value: BANK_DETAILS.swiftCode },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-surface)]">
                    <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[var(--color-text-primary)]">{value}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(value, label)}
                        className="p-1 rounded hover:bg-[var(--color-bg-elevated)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Remarks instruction */}
              <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-[var(--color-accent)] mb-1">⚠️ Important — Remarks / Reference</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  When making the transfer, please enter the following in the <strong className="text-[var(--color-text-primary)]">Remarks / Reference</strong> field:
                </p>
                <p className="mt-2 font-mono text-sm bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2">
                  {user?.firstName} {user?.lastName} — {orderNumber}
                </p>
              </div>

              <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  After completing the bank transfer, click <strong className="text-[var(--color-text-primary)]">Place Order</strong> and upload your payment receipt on the next screen. 
                  Your order will be processed once our team verifies the payment.
                </p>
              </div>

              <button
                onClick={handleBankTransferOrder}
                disabled={checkoutMutation.isPending}
                className="btn btn-primary w-full py-3 text-base"
              >
                {checkoutMutation.isPending
                  ? <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  : `Place Order — Rs ${grandTotal}`}
              </button>
            </div>
          )}

          {/* ── CARD PAYMENT section ───────────────────────────────── */}
          {paymentMethod === 'CARD' && (
            <div className="card p-0 overflow-hidden bg-[var(--color-bg-base)]">
               <AnimatedCardPayment onPay={handleAnimatedCardPay} amountStr={`Rs ${grandTotal}`} />
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 3 — Success / Confirmation
      ══════════════════════════════════════════════════════════════ */}
      {step === 'success' && placedOrder && (
        <div className="space-y-6">

          {/* ── CARD SUCCESS ──────────────────────────────────────────── */}
          {placedOrder.paymentMethod === 'CARD' && (
            <div className="card p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6 mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful! 🎉</h2>
              <p className="text-[var(--color-text-muted)] mb-1">Order <span className="font-bold text-[var(--color-text-primary)]">{placedOrder.orderNumber}</span> has been confirmed.</p>
              <p className="text-[var(--color-text-muted)] mb-8">Your card was charged <strong>Rs {placedOrder.grandTotal?.toFixed(2)}</strong>. A confirmation has been recorded.</p>

              {/* Invoice */}
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 text-left mb-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><FileText className="h-4 w-4" /> Invoice Summary</h3>
                <ul className="divide-y divide-[var(--color-border)] text-sm mb-4">
                  {placedOrder.items?.map((item: any) => (
                    <li key={item.id} className="flex justify-between py-2">
                      <span>{item.book?.title} <span className="text-[var(--color-text-muted)]">×{item.quantity}</span></span>
                      <span className="font-medium">Rs {item.total?.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-1 text-sm border-t border-[var(--color-border)] pt-3">
                  <div className="flex justify-between text-[var(--color-text-muted)]"><span>Subtotal</span><span>Rs {placedOrder.subtotal?.toFixed(2)}</span></div>
                  <div className="flex justify-between text-[var(--color-text-muted)]"><span>Tax (15%)</span><span>Rs {placedOrder.taxTotal?.toFixed(2)}</span></div>
                  <div className="flex justify-between text-[var(--color-text-muted)]"><span>Shipping</span><span>Rs {placedOrder.shippingFee?.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--color-border)]"><span>Total Charged</span><span className="text-[var(--color-accent)]">Rs {placedOrder.grandTotal?.toFixed(2)}</span></div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => downloadInvoicePdf(placedOrder, cart)}
                  className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download Invoice
                </button>
                <button onClick={() => navigate('/orders')} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                  <ArrowRight className="h-4 w-4" /> View My Orders
                </button>
              </div>
            </div>
          )}

          {/* ── BANK TRANSFER SUCCESS ─────────────────────────────────── */}
          {placedOrder.paymentMethod === 'BANK_TRANSFER' && (
            <div className="space-y-5">
              <div className="card p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-accent)]/20 mb-4 mx-auto">
                  <Landmark className="h-8 w-8 text-[var(--color-accent)]" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
                <p className="text-[var(--color-text-muted)] mb-1">
                  Your order number is <span className="font-bold text-[var(--color-accent)] text-lg">{placedOrder.orderNumber}</span>
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Please complete your bank transfer and upload the receipt below.
                </p>
              </div>

              {/* Bank details reminder */}
              <div className="card p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-[var(--color-accent)]" /> Transfer To
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    ['Bank', BANK_DETAILS.bankName],
                    ['Account Name', BANK_DETAILS.accountName],
                    ['Account Number', BANK_DETAILS.accountNumber],
                    ['Branch', BANK_DETAILS.branch],
                    ['Amount', `Rs ${placedOrder.grandTotal?.toFixed(2)}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                      <span className="text-[var(--color-text-muted)]">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold font-mono">{val}</span>
                        <button type="button" onClick={() => copyToClipboard(val, label)} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-xl p-3">
                  <p className="text-sm text-[var(--color-accent)] font-semibold mb-1">Remarks / Reference field:</p>
                  <p className="font-mono text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] px-3 py-2 rounded-lg border border-[var(--color-border)] flex items-center justify-between gap-2">
                    <span>{user?.firstName} {user?.lastName} — {placedOrder.orderNumber}</span>
                    <button type="button" onClick={() => copyToClipboard(`${user?.firstName} ${user?.lastName} — ${placedOrder.orderNumber}`, 'Remark')} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] shrink-0">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Please ensure the exact phrase above is used in the transfer remark.</p>
                </div>
              </div>

              {/* Receipt Upload */}
              <div className="card p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-[var(--color-accent)]" /> Upload Payment Receipt
                </h3>

                {receiptUploaded ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="font-semibold text-green-400">Receipt uploaded successfully!</p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Our team will verify your payment and confirm your order shortly.</p>
                  </div>
                ) : (
                  <>
                    <div
                      className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center hover:border-[var(--color-accent)]/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('receipt-upload')?.click()}
                    >
                      {receiptFile ? (
                        <div>
                          <FileText className="h-8 w-8 mx-auto text-[var(--color-accent)] mb-2" />
                          <p className="font-medium text-[var(--color-text-primary)]">{receiptFile.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">{(receiptFile.size / 1024).toFixed(0)} KB • Click to change</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-[var(--color-text-muted)] mb-2" />
                          <p className="font-medium text-[var(--color-text-primary)]">Click to upload receipt</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">JPEG, PNG, or PDF • Max 5MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="receipt-upload" type="file" className="hidden"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
                    />
                    <button
                      onClick={handleReceiptUpload}
                      disabled={!receiptFile || receiptUploading}
                      className="btn btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2"
                    >
                      {receiptUploading ? <><Loader2 className="h-5 w-5 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Submit Receipt</>}
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => navigate('/orders')} className="btn btn-secondary flex-1">View My Orders</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
