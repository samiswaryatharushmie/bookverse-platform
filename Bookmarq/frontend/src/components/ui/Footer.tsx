import { BookOpen } from 'lucide-react';

/**
 * Footer with site info, quick links, and copyright.
 * Semantic footer landmark for accessibility.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
