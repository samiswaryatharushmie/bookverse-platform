import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../../lib/apiClient';
import { Book } from '../../catalog/CatalogPage';
import { Loader2, Plus, Edit2, Trash2, X, BookPlus } from 'lucide-react';

interface Shelf {
  id: string;
  title: string;
  slug: string;
  description?: string;
  sortOrder: number;
  active: boolean;
  books: Book[];
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ShelfManager() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; editShelf: Shelf | null }>({ open: false, editShelf: null });
  const [form, setForm] = useState({ title: '', slug: '', description: '', sortOrder: 0, active: true });
  const [addBookShelf, setAddBookShelf] = useState<Shelf | null>(null);
  const [selectedBookId, setSelectedBookId] = useState('');

  const { data: shelves = [], isLoading } = useQuery<Shelf[]>({
    queryKey: ['admin-shelves'],
    queryFn: async () => {
      const res = await apiClient.get('/shelves/admin');
      return res.data.data;
    }
  });

  const { data: bookPage } = useQuery({
    queryKey: ['all-books-for-shelves'],
    queryFn: async () => {
      const res = await apiClient.get('/books?size=1000');
      return res.data.data;
    }
  });
  const allBooks: Book[] = bookPage?.content || [];

  const createMutation = useMutation({
    mutationFn: async (payload: any) => { await apiClient.post('/shelves/admin', payload); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shelves'] });
      toast.success('Shelf created');
      setModal({ open: false, editShelf: null });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create shelf')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => { await apiClient.put(`/shelves/admin/${id}`, payload); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shelves'] });
      toast.success('Shelf updated');
      setModal({ open: false, editShelf: null });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update shelf')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/shelves/admin/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shelves'] });
      toast.success('Shelf deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete shelf')
  });

  const addBookMutation = useMutation({
    mutationFn: async ({ shelfId, bookId }: { shelfId: string; bookId: string }) => {
      await apiClient.post(`/shelves/admin/${shelfId}/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shelves'] });
      toast.success('Book added to shelf');
      setSelectedBookId('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add book')
  });

  const removeBookMutation = useMutation({
    mutationFn: async ({ shelfId, bookId }: { shelfId: string; bookId: string }) => {
      await apiClient.delete(`/shelves/admin/${shelfId}/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shelves'] });
      toast.success('Book removed from shelf');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to remove book')
  });

  const openCreate = () => {
    setForm({ title: '', slug: '', description: '', sortOrder: 0, active: true });
    setModal({ open: true, editShelf: null });
  };

  const openEdit = (shelf: Shelf) => {
    setForm({ title: shelf.title, slug: shelf.slug, description: shelf.description || '', sortOrder: shelf.sortOrder, active: shelf.active });
    setModal({ open: true, editShelf: shelf });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || slugify(form.title) };
    if (modal.editShelf) {
      updateMutation.mutate({ id: modal.editShelf.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Curated Shelves</h2>
        <button onClick={openCreate} className="btn btn-primary px-3 py-1.5 text-sm">
          <Plus className="h-4 w-4 mr-1" /> New Shelf
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-[var(--color-accent)]" /></div>
      ) : shelves.length === 0 ? (
        <div className="card p-8 text-center text-[var(--color-text-muted)]">No curated shelves found</div>
      ) : (
        <div className="space-y-4">
          {shelves.map(shelf => (
            <div key={shelf.id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{shelf.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{shelf.description}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${shelf.active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                    {shelf.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setAddBookShelf(shelf)} className="btn btn-secondary px-2 py-1 text-xs"><BookPlus className="h-3 w-3 mr-1" /> Add Book</button>
                  <button onClick={() => openEdit(shelf)} className="btn btn-secondary px-2 py-1 text-xs"><Edit2 className="h-3 w-3" /></button>
                  <button onClick={() => { if (window.confirm('Delete this shelf?')) deleteMutation.mutate(shelf.id); }} className="btn btn-secondary px-2 py-1 text-xs text-red-500 hover:border-red-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {shelf.books.length === 0 ? (
                  <span className="text-xs text-[var(--color-text-muted)]">No books on this shelf yet</span>
                ) : (
                  shelf.books.map(book => (
                    <span key={book.id} className="inline-flex items-center gap-1.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-full pl-3 pr-1 py-1 text-xs">
                      {book.title}
                      <button
                        onClick={() => removeBookMutation.mutate({ shelfId: shelf.id, bookId: book.id })}
                        className="hover:text-red-500"
                        title="Remove from shelf"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--color-bg-surface)] rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-lg">{modal.editShelf ? 'Edit Shelf' : 'New Shelf'}</h3>
              <button onClick={() => setModal({ open: false, editShelf: null })}><X className="h-5 w-5 opacity-50 hover:opacity-100" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input required type="text" className="input w-full" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug (optional)</label>
                <input type="text" className="input w-full" placeholder="auto-generated" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="input w-full" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input id="shelf-active" type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                <label htmlFor="shelf-active" className="text-sm font-medium">Active (visible on homepage)</label>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
                <button type="button" onClick={() => setModal({ open: false, editShelf: null })} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn btn-primary">
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addBookShelf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--color-bg-surface)] rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-lg">Add Book to "{addBookShelf.title}"</h3>
              <button onClick={() => setAddBookShelf(null)}><X className="h-5 w-5 opacity-50 hover:opacity-100" /></button>
            </div>
            <div className="p-4 space-y-4">
              <select className="input w-full" value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)}>
                <option value="">— Select a book —</option>
                {allBooks
                  .filter(b => !addBookShelf.books.some(sb => sb.id === b.id))
                  .map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setAddBookShelf(null)} className="btn btn-secondary">Cancel</button>
                <button
                  type="button"
                  disabled={!selectedBookId || addBookMutation.isPending}
                  onClick={() => addBookMutation.mutate({ shelfId: addBookShelf.id, bookId: selectedBookId }, { onSuccess: () => setAddBookShelf(null) })}
                  className="btn btn-primary"
                >
                  {addBookMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Add to Shelf'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
