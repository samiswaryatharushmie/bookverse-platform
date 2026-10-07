import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../../lib/apiClient';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  active: boolean;
}

const emptyForm = { name: '', contactName: '', email: '', phone: '', address: '', active: true };

export default function SupplierManager() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; editSupplier: Supplier | null }>({ open: false, editSupplier: null });
  const [form, setForm] = useState(emptyForm);

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ['admin-suppliers'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/suppliers');
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => { await apiClient.post('/admin/suppliers', payload); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success('Supplier created');
      setModal({ open: false, editSupplier: null });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create supplier')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => { await apiClient.put(`/admin/suppliers/${id}`, payload); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success('Supplier updated');
      setModal({ open: false, editSupplier: null });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update supplier')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/admin/suppliers/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success('Supplier deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete supplier (it may have shipments on file)')
  });

  const openCreate = () => { setForm(emptyForm); setModal({ open: true, editSupplier: null }); };
  const openEdit = (s: Supplier) => {
    setForm({ name: s.name, contactName: s.contactName || '', email: s.email || '', phone: s.phone || '', address: s.address || '', active: s.active });
    setModal({ open: true, editSupplier: s });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.editSupplier) {
      updateMutation.mutate({ id: modal.editSupplier.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Suppliers</h2>
        <button onClick={openCreate} className="btn btn-primary px-3 py-1.5 text-sm">
          <Plus className="h-4 w-4 mr-1" /> New Supplier
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-[var(--color-accent)]" /></td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">No suppliers found</td></tr>
            ) : (
              suppliers.map(s => (
                <tr key={s.id} className="hover:bg-[var(--color-bg-primary)]">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{s.contactName || '-'}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{s.email || '-'}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{s.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(s)} className="btn btn-secondary px-2 py-1 text-xs mr-2"><Edit2 className="h-3 w-3" /></button>
                    <button onClick={() => { if (window.confirm('Delete this supplier?')) deleteMutation.mutate(s.id); }} className="btn btn-secondary px-2 py-1 text-xs text-red-500 hover:border-red-500"><Trash2 className="h-3 w-3" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--color-bg-surface)] rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-lg">{modal.editSupplier ? 'Edit Supplier' : 'New Supplier'}</h3>
              <button onClick={() => setModal({ open: false, editSupplier: null })}><X className="h-5 w-5 opacity-50 hover:opacity-100" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input required type="text" className="input w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name</label>
                <input type="text" className="input w-full" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="input w-full" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="text" className="input w-full" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea className="input w-full" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input id="supplier-active" type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                <label htmlFor="supplier-active" className="text-sm font-medium">Active</label>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
                <button type="button" onClick={() => setModal({ open: false, editSupplier: null })} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn btn-primary">
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
