import { BookOpen } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
  compact?: boolean;
}

export function EmptyState({
  icon,
  eyebrow,
  title,
  description,
  children,
  compact = false,
}: EmptyStateProps) {
  return (
    <section
      className={`state state--empty${compact ? ' state--compact' : ''}`}
      aria-live="polite"
    >
      <div className="state__icon" aria-hidden="true">
        {icon ?? <BookOpen size={28} />}
      </div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="state__title">{title}</h2>
      <p className="state__description">{description}</p>
      {children && <div className="state__actions">{children}</div>}
    </section>
  );
}
