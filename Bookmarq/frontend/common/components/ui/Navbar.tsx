import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, User, Search, LogOut, Heart, ChevronDown } from 'lucide-react';
import { smoothScrollTo } from '@/modules/common/lib/scroll';
import { useAuth } from '@/modules/user/auth/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/modules/common/lib/apiClient';
import NotificationPanel from './NotificationPanel';
import { useState, useRef, KeyboardEvent } from 'react';

/**
 * Top navigation bar.
 * Mobile: hamburger menu. Desktop: horizontal nav with search.
 * Accessibility: semantic nav landmark, aria labels.
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const suggestionListRef = useRef<HTMLDivElement>(null);
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data.data;
    }
  });

  const { data: suggestions = [] } = useQuery<string[]>({
    queryKey: ['autocomplete-navbar', searchInput],
    queryFn: async () => {
      const res = await apiClient.get(`/books/search/autocomplete?q=${searchInput}`);
      return res.data.data;
    },
    enabled: searchInput.length > 1
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/?q=${encodeURIComponent(searchInput.trim())}#catalog-section`);
      setSearchInput('');
    }
  };

  const selectSuggestion = (sug: string) => {
    navigate(`/?q=${encodeURIComponent(sug)}#catalog-section`);
    setSearchInput('');
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[focusedIndex]);
    }
  };

  return (
    <header 
      className="fixed left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-2xl iphone-glass transition-all duration-300"
      style={{ top: 'calc(1rem + var(--promo-banner-height, 0px))' }}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 items-center justify-between px-6 sm:px-8"
      >
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-accent)]"
            aria-label="Bookmarq — Home"
          >
            <BookOpen className="h-7 w-7 text-[var(--color-accent)]" aria-hidden="true" />
            <span className="font-display text-xl font-bold tracking-tight">
              Book<span className="text-[var(--color-accent)]">marq</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <a 
              href="/"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  smoothScrollTo(0, 700);
                }
              }}
              className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors py-4 cursor-pointer"
            >
              Home
            </a>
            <div className="group relative flex items-center h-full">
              <a 
                href="/#catalog-section" 
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    const element = document.getElementById('catalog-section');
                    if (element) {
                      const y = element.getBoundingClientRect().top + window.scrollY;
                      smoothScrollTo(y, 700);
                    }
                  }
                }}
                className="flex items-center gap-1 text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors py-4 cursor-pointer"
              >
                Browse <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </a>
              
              <div className="absolute top-full left-0 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pt-2 -translate-y-2 group-hover:translate-y-0 z-50">
                <div className="rounded-xl p-2 flex flex-col overflow-hidden border border-[var(--color-border)] shadow-2xl" style={{ background: 'rgba(15,15,20,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                  <Link 
                    to="/books"
                    className="px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-accent)] rounded-lg transition-colors"
                  >
                    All Categories
                  </Link>
                  <div className="h-px bg-[var(--color-border)] my-1 mx-2" />
                  {categories.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-[var(--color-text-muted)] italic">
                      No categories found
                    </div>
                  ) : (
                    categories.map((c: any) => (
                      <Link 
                        key={c.id}
                        to={`/?category=${c.id}#catalog-section`}
                        className="px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-accent)] rounded-lg transition-colors"
                      >
                        {c.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            
            {isAuthenticated && (
              <>
                <Link to="/orders" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors">
                  My Orders
                </Link>
                <Link to="/profile/tickets" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors">
                  My Tickets
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Search bar — desktop */}
        <div className="hidden md:flex md:flex-1 md:justify-center md:px-8">
          <form 
            className="relative w-full max-w-md z-50"
            onSubmit={handleSearchSubmit}
          >
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setFocusedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search books, authors, ISBN..."
              aria-label="Search books"
              className="input pl-10 w-full"
              id="navbar-search"
              autoComplete="off"
              role="combobox"
              aria-expanded={searchInput.length > 1 && suggestions.length > 0}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={focusedIndex >= 0 ? `suggestion-${focusedIndex}` : undefined}
            />
            {/* Autocomplete Dropdown */}
            {searchInput.length > 1 && suggestions.length > 0 && (
              <div 
                id="search-suggestions" 
                role="listbox" 
                ref={suggestionListRef}
                className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md shadow-xl overflow-hidden backdrop-blur-xl animate-fade-in z-50"
              >
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    id={`suggestion-${idx}`}
                    role="option"
                    aria-selected={focusedIndex === idx}
                    type="button"
                    onClick={() => selectSuggestion(sug)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-[var(--color-border)] last:border-0 ${
                      focusedIndex === idx 
                        ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' 
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/20 hover:text-[var(--color-accent)]'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile search toggle */}
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {/* Badge — will show count when cart module is built */}
          </Link>

          {/* Account */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2 border-l border-[var(--color-border)] pl-4">
              <NotificationPanel />
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-sm font-medium leading-none text-[var(--color-text-primary)]">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] mt-1">
                  {user?.roles?.includes('ROLE_ADMIN') ? 'Admin' : user?.roles?.includes('ROLE_STAFF') ? 'Staff' : 'Customer'}
                </span>
              </div>
              
              {(user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_STAFF')) && (
                <div className="hidden sm:flex gap-2">
                  <Link
                    to="/admin"
                    className="relative rounded-lg px-3 py-1.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold text-sm transition-colors hover:bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/20"
                    aria-label="Staff Dashboard"
                  >
                    Staff Dashboard
                  </Link>
                </div>
              )}

              <Link
                to="/wishlist"
                className="relative rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-danger)]"
                aria-label="My Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              <Link
                to="/profile"
                className="relative rounded-full bg-[var(--color-bg-surface)] p-2 text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-accent)] border border-[var(--color-border)]"
                aria-label="User profile"
              >
                <User className="h-5 w-5" />
              </Link>
              <button
                onClick={logout}
                className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-danger)]"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary text-sm"
              id="nav-login-btn"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
