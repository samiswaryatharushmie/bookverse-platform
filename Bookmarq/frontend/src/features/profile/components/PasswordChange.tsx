import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../../lib/apiClient';
import { Loader2, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@#$%^&+=!]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function PasswordChange() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      await apiClient.put('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  const onSubmit = (data: PasswordForm) => {
    mutation.mutate(data);
  };

  const toggle2FAMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/auth/toggle-2fa');
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Two-Factor Authentication status updated!');
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: () => {
      toast.error('Failed to update 2FA status');
    }
  });

  return (
    <div className="space-y-10">
      {/* 2FA Section */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">Two-Factor Authentication</h2>
        <div className="flex items-start justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${user?.twoFactorEnabled ? 'bg-green-500/20 text-green-400' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'}`}>
              {user?.twoFactorEnabled ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-medium text-[var(--color-text-primary)]">Email Verification</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-md">
                Add an extra layer of security to your account. When enabled, you'll need to enter a 6-digit code sent to your email to log in.
              </p>
            </div>
          </div>
          <button
            onClick={() => toggle2FAMutation.mutate()}
            disabled={toggle2FAMutation.isPending}
            className={`btn ${user?.twoFactorEnabled ? 'bg-[var(--color-bg-elevated)] hover:bg-[var(--color-danger)]/20 hover:text-[var(--color-danger)]' : 'btn-primary'} shrink-0 px-4`}
          >
            {toggle2FAMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (user?.twoFactorEnabled ? 'Disable' : 'Enable 2FA')}
          </button>
        </div>
      </div>

      {/* Password Change Section */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">Change Password</h2>
      <form className="space-y-6 max-w-md" onSubmit={handleSubmit(onSubmit)}>
        
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Current Password
          </label>
          <input
            type="password"
            {...register('oldPassword')}
            className={`input ${errors.oldPassword ? 'border-[var(--color-danger)]' : ''}`}
          />
          {errors.oldPassword && (
            <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.oldPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            New Password
          </label>
          <input
            type="password"
            {...register('newPassword')}
            className={`input ${errors.newPassword ? 'border-[var(--color-danger)]' : ''}`}
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            {...register('confirmPassword')}
            className={`input ${errors.confirmPassword ? 'border-[var(--color-danger)]' : ''}`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn btn-primary"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Update Password
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
