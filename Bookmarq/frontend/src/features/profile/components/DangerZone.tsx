import { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import apiClient from '../../../lib/apiClient';
import toast from 'react-hot-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function DangerZone() {
  const { logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }
    
    try {
      setIsDeleting(true);
      await apiClient.delete('/users/me');
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6 text-red-500">
        <AlertTriangle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Danger Zone</h2>
      </div>
      
      <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-5 mb-6">
        <h3 className="font-medium text-red-400 mb-2">Delete Account</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-red-400">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="input w-full md:max-w-xs border-red-500/30 focus:border-red-500"
              placeholder="DELETE"
            />
          </div>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting || confirmText !== 'DELETE'}
            className="btn bg-red-500 hover:bg-red-600 text-white border-transparent disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
