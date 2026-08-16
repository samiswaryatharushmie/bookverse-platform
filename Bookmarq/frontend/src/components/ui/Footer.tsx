import { BookOpen, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';
import { useState } from 'react';

/**
 * Footer with site info, quick links, and copyright.
 * Semantic footer landmark for accessibility.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const subscribeMutation = useMutation({
    mutationFn: async (payload: { email: string }) => {
      await apiClient.post('/newsletter/subscribe', payload);
    },
    onSuccess: () => {
      toast.success('Subscribed successfully!');
      setEmail('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to subscribe');
    }
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate({ email });
    }
  };

  return (
    <footer
      role="contentinfo"
      className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[var(--color-accent)]" aria-hidden="true" />
              <span className="font-display text-lg font-bold tracking-tight">
                Book<span className="text-[var(--color-accent)]">marq</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              Your destination for books across every genre.
              Discover, explore, and order with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Browse
            </h3>
            <ul className="mt-4 space-y-2">
              {['New Arrivals', 'Best Sellers', 'Fiction', 'Non-Fiction', 'Children'].map((item) => (
                <li key={item}>
                  <a
                    href="/books"
                    className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Account
            </h3>
            <ul className="mt-4 space-y-2">
              {[
                { label: 'Sign In', href: '/login' },
                { label: 'Register', href: '/register' },
                { label: 'My Orders', href: '/orders' },
                { label: 'My Profile', href: '/profile' },
                { label: 'Help & Support', href: '/support' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Stay Updated
            </h3>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              Subscribe to our newsletter for new releases and promotions.
            </p>
            <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubscribe}>
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  placeholder="you@example.com"
                  className="input w-full text-sm bg-[var(--color-bg-surface)] backdrop-blur-md border border-[var(--color-border)] shadow-inner rounded-xl pl-4 pr-[110px] py-3 focus:bg-[var(--color-bg-elevated)]"
                  aria-label="Email for newsletter"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  disabled={subscribeMutation.isPending} 
                  className="absolute right-1 top-1 bottom-1 px-4 btn btn-primary text-sm flex items-center justify-center rounded-lg m-0 min-w-[90px]"
                >
                  {subscribeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-center text-sm text-[var(--color-text-muted)]">
          <p>&copy; {currentYear} Bookmarq. All rights reserved.</p>
          <p className="mt-1">
            Built with ethical software engineering practices (IEEE/ACM SE Code of Ethics).
          </p>
        </div>
      </div>
    </footer>
  );
}
