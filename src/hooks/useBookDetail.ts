import { useCallback, useEffect, useState } from 'react';
import type { BookSource } from '../types/book';
import type { BookDetailResult } from '../types/api';
import { getBookDetail } from '../services/books';
import { BookApiError, isAbortedError } from '../services/http';

export interface BookDetailState {
  status: 'loading' | 'success' | 'error';
  result: BookDetailResult | null;
  error: BookApiError | null;
}

interface InternalDetailState extends BookDetailState {
  key: string;
}

export function useBookDetail(
  source: BookSource | undefined,
  sourceId: string | undefined,
): BookDetailState & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const currentKey = `${source ?? ''}:${sourceId ?? ''}:${attempt}`;

  const [state, setState] = useState<InternalDetailState>({
    key: '',
    status: 'loading',
    result: null,
    error: null,
  });

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!source || !sourceId) return;

    const controller = new AbortController();

    getBookDetail(source, sourceId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setState({
          key: currentKey,
          status: 'success',
          result,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortedError(error)) return;
        setState({
          key: currentKey,
          status: 'error',
          result: null,
          error:
            error instanceof BookApiError
              ? error
              : new BookApiError(
                  'unknown',
                  'Ocorreu um erro inesperado ao carregar o livro.',
                  { cause: error },
                ),
        });
      });

    return () => controller.abort();
  }, [source, sourceId, currentKey]);

  const invalid = !source || !sourceId;
  const current: BookDetailState =
    state.key === currentKey
      ? {
          status: state.status,
          result: state.result,
          error: state.error,
        }
      : invalid
        ? {
            status: 'error',
            result: null,
            error: new BookApiError(
              'invalid',
              'Não foi possível identificar este livro.',
              {},
            ),
          }
        : { status: 'loading', result: null, error: null };

  return { ...current, retry };
}
