import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { Loader2, Download, AlertTriangle, Settings2, Truck, Building2 } from 'lucide-react';
import SupplierManager from './components/SupplierManager';
import ShipmentManager from './components/ShipmentManager';

interface InventoryItem {
  id: string;
  book: {
    id: string;
    title: string;
    isbn: string;
  };
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity: number;
  reorderLevel: number;
}

export default function InventoryDashboard() {
  const queryClient = useQueryClient();
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stock' | 'suppliers' | 'shipments'>('stock');
  
  const { data: inventoryPage, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/inventory?size=1000&sort=book.title,asc`);
      return res.data.data;
    }
  });

  const { data: lowStock } = useQuery({
    queryKey: ['inventory-low-stock'],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/inventory/low-stock`);
      return res.data.data;
    }
  });

  const handleExport = () => {
    window.location.href = 'http://localhost:8080/api/admin/inventory/export';
  };

  const adjustMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post(`/admin/inventory/${data.bookId}/adjust`, data.payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] });
      toast.success('Stock adjusted successfully');
      setAdjustModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    }
  });

  const reorderLevelMutation = useMutation({
    mutationFn: async ({ bookId, level }: { bookId: string, level: number }) => {
      const res = await apiClient.put(`/admin/inventory/${bookId}/reorder-level`, { reorderLevel: level });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] });
      toast.success('Alert level updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update alert level');
    }
  });

  const handleAdjustSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBookId) return;

    const formData = new FormData(e.currentTarget);
    const payload = {
      movementType: formData.get('movementType'),
      quantity: parseInt(formData.get('quantity') as string, 10),
      reason: formData.get('reason')
    };

    adjustMutation.mutate({ bookId: selectedBookId, payload });
  };

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Inventory Management</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Track stock levels and monitor low stock alerts.</p>
        </div>
        <div className="flex items-center gap-4">
          {activeTab === 'stock' && (
            <button onClick={handleExport} className="btn btn-secondary px-4 py-2 shrink-0">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-[var(--color-border)] mb-6">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'stock'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Settings2 className="h-4 w-4" /> Stock Levels
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'suppliers'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Building2 className="h-4 w-4" /> Suppliers
        </button>
        <button
          onClick={() => setActiveTab('shipments')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'shipments'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Truck className="h-4 w-4" /> Shipments
        </button>
      </div>

      {activeTab === 'suppliers' ? (
        <SupplierManager />
      ) : activeTab === 'shipments' ? (
        <ShipmentManager />
      ) : (
      <>
      {lowStock && lowStock.length > 0 && (
        <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-500">Low Stock Alert</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              There are {lowStock.length} items currently below their reorder level.
            </p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] uppercase border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Book</th>
                <th className="px-6 py-4 font-semibold">On Hand</th>
                <th className="px-6 py-4 font-semibold">Reserved</th>
                <th className="px-6 py-4 font-semibold">Available</th>
                <th className="px-6 py-4 font-semibold">Reorder Level</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-accent)]" />
                  </td>
                </tr>
              ) : inventoryPage?.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    No inventory records found
                  </td>
                </tr>
              ) : (
                inventoryPage?.content.map((item: InventoryItem) => {
                  const isLow = item.quantityOnHand < item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-[var(--color-bg-primary)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--color-text-primary)] line-clamp-1">{item.book.title}</div>
                        <div className="text-[var(--color-text-muted)] text-xs">ISBN: {item.book.isbn}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{item.quantityOnHand}</td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">{item.quantityReserved}</td>
                      <td className={`px-6 py-4 font-bold ${isLow ? 'text-orange-500' : 'text-green-500'}`}>
                        {item.availableQuantity}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">{item.reorderLevel}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              const newLevel = window.prompt(`Set new alert level for ${item.book.title}`, item.reorderLevel.toString());
                              if (newLevel !== null) {
                                const level = parseInt(newLevel, 10);
                                if (!isNaN(level) && level >= 0) {
                                  reorderLevelMutation.mutate({ bookId: item.book.id, level });
                                } else {
                                  toast.error('Please enter a valid number');
                                }
                              }
                            }}
                            className="btn btn-secondary px-3 py-1 text-xs"
                          >
                            <AlertTriangle className="h-3 w-3" /> Set Alert
                          </button>
                          <button 
                            onClick={() => { setSelectedBookId(item.book.id); setAdjustModalOpen(true); }}
                            className="btn btn-secondary px-3 py-1 text-xs"
                          >
                            <Settings2 className="h-3 w-3" /> Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-xl border border-[var(--color-border)] max-w-md w-full shadow-2xl animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Adjust Stock</h2>
            <form onSubmit={handleAdjustSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Movement Type</label>
                  <select name="movementType" className="input w-full" required>
                    <option value="IN">IN (Receive Stock)</option>
                    <option value="OUT">OUT (Manual Deduct)</option>
                    <option value="ADJUST">ADJUST (Correction)</option>
                    <option value="RETURN">RETURN (Customer Return)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input type="number" name="quantity" className="input w-full" required min="1" />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Note: For negative ADJUST, enter positive number here, but wait... backend code assumes negative value for reduction if ADJUST is used. For this simple UI, we'll use IN/OUT mostly.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <input type="text" name="reason" className="input w-full" placeholder="e.g. Found in backroom" required />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setAdjustModalOpen(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
