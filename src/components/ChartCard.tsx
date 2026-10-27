import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  description: string;
  children: ReactNode;
  table?: ReactNode;
  note?: string;
  height?: number;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  table,
  note,
  height = 300,
  className,
}: ChartCardProps) {
  return (
    <figure className={['chart-card', className].filter(Boolean).join(' ')}>
      <figcaption className="chart-card__header">
        <h3>{title}</h3>
        <p>{description}</p>
      </figcaption>
      <div className="chart-card__body" style={{ minHeight: height }}>
        {children}
      </div>
      {note && <p className="chart-card__note">{note}</p>}
      {table && (
        <details className="chart-card__table">
          <summary>Ver dados em tabela</summary>
          {table}
        </details>
      )}
    </figure>
  );
}
