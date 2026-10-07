import { useState } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import ProfileDetails from './components/ProfileDetails';
import PasswordChange from './components/PasswordChange';
import AddressBook from './components/AddressBook';
import DangerZone from './components/DangerZone';
import { User, MapPin, KeyRound, AlertTriangle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'addresses' | 'security' | 'danger'>('details');

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">My Profile</h1>
        <p className="text-[var(--color-text-muted)] mt-2">
          Manage your personal information, addresses, and security settings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'details'
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-accent)] border border-[var(--color-border)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <User className="h-5 w-5" />
              Personal Details
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'addresses'
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-accent)] border border-[var(--color-border)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <MapPin className="h-5 w-5" />
              Address Book
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-accent)] border border-[var(--color-border)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <KeyRound className="h-5 w-5" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'danger'
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm'
                  : 'text-red-400 hover:bg-red-500/10 hover:text-red-500'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="card">
            {activeTab === 'details' && <ProfileDetails user={user} />}
            {activeTab === 'addresses' && <AddressBook />}
            {activeTab === 'security' && <PasswordChange />}
            {activeTab === 'danger' && <DangerZone />}
          </div>
        </main>
      </div>
    </div>
  );
}
