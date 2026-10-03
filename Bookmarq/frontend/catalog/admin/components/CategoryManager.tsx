import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '@/modules/common/lib/apiClient';
import { Category } from '../../CatalogPage';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function CategoryManager() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; editCategory: Category | null }>({ open: false, editCategory: null });
  const [form, setForm] = useState({ name: '', slug: '', parentId: '' });

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      await apiClient.post('/admin/categories', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
      setModal({ open: false, editCategory: null });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create category')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      await apiClient.put(`/admin/categories/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
      setModal({ open: false, editCategory: null });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update category')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Cannot delete category. Ensure it has no subcategories.')
  });

  const openCreate = () => {
    setForm({ name: '', slug: '', parentId: '' });
    setModal({ open: true, editCategory: null });
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, parentId: cat.parentId || '' });
    setModal({ open: true, editCategory: cat });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      parentId: form.parentId || null
    };

    if (modal.editCategory) {
      updateMutation.mutate({ id: modal.editCategory.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Categories</h2>
        <button onClick={openCreate} className="btn btn-primary px-3 py-1.5 text-sm">
          <Plus className="h-4 w-4 mr-1" /> New Category
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Parent</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-[var(--color-accent)]" /></td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-[var(--color-text-muted)]">No categories found</td></tr>
            ) : (
              categories.map(cat => {
                const parent = categories.find(c => c.id === cat.parentId);
                return (
                  <tr key={cat.id} className="hover:bg-[var(--color-bg-primary)]">
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{cat.slug}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{parent?.name || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(cat)} className="btn btn-secondary px-2 py-1 text-xs mr-2"><Edit2 className="h-3 w-3" /></button>
                      <button onClick={() => { if (window.confirm('Delete this category?')) deleteMutation.mutate(cat.id); }} className="btn btn-secondary px-2 py-1 text-xs text-red-500 hover:border-red-500"><Trash2 className="h-3 w-3" /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--color-bg-surface)] rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-lg">{modal.editCategory ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setModal({ open: false, editCategory: null })}><X className="h-5 w-5 opacity-50 hover:opacity-100" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input required type="text" className="input w-full" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug (optional)</label>
                <input type="text" className="input w-full" placeholder="auto-generated" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent Category</label>
                <select className="input w-full" value={form.parentId} onChange={e => setForm({...form, parentId: e.target.value})}>
                  <option value="">— None —</option>
                  {categories.filter(c => c.id !== modal.editCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
                <button type="button" onClick={() => setModal({ open: false, editCategory: null })} className="btn btn-secondary">Cancel</button>
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
