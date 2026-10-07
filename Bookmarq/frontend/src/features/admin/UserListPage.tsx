import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { User } from '../auth/context/AuthContext';
import { Loader2, Search, Shield, ShieldOff, Trash2, UserPlus } from 'lucide-react';
import CreateStaffModal from './components/CreateStaffModal';

export default function UserListPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users');
      return res.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.put(`/admin/users/${id}/status?status=${status}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success(`User status updated to ${variables.status}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User deleted successfully');
    }
  });

  const filteredUsers = users.filter((user) => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">User Management</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Manage customer accounts, access levels, and staff.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" />
            New Staff
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] uppercase border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Roles</th>
                <th className="px-6 py-4 font-semibold">Status</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--color-bg-primary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-text-primary)]">{user.firstName} {user.lastName}</div>
                      <div className="text-[var(--color-text-muted)]">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map(role => (
                          <span key={role} className="badge bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-[10px]">
                            {role.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        user.status === 'ACTIVE' ? 'badge-success' : 
                        user.status === 'DELETED' ? 'badge-danger bg-red-500/10 text-red-500 border-red-500/20' : 
                        'badge-accent'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {user.roles.includes('ROLE_ADMIN') ? (
                        <span className="text-xs text-[var(--color-text-muted)] italic">Admin (Immutable)</span>
                      ) : (
                        <>
                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: user.id, status: 'SUSPENDED' })}
                              disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === user.id}
                              className="btn btn-secondary px-3 py-1.5 text-xs text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
                            >
                              <ShieldOff className="h-3 w-3 mr-1" />
                              Suspend
                            </button>
                          ) : user.status !== 'DELETED' ? (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: user.id, status: 'ACTIVE' })}
                              disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === user.id}
                              className="btn btn-secondary px-3 py-1.5 text-xs text-[var(--color-success)] hover:border-[var(--color-success)] hover:text-[var(--color-success)]"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Activate
                            </button>
                          ) : null}
                          
                          {user.status !== 'DELETED' && (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this user?')) {
                                  deleteMutation.mutate(user.id);
                                }
                              }}
                              disabled={deleteMutation.isPending && deleteMutation.variables === user.id}
                              className="btn btn-secondary px-3 py-1.5 text-xs text-red-500 hover:border-red-500 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isCreateModalOpen && (
        <CreateStaffModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
}
