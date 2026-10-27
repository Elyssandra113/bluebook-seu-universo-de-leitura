import type { BookSource } from '../types/book';
import { formatNumber, pluralize } from '../lib/formatters';
import { SourceBadge } from './SourceBadge';

interface ResultsSummaryProps {
  loaded: number;
  total: number;
  source: BookSource;
  fallbackReason?: string;
  filtered?: number;
  page?: number;
  pageSize?: number;
}

export function ResultsSummary({
  loaded,
  total,
  source,
  fallbackReason,
  filtered,
  page,
  pageSize,
}: ResultsSummaryProps) {
  const countLabel = `${formatNumber(loaded)} ${pluralize(
    loaded,
    'livro carregado',
    'livros carregados',
  )}`;

  return (
    <div className="results-summary" aria-live="polite">
      <div className="results-summary__main">
        <SourceBadge
          source={source}
          fallback={Boolean(fallbackReason)}
          reason={fallbackReason}
        />
        <span>
          {typeof filtered === 'number' && filtered !== loaded
            ? `${formatNumber(filtered)} de ${countLabel} após os filtros`
            : countLabel}
          {total > loaded
            ? ` · a API informa ${formatNumber(total)} resultados`
            : ''}
        </span>
      </div>
      {page && pageSize && (
        <span className="results-summary__page">
          Página {page} · {pageSize} por página
        </span>
      )}
    </div>
  );
}
