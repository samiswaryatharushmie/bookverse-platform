import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PasswordGateProps {
  gateKey: string;        // sessionStorage key
  password: string;       // expected password
  title: string;          // e.g. "Admin Dashboard"
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function PasswordGate({ gateKey, password, title, subtitle, icon, children }: PasswordGateProps) {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(gateKey);
    if (stored === 'unlocked') {
      setUnlocked(true);
    }
  }, [gateKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === password) {
      sessionStorage.setItem(gateKey, 'unlocked');
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect password. Access denied.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Staff Dashboard
        </button>

        <div className={`card p-8 text-center ${shake ? 'animate-shake' : ''}`}>
          {/* Lock icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-accent)]/10 border-2 border-[var(--color-accent)]/30 mb-6 mx-auto">
            {icon || <Lock className="h-9 w-9 text-[var(--color-accent)]" />}
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">{title}</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-8">
            {subtitle || 'Enter the access password to continue.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                placeholder="Enter password"
                className={`input w-full pl-10 pr-10 py-3 text-center tracking-wider ${error ? 'border-[var(--color-danger)]' : ''}`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-[var(--color-danger)] flex items-center justify-center gap-1.5 animate-fade-in">
                <Lock className="h-3.5 w-3.5" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!input}
              className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
            >
              <ShieldCheck className="h-5 w-5" /> Unlock Access
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              🔒 This area is restricted. Contact your administrator if you need access.
            </p>
          </div>
        </div>
      </div>

      {/* Shake animation style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
