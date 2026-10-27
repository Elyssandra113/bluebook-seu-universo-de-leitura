import { Bookmark, BookOpen, CheckCircle2 } from 'lucide-react';
import type { ReadingStatus } from '../types/book';
import { formatStatus } from '../lib/formatters';

const ICONS = {
  want: Bookmark,
  reading: BookOpen,
  finished: CheckCircle2,
} as const;

export function StatusBadge({ status }: { status: ReadingStatus }) {
  const Icon = ICONS[status];
  return (
    <span className={`status-badge status-badge--${status}`}>
      <Icon size={13} aria-hidden="true" />
      {formatStatus(status)}
    </span>
  );
}
