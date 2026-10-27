import { AlertTriangle, RefreshCw } from 'lucide-react';
import { BookApiError } from '../services/http';
import { Button } from './Button';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({
  error,
  onRetry,
  title = 'Não foi possível carregar os livros',
}: ErrorStateProps) {
  const apiError = error instanceof BookApiError ? error : null;
  const message =
    error instanceof Error
      ? error.message
      : 'Ocorreu um erro inesperado. Tente novamente.';

  return (
    <section className="state state--error" role="alert">
      <div className="state__icon" aria-hidden="true">
        <AlertTriangle size={28} />
      </div>
      <p className="eyebrow">Falha de conexão</p>
      <h2 className="state__title">{title}</h2>
      <p className="state__description">{message}</p>

      {apiError?.kind === 'quota' && (
        <p className="state__hint">
          A Google Books API pode exigir uma chave para consultas anônimas.
          Configure <code>VITE_GOOGLE_BOOKS_API_KEY</code> em um arquivo
          <code> .env.local</code> para usar sua própria cota.
        </p>
      )}

      {onRetry && (
        <div className="state__actions">
          <Button
            variant="primary"
            icon={<RefreshCw size={17} />}
            onClick={onRetry}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      <details className="state__details">
        <summary>Detalhes técnicos</summary>
        <dl>
          <div>
            <dt>Tipo</dt>
            <dd>{apiError?.kind ?? 'desconhecido'}</dd>
          </div>
          {apiError?.status && (
            <div>
              <dt>HTTP</dt>
              <dd>{apiError.status}</dd>
            </div>
          )}
          {apiError?.source && (
            <div>
              <dt>Fonte</dt>
              <dd>{apiError.source}</dd>
            </div>
          )}
          <div>
            <dt>Mensagem</dt>
            <dd>{message}</dd>
          </div>
        </dl>
      </details>
    </section>
  );
}
