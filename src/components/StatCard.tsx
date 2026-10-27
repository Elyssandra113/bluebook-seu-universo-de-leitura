import type { ReactNode } from 'react';
import { formatNumber } from '../lib/formatters';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: 'blue' | 'navy' | 'green' | 'amber';
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'blue',
}: StatCardProps) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        {icon && (
          <span className="stat-card__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <strong className="stat-card__value">
        {typeof value === 'number' ? formatNumber(value) : value}
      </strong>
      {hint && <p className="stat-card__hint">{hint}</p>}
    </article>
  );
}
