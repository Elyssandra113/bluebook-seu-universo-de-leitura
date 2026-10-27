import { useCallback, useEffect, useState } from 'react';
import type { SearchResult } from '../types/api';
import {
  searchBooks,
  type SearchBooksOptions,
} from '../services/books';
import { BookApiError, isAbortedError } from '../services/http';

export interface BookSearchState {
  status: 'idle' | 'loading' | 'success' | 'error';
  result: SearchResult | null;
  error: BookApiError | null;
}

interface InternalSearchState extends BookSearchState {
  /** Identifies the request that produced this state. */
  key: string;
}

function requestKey(
  query: string,
  searchType: string,
  subject: string,
  startIndex: number,
  maxResults: number,
  attempt: number,
): string {
  return [query, searchType, subject, startIndex, maxResults, attempt].join(
    '|',
  );
}

export function useBookSearch(
  options: SearchBooksOptions & { enabled?: boolean } = {},
): BookSearchState & { retry: () => void; isLoading: boolean } {
  const {
    query = '',
    searchType = 'all',
    subject = '',
    startIndex = 0,
    maxResults = 40,
    enabled = true,
  } = options;

  const [attempt, setAttempt] = useState(0);
  const currentKey = requestKey(
    query,
    searchType,
    subject,
    startIndex,
    maxResults,
    attempt,
  );

  const [state, setState] = useState<InternalSearchState>({
    key: '',
    status: enabled ? 'loading' : 'idle',
    result: null,
    error: null,
  });

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    searchBooks({
      query,
      searchType,
      subject,
      startIndex,
      maxResults,
      signal: controller.signal,
    })
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
                  'Ocorreu um erro inesperado ao consultar os livros.',
                  { cause: error },
                ),
        });
      });

    return () => controller.abort();
  }, [
    query,
    searchType,
    subject,
    startIndex,
    maxResults,
    enabled,
    currentKey,
  ]);

  const current: BookSearchState =
    state.key === currentKey
      ? {
          status: state.status,
          result: state.result,
          error: state.error,
        }
      : {
          status: enabled ? 'loading' : 'idle',
          result: null,
          error: null,
        };

  return {
    ...current,
    retry,
    isLoading: current.status === 'loading',
  };
}
