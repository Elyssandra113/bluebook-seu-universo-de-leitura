import type { BookSource } from '../types/book';
import type { ApiErrorKind } from '../types/api';
import { REQUEST_TIMEOUT_MS } from '../lib/constants';

export class BookApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly source?: BookSource;
  readonly retryable: boolean;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: {
      status?: number;
      source?: BookSource;
      retryable?: boolean;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = 'BookApiError';
    this.kind = kind;
    this.status = options.status;
    this.source = options.source;
    this.retryable = options.retryable ?? false;
  }
}

export function isAbortedError(error: unknown): boolean {
  return error instanceof BookApiError && error.kind === 'aborted';
}

function statusToError(
  status: number,
  source: BookSource,
  detail: string,
): BookApiError {
  if (status === 429) {
    return new BookApiError(
      'quota',
      'A cota pública da API foi excedida (HTTP 429). Aguarde alguns minutos ou configure uma chave de API.',
      { status, source, retryable: true },
    );
  }
  if (status === 401 || status === 403) {
    return new BookApiError(
      'auth',
      'A API recusou a requisição (HTTP ' +
        status +
        '). Verifique a chave e as restrições de acesso.',
      { status, source, retryable: false },
    );
  }
  if (status === 400) {
    return new BookApiError(
      'invalid',
      'A busca enviada não foi aceita pela API (HTTP 400). Tente outros termos.',
      { status, source, retryable: false },
    );
  }
  if (status >= 500) {
    return new BookApiError(
      'server',
      `A API está temporariamente indisponível (HTTP ${status}). Tente novamente.`,
      { status, source, retryable: true },
    );
  }
  return new BookApiError(
    'unknown',
    `A API retornou um erro inesperado (HTTP ${status}).${detail ? ' ' + detail : ''}`,
    { status, source, retryable: false },
  );
}

export interface FetchJsonOptions {
  source: BookSource;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions,
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const forwardAbort = () => controller.abort();
  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timer);
      throw new BookApiError('aborted', 'Busca cancelada.', {
        source: options.source,
      });
    }
    options.signal.addEventListener('abort', forwardAbort, { once: true });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      let detail = '';
      try {
        const body: unknown = await response.json();
        if (
          typeof body === 'object' &&
          body !== null &&
          'error' in body &&
          typeof body.error === 'object' &&
          body.error !== null &&
          'message' in body.error &&
          typeof body.error.message === 'string'
        ) {
          detail = body.error.message;
        }
      } catch {
        // The status code already gives enough context when the body is not JSON.
      }
      throw statusToError(response.status, options.source, detail);
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new BookApiError(
        'invalid',
        'A API retornou uma resposta que não pôde ser lida.',
        { source: options.source, cause: error },
      );
    }
  } catch (error) {
    if (error instanceof BookApiError) throw error;
    if (options.signal?.aborted) {
      throw new BookApiError('aborted', 'Busca cancelada.', {
        source: options.source,
        cause: error,
      });
    }
    if (timedOut) {
      throw new BookApiError(
        'timeout',
        `A API demorou mais de ${Math.round(timeoutMs / 1000)} segundos para responder. Tente novamente.`,
        { source: options.source, retryable: true, cause: error },
      );
    }
    throw new BookApiError(
      'network',
      'Não foi possível conectar à API. Verifique sua conexão e tente novamente.',
      { source: options.source, retryable: true, cause: error },
    );
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', forwardAbort);
  }
}
