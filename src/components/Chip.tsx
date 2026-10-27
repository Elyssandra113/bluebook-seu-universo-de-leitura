import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  tone?: 'blue' | 'neutral';
}

export function Chip({
  children,
  onRemove,
  removeLabel = 'Remover filtro',
  tone = 'blue',
}: ChipProps) {
  return (
    <span className={`chip chip--${tone}`}>
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          className="chip__remove"
          onClick={onRemove}
          aria-label={removeLabel}
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
