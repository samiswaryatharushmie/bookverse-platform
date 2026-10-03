import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '@/modules/common/lib/apiClient';
import { Book, Category, Author } from '../CatalogPage';
import { Loader2, Plus, Edit2, Trash2, Image as ImageIcon, X, BookOpen, ListTree } from 'lucide-react';
import CategoryManager from './components/CategoryManager';

interface BookFormData {
  isbn: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  publisher: string;
  publishedDate: string;
  pageCount: string;
  language: string;
  categoryId: string;
  active: boolean;
  featured: boolean;
  authorIds: string[];
}

const emptyForm: BookFormData = {
  isbn: '', title: '', slug: '', description: '', price: '',
  publisher: '', publishedDate: '', pageCount: '', language: 'en',
  categoryId: '', active: true, featured: false, authorIds: []
};

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CatalogDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'books' | 'categories'>('books');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookModal, setBookModal] = useState<{ open: boolean; editBook: Book | null }>({ open: false, editBook: null });
  const [form, setForm] = useState<BookFormData>(emptyForm);

  const { data: bookPage, isLoading } = useQuery({
    queryKey: ['adminBooks', searchTerm],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/books?query=${searchTerm}&size=100`);
      return res.data.data;
    }
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data.data;
    }
  });

  const { data: authors = [] } = useQuery<Author[]>({
    queryKey: ['authors'],
    queryFn: async () => {
      const res = await apiClient.get('/authors');
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      await apiClient.post('/admin/books', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
      toast.success('Book created successfully');
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create book')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      await apiClient.put(`/admin/books/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
      toast.success('Book updated successfully');
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update book')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
      toast.success('Book deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete book')
  });

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>, bookId: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiClient.post(`/admin/books/${bookId}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Cover uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
    } catch {
      toast.error('Failed to upload cover');
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setBookModal({ open: true, editBook: null });
  };

  const openEdit = (book: Book) => {
    setForm({
      isbn: book.isbn,
      title: book.title,
      slug: book.slug,
      description: '',
      price: book.price.toString(),
      publisher: '',
      publishedDate: '',
      pageCount: '',
      language: 'en',
      categoryId: book.category?.id ?? '',
      active: book.active ?? true,
      featured: (book as any).featured ?? false,
      authorIds: book.authors?.map(a => a.id) ?? []
    });
    setBookModal({ open: true, editBook: book });
  };

  const closeModal = () => setBookModal({ open: false, editBook: null });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      isbn: form.isbn,
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description,
      price: parseFloat(form.price),
      publisher: form.publisher,
      publishedDate: form.publishedDate || null,
      pageCount: form.pageCount ? parseInt(form.pageCount) : null,
      language: form.language,
      categoryId: form.categoryId || null,
      active: form.active,
      featured: form.featured,
      authorIds: form.authorIds
    };

    if (bookModal.editBook) {
      updateMutation.mutate({ id: bookModal.editBook.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const toggleAuthor = (id: string) => {
    setForm(f => ({
      ...f,
      authorIds: f.authorIds.includes(id) ? f.authorIds.filter(a => a !== id) : [...f.authorIds, id]
    }));
  };

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Catalog Management</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Manage books, categories, and authors.</p>
        </div>
      </div>

      <div className="flex border-b border-[var(--color-border)] mb-6">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'books'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Books
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <ListTree className="h-4 w-4" /> Categories
        </button>
      </div>

      {activeTab === 'categories' ? (
        <CategoryManager />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 ml-auto">
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full sm:w-64"
              />
              <button onClick={openCreate} className="btn btn-primary px-4 py-2 shrink-0">
                <Plus className="h-4 w-4" /> Add Book
              </button>
            </div>
          </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] uppercase border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Book</th>
                <th className="px-6 py-4 font-semibold">ISBN</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-accent)]" />
                  </td>
                </tr>
              ) : bookPage?.content.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    No books found
                  </td>
                </tr>
              ) : (
                bookPage?.content.map((book: Book) => (
                  <tr key={book.id} className="hover:bg-[var(--color-bg-primary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-8 bg-[var(--color-bg-surface)] rounded border border-[var(--color-border)] overflow-hidden shrink-0 relative group">
                          {book.coverUrl ? (
                            <img src={book.coverUrl?.startsWith('http') ? book.coverUrl : `http://localhost:8080${book.coverUrl}`} className="w-full h-full object-cover" alt={book.title} />
                          ) : (
                            <ImageIcon className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-text-muted)] opacity-50" />
                          )}
                          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                            <ImageIcon className="h-4 w-4 text-white" />
                            <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={(e) => handleUploadCover(e, book.id)} />
                          </label>
                        </div>
                        <div>
                          <div className="font-medium text-[var(--color-text-primary)] line-clamp-1">{book.title}</div>
                          <div className="text-[var(--color-text-muted)] text-xs">{book.category?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">{book.isbn}</td>
                    <td className="px-6 py-4 font-medium">Rs {book.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(book)}
                          className="btn btn-secondary px-2 py-1 text-xs"
                          title="Edit book"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => { if (window.confirm('Delete this book?')) deleteMutation.mutate(book.id); }}
                          className="btn btn-secondary px-2 py-1 text-xs text-[var(--color-danger)] hover:border-[var(--color-danger)]"
                          title="Delete book"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
      {bookModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] max-w-2xl w-full shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold">{bookModal.editBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <form id="book-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text" required className="input w-full"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))}
                      placeholder="e.g. The Great Gatsby"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ISBN *</label>
                    <input
                      type="text" required className="input w-full"
                      value={form.isbn}
                      onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
                      placeholder="978-0-00-000000-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (Rs) *</label>
                    <input
                      type="number" required min="0" step="0.01" className="input w-full"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="1200.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <input
                      type="text" className="input w-full"
                      value={form.slug}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder="auto-generated from title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      className="input w-full"
                      value={form.categoryId}
                      onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    >
                      <option value="">— Select category —</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Publisher</label>
                    <input
                      type="text" className="input w-full"
                      value={form.publisher}
                      onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))}
                      placeholder="Penguin Books"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Publish Date</label>
                    <input
                      type="date" className="input w-full"
                      value={form.publishedDate}
                      onChange={e => setForm(f => ({ ...f, publishedDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Page Count</label>
                    <input
                      type="number" min="1" className="input w-full"
                      value={form.pageCount}
                      onChange={e => setForm(f => ({ ...f, pageCount: e.target.value }))}
                      placeholder="320"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="input w-full min-h-[100px]"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short synopsis or description of the book..."
                  />
                </div>

                {/* Authors multi-select */}
                {authors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Authors</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-elevated)]">
                      {authors.map((a: Author) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleAuthor(a.id)}
                          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                            form.authorIds.includes(a.id)
                              ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)]'
                              : 'bg-[var(--color-bg-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                          }`}
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox" id="book-active" checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                    className="h-4 w-4 accent-[var(--color-accent)]"
                  />
                  <label htmlFor="book-active" className="text-sm font-medium cursor-pointer">
                    Active (visible to customers)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox" id="book-featured" checked={form.featured}
                    onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                    className="h-4 w-4 accent-[var(--color-accent)]"
                  />
                  <label htmlFor="book-featured" className="text-sm font-medium cursor-pointer">
                    Featured (highlighted on home page)
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 px-6 py-4 border-t border-[var(--color-border)]">
              <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">Cancel</button>
              <button
                type="submit"
                form="book-form"
                disabled={isPending}
                className="btn btn-primary flex-1"
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : bookModal.editBook ? 'Save Changes' : 'Create Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
