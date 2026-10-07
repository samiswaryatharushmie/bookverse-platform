import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import apiClient from '../../../lib/apiClient';
import { Loader2, Plus, MapPin, Trash2, Edit2 } from 'lucide-react';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

const addressSchema = z.object({
  street: z.string().min(2, 'Street is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(2, 'Zip Code is required'),
  country: z.string().min(2, 'Country is required'),
  isDefault: z.boolean().default(false),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function AddressBook() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me/addresses');
      return res.data.data;
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AddressForm) => {
      if (editingId) {
        await apiClient.put(`/users/me/addresses/${editingId}`, data);
      } else {
        await apiClient.post('/users/me/addresses', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success(editingId ? 'Address updated' : 'Address added');
      closeForm();
    },
    onError: () => toast.error('Failed to save address')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/me/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
    onError: () => toast.error('Failed to remove address')
  });

  const onSubmit = (data: AddressForm) => saveMutation.mutate(data);

  const openForm = (address?: Address) => {
    if (address) {
      setEditingId(address.id);
      setValue('street', address.street);
      setValue('city', address.city);
      setValue('state', address.state);
      setValue('zipCode', address.zipCode);
      setValue('country', address.country);
      setValue('isDefault', address.isDefault);
    } else {
      setEditingId(null);
      reset({ isDefault: false });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    reset();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[var(--color-accent)]" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Address Book</h2>
        {!isFormOpen && (
          <button onClick={() => openForm()} className="btn btn-primary py-1.5 px-4">
            <Plus className="h-4 w-4" /> Add New
          </button>
        )}
      </div>

      {isFormOpen ? (
        <form className="space-y-4 max-w-xl bg-[var(--color-bg-primary)] p-4 rounded-lg border border-[var(--color-border)]" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1">Street</label>
            <input type="text" {...register('street')} className="input" />
            {errors.street && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.street.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input type="text" {...register('city')} className="input" />
              {errors.city && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input type="text" {...register('state')} className="input" />
              {errors.state && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.state.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Zip Code</label>
              <input type="text" {...register('zipCode')} className="input" />
              {errors.zipCode && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.zipCode.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input type="text" {...register('country')} className="input" />
              {errors.country && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.country.message}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isDefault" {...register('isDefault')} className="rounded border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
            <label htmlFor="isDefault" className="text-sm">Set as default address</label>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={closeForm} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
              {saveMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save Address'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-sm col-span-2">No addresses saved yet.</p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent-soft)] transition-colors relative group">
                {address.isDefault && (
                  <span className="badge badge-accent absolute top-3 right-3">Default</span>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                  <div className="text-sm text-[var(--color-text-muted)]">
                    <p className="text-[var(--color-text-primary)] font-medium mb-1">{address.street}</p>
                    <p>{address.city}, {address.state} {address.zipCode}</p>
                    <p>{address.country}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openForm(address)} className="text-xs flex items-center gap-1 text-[var(--color-info)] hover:underline">
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => deleteMutation.mutate(address.id)} className="text-xs flex items-center gap-1 text-[var(--color-danger)] hover:underline">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
