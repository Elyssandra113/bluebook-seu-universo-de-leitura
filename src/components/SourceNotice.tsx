import { Info } from 'lucide-react';
import type { BookSource } from '../types/book';

interface SourceNoticeProps {
  source: BookSource;
  fallbackReason?: string;
}

export function SourceNotice({ source, fallbackReason }: SourceNoticeProps) {
  if (source !== 'openlibrary' || !fallbackReason) return null;

  return (
    <aside className="source-notice" role="status">
      <Info size={19} aria-hidden="true" />
      <div>
        <p>
          <strong>Google Books indisponível.</strong> Esta consulta está usando
          a Open Library como fonte de contingência. Os dados e gráficos abaixo
          refletem essa fonte — não são uma simulação.
        </p>
        <details>
          <summary>Ver motivo técnico</summary>
          <p>{fallbackReason}</p>
        </details>
      </div>
    </aside>
  );
}
