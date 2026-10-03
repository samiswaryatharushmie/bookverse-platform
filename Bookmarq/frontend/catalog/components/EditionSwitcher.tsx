import { useState } from 'react';
import { Book as BookIcon, Smartphone, Headphones } from 'lucide-react';

type Edition = 'hardcover' | 'paperback' | 'ebook' | 'audiobook';

interface EditionSwitcherProps {
  basePrice: number;
  onEditionChange: (edition: Edition, newPrice: number) => void;
}

export default function EditionSwitcher({ basePrice, onEditionChange }: EditionSwitcherProps) {
  const [selected, setSelected] = useState<Edition>('hardcover');

  const editions = [
    { id: 'hardcover', label: 'Hardcover', icon: BookIcon, multiplier: 1.0 },
    { id: 'paperback', label: 'Paperback', icon: BookIcon, multiplier: 0.75 },
    { id: 'ebook', label: 'E-Book', icon: Smartphone, multiplier: 0.5 },
    { id: 'audiobook', label: 'Audiobook', icon: Headphones, multiplier: 0.85 },
  ] as const;

  const handleSelect = (edition: typeof editions[number]) => {
    setSelected(edition.id);
    onEditionChange(edition.id, basePrice * edition.multiplier);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
      {editions.map((edition) => {
        const isSelected = selected === edition.id;
        const Icon = edition.icon;
        
        return (
          <button
            key={edition.id}
            onClick={() => handleSelect(edition)}
            className={`flex-shrink-0 snap-start relative px-4 py-3 rounded-lg border transition-all duration-300 min-w-[120px] text-left hover-lift ${
              isSelected 
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 glow-brass' 
                : 'border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-[var(--color-accent-soft)]/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={18} className={isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'} />
              <span className={`text-sm font-medium ${isSelected ? 'text-[var(--color-accent-soft)]' : 'text-[var(--color-text-muted)]'}`}>
                {edition.label}
              </span>
            </div>
            <div className={`text-lg font-display ${isSelected ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
              LKR {(basePrice * edition.multiplier).toFixed(2)}
            </div>
            
            {isSelected && (
              <div className="absolute -bottom-px left-0 right-0 h-[2px] bg-[var(--color-accent)] rounded-b-lg shadow-[0_0_10px_var(--color-accent)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
