import type { BookSearchType, BookSource } from '../types/book';
import type {
  BookDetailResult,
  SearchParams,
  SearchResult,
} from '../types/api';
import { ANALYSIS_SAMPLE_SIZE } from '../lib/constants';
import { BookApiError, isAbortedError } from './http';
import { getGoogleBook, searchGoogleBooks } from './googleBooks';
import { getOpenLibraryBook, searchOpenLibraryBooks } from './openLibrary';
import { getCachedSearch, setCachedSearch } from './cache';

export interface SearchBooksOptions extends Omit<SearchParams, 'signal'> {
  signal?: AbortSignal;
  allowFallback?: boolean;
}

function normalizeSearchParams(options: SearchBooksOptions): SearchParams {
  const searchType: BookSearchType =
    options.searchType === 'title' ||
    options.searchType === 'author' ||
    options.searchType === 'subject'
      ? options.searchType
      : 'all';

  return {
    query: options.query?.trim() ?? '',
    searchType,
    subject: options.subject?.trim() ?? '',
    startIndex: Math.max(0, Math.trunc(options.startIndex ?? 0)),
    maxResults: Math.min(
      40,
      Math.max(1, Math.trunc(options.maxResults ?? ANALYSIS_SAMPLE_SIZE)),
    ),
    signal: options.signal,
  };
}

function searchCacheKey(params: SearchParams): string {
  return [
    'search',
    params.searchType,
    params.query,
    params.subject,
    params.startIndex,
    params.maxResults,
  ].join('|');
}

export async function searchBooks(
  options: SearchBooksOptions = {},
): Promise<SearchResult> {
  const params = normalizeSearchParams(options);
  const cacheKey = searchCacheKey(params);
  const cached = getCachedSearch(cacheKey);
  if (cached) return cached;

  try {
    const result = await searchGoogleBooks(params);
    setCachedSearch(cacheKey, result);
    return result;
  } catch (error) {
    if (isAbortedError(error)) throw error;
    if (error instanceof BookApiError && error.kind === 'invalid') throw error;
    if (options.allowFallback === false) throw error;

    const googleError =
      error instanceof BookApiError
        ? error
        : new BookApiError(
            'unknown',
            'A Google Books API retornou um erro inesperado.',
            { source: 'google', cause: error },
          );

    try {
      const fallback = await searchOpenLibraryBooks(params);
      const result: SearchResult = {
        ...fallback,
        fallbackReason: googleError.message,
      };
      setCachedSearch(cacheKey, result);
      return result;
    } catch (fallbackError) {
      if (isAbortedError(fallbackError)) throw fallbackError;
      const fallbackMessage =
        fallbackError instanceof Error
          ? fallbackError.message
          : 'erro desconhecido na fonte de contingência.';
      throw new BookApiError(
        'network',
        `Não foi possível consultar a Google Books API nem a fonte de contingência (Open Library). Google Books: ${googleError.message} Open Library: ${fallbackMessage}`,
        {
          source: 'google',
          retryable: true,
          cause: fallbackError,
        },
      );
    }
  }
}

export async function getBookDetail(
  source: BookSource,
  sourceId: string,
  signal?: AbortSignal,
): Promise<BookDetailResult> {
  if (source === 'google') return getGoogleBook(sourceId, signal);
  if (source === 'openlibrary') return getOpenLibraryBook(sourceId, signal);
  throw new BookApiError('invalid', 'Fonte de livro inválida.', {});
}
