import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../../lib/apiClient';
import { User } from '../../auth/context/AuthContext';
import { Loader2, Save } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileDetails({ user }: { user: User }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: (user as any).phone || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const res = await apiClient.put('/users/me', data);
      return res.data.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['authUser'], updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const onSubmit = (data: ProfileForm) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">Personal Details</h2>
      <form className="space-y-6 max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Email Address
          </label>
          <input
            type="email"
            disabled
            value={user.email}
            className="input opacity-50 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Email cannot be changed.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              First name
            </label>
            <input
              type="text"
              {...register('firstName')}
              className={`input ${errors.firstName ? 'border-[var(--color-danger)]' : ''}`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Last name
            </label>
            <input
              type="text"
              {...register('lastName')}
              className={`input ${errors.lastName ? 'border-[var(--color-danger)]' : ''}`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="text"
            {...register('phone')}
            className={`input ${errors.phone ? 'border-[var(--color-danger)]' : ''}`}
            placeholder="+1 234 567 8900"
          />
        </div>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={!isDirty || mutation.isPending}
            className="btn btn-primary"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
