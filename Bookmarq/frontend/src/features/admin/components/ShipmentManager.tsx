import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../../lib/apiClient';
import { Book } from '../../catalog/CatalogPage';
import { Supplier } from './SupplierManager';
import { Loader2, Plus, X, PackageCheck } from 'lucide-react';

interface ShipmentItem {
  id: string;
  bookId: string;
  bookTitle: string;
  quantityExpected: number;
  quantityReceived: number | null;
}

interface Shipment {
  id: string;
  supplierId: string;
  supplierName: string;
  status: string;
  trackingNumber?: string;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
  items: ShipmentItem[];
}

const statusColor = (status: string) => {
  switch (status) {
    case 'RECEIVED': return 'bg-green-500/10 text-green-500';
    case 'CANCELLED': return 'bg-red-500/10 text-red-500';
    default: return 'bg-amber-500/10 text-amber-500';
  }
};

export default function ShipmentManager() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [receiveShipment, setReceiveShipment] = useState<Shipment | null>(null);
  const [supplierId, setSupplierId] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [lines, setLines] = useState<{ bookId: string; quantityExpected: number }[]>([{ bookId: '', quantityExpected: 1 }]);
  const [receiveQty, setReceiveQty] = useState<Record<string, number>>({});

  const { data: shipments = [], isLoading } = useQuery<Shipment[]>({
    queryKey: ['admin-shipments'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/shipments');
      return res.data.data;
    }
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['admin-suppliers'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/suppliers');
      return res.data.data;
    }
  });

  const { data: bookPage } = useQuery({
    queryKey: ['all-books-for-shipments'],
    queryFn: async () => {
      const res = await apiClient.get('/books?size=1000');
      return res.data.data;
    }
  });
  const allBooks: Book[] = bookPage?.content || [];

  const createMutation = useMutation({
    mutationFn: async (payload: any) => { await apiClient.post('/admin/shipments', payload); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
      toast.success('Shipment created');
      setCreateOpen(false);
      setSupplierId('');
      setTrackingNumber('');
      setLines([{ bookId: '', quantityExpected: 1 }]);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create shipment')
  });

  const receiveMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => { await apiClient.put(`/admin/shipments/${id}/receive`, payload); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] });
      toast.success('Shipment received — inventory updated');
      setReceiveShipment(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to receive shipment')
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const items = lines.filter(l => l.bookId && l.quantityExpected > 0);
    if (!supplierId || items.length === 0) {
      toast.error('Select a supplier and at least one book line');
      return;
    }
    createMutation.mutate({ supplierId, trackingNumber: trackingNumber || undefined, items });
  };

  const openReceive = (shipment: Shipment) => {
    const initial: Record<string, number> = {};
    shipment.items.forEach(i => { initial[i.id] = i.quantityExpected; });
    setReceiveQty(initial);
    setReceiveShipment(shipment);
  };

  const handleReceiveSubmit = () => {
    if (!receiveShipment) return;
    const items = receiveShipment.items.map(i => ({ shipmentItemId: i.id, quantityReceived: receiveQty[i.id] ?? 0 }));
    receiveMutation.mutate({ id: receiveShipment.id, payload: { items } });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Shipments</h2>
        <button onClick={() => setCreateOpen(true)} className="btn btn-primary px-3 py-1.5 text-sm">
          <Plus className="h-4 w-4 mr-1" /> New Shipment
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Tracking #</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-[var(--color-accent)]" /></td></tr>
            ) : shipments.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-[var(--color-text-muted)]">No shipments found</td></tr>
            ) : (
              shipments.map(s => (
                <tr key={s.id} className="hover:bg-[var(--color-bg-primary)]">
                  <td className="px-4 py-3 font-medium">{s.supplierName}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{s.trackingNumber || '-'}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {s.items.map(i => `${i.bookTitle} (${i.quantityReceived ?? 0}/${i.quantityExpected})`).join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(s.status)}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.status !== 'RECEIVED' && (
                      <button onClick={() => openReceive(s)} className="btn btn-secondary px-2 py-1 text-xs">
                        <PackageCheck className="h-3 w-3 mr-1" /> Receive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--color-bg-surface)] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-lg">New Shipment</h3>
              <button onClick={() => setCreateOpen(false)}><X className="h-5 w-5 opacity-50 hover:opacity-100" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier *</label>
                <select required className="input w-full" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                  <option value="">— Select a supplier —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tracking Number</label>
                <input type="text" className="input w-full" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Books in this shipment *</label>
                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select
                        className="input flex-1"
                        value={line.bookId}
                        onChange={e => setLines(lines.map((l, i) => i === idx ? { ...l, bookId: e.target.value } : l))}
                      >
                        <option value="">— Select a book —</option>
                        {allBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                      </select>
                      <input
                        type="number"
                        min={1}
                        className="input w-24"
                        value={line.quantityExpected}
                        onChange={e => setLines(lines.map((l, i) => i === idx ? { ...l, quantityExpected: parseInt(e.target.value, 10) || 0 } : l))}
                      />
                      {lines.length > 1 && (
                        <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== idx))} className="btn btn-secondary px-2">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setLines([...lines, { bookId: '', quantityExpected: 1 }])} className="btn btn-secondary px-3 py-1 text-xs mt-2">
                  <Plus className="h-3 w-3 mr-1" /> Add another book
                </button>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
                <button type="button" onClick={() => setCreateOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="btn btn-primary">
                  {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {receiveShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--color-bg-surface)] rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-lg">Receive Shipment — {receiveShipment.supplierName}</h3>
              <button onClick={() => setReceiveShipment(null)}><X className="h-5 w-5 opacity-50 hover:opacity-100" /></button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--color-text-muted)]">Enter the quantity actually received for each book. Inventory (quantity on hand) will be increased by these amounts.</p>
              {receiveShipment.items.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{item.bookTitle} <span className="text-[var(--color-text-muted)]">(expected {item.quantityExpected})</span></span>
                  <input
                    type="number"
                    min={0}
                    className="input w-24"
                    value={receiveQty[item.id] ?? 0}
                    onChange={e => setReceiveQty({ ...receiveQty, [item.id]: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              ))}
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
                <button type="button" onClick={() => setReceiveShipment(null)} className="btn btn-secondary">Cancel</button>
                <button type="button" disabled={receiveMutation.isPending} onClick={handleReceiveSubmit} className="btn btn-primary">
                  {receiveMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Mark Received'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
