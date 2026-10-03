import { useState, useRef, useEffect } from 'react';
import { Bookmark, Check, BookOpen, Library, ChevronDown } from 'lucide-react';
import { useLibraryState } from '../hooks/useLibraryState';

interface Props {
  bookId: string;
}

const STATUS_CONFIG = {
  NONE: { label: 'Add to Library', icon: Bookmark, className: 'text-[var(--color-text-primary)]' },
  WANT_TO_READ: { label: 'Want to Read', icon: Bookmark, className: 'text-[var(--color-info)]' },
  CURRENTLY_READING: { label: 'Reading', icon: BookOpen, className: 'text-[var(--color-warning)]' },
  READ: { label: 'Read', icon: Check, className: 'text-[var(--color-success)]' },
  OWNED: { label: 'Owned', icon: Library, className: 'text-[var(--color-accent)]' }
} as const;

export default function LibraryStatusDropdown({ bookId }: Props) {
  const { getStatus, setStatus } = useLibraryState();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const status = getStatus(bookId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  const Icon = currentConfig.icon;

  return (
    <div className="relative" ref={ref} onClick={e => e.preventDefault()}>
      <button 
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={`flex items-center justify-center p-1.5 rounded-full backdrop-blur transition-colors hidden md:flex ${status !== 'NONE' ? 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]' : 'bg-white/20 hover:bg-white/30 text-white'}`}
        title={currentConfig.label}
      >
        <Icon size={16} className={status !== 'NONE' ? currentConfig.className : ''} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
          {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG['NONE']][]).map(([key, config]) => {
            const ItemIcon = config.icon;
            return (
              <button
                key={key}
                onClick={(e) => {
                  e.preventDefault();
                  setStatus(bookId, key);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-[var(--color-bg-surface)] transition-colors ${status === key ? 'bg-[var(--color-bg-surface)] font-medium' : ''}`}
              >
                <ItemIcon size={14} className={config.className} />
                {config.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
