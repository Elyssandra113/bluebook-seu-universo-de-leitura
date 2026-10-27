import { BookOpen, Globe2 } from 'lucide-react';
import type { BookSource } from '../types/book';

interface SourceBadgeProps {
  source: BookSource;
  fallback?: boolean;
  compact?: boolean;
  reason?: string;
}

export function SourceBadge({
  source,
  fallback = false,
  compact = false,
  reason,
}: SourceBadgeProps) {
  const isGoogle = source === 'google';
  const label = isGoogle
    ? 'Google Books'
    : fallback
      ? 'Open Library · contingência'
      : 'Open Library';

  return (
    <span
      className={`source-badge source-badge--${isGoogle ? 'google' : 'fallback'}`}
      title={reason}
    >
      {isGoogle ? (
        <Globe2 size={13} aria-hidden="true" />
      ) : (
        <BookOpen size={13} aria-hidden="true" />
      )}
      {!compact && <span>{label}</span>}
      {compact && <span className="sr-only">{label}</span>}
    </span>
  );
}
