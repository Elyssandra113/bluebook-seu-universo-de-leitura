import type { AnalysisMeta } from '../types/api';
import { formatDateTime, formatNumber } from '../lib/formatters';
import { SourceBadge } from './SourceBadge';

interface SampleBadgeProps {
  meta: AnalysisMeta;
  count: number;
}

export function SampleBadge({ meta, count }: SampleBadgeProps) {
  return (
    <div className="sample-badge">
      <SourceBadge
        source={meta.source}
        fallback={Boolean(meta.fallbackReason)}
        reason={meta.fallbackReason}
      />
      <span>{formatNumber(count)} registros na amostra</span>
      <span className="sample-badge__date">
        Coleta em {formatDateTime(meta.fetchedAt)}
      </span>
    </div>
  );
}
