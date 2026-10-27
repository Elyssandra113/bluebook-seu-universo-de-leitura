import type { Book } from '../types/book';
import type {
  BookDetailResult,
  GoogleVolumeInfo,
  GoogleVolumesResponse,
  SearchParams,
  SearchResult,
} from '../types/api';
import {
  GOOGLE_API_KEY,
  GOOGLE_BOOKS_ENDPOINT,
  GOOGLE_COUNTRY,
  GOOGLE_MAX_RESULTS,
} from '../lib/constants';
import { normalizeGoogleVolume } from '../data/normalize';
import { BookApiError, fetchJson, isAbortedError } from './http';
import { buildGoogleQuery, describeSearch } from './queries';
import { cacheBooks, getCachedBook } from './cache';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export function buildGoogleVolumesUrl(options: {
  apiQuery: string;
  startIndex: number;
  maxResults: number;
  apiKey?: string;
  country?: string;
}): string {
  const url = new URL(GOOGLE_BOOKS_ENDPOINT);
  url.searchParams.set('q', options.apiQuery);
  url.searchParams.set('startIndex', String(options.startIndex));
  url.searchParams.set('maxResults', String(options.maxResults));
  url.searchParams.set('printType', 'books');
  url.searchParams.set('orderBy', 'relevance');

  if (options.apiKey) url.searchParams.set('key', options.apiKey);
  if (options.country) url.searchParams.set('country', options.country);

  return url.toString();
}

export async function searchGoogleBooks(
  params: SearchParams,
): Promise<SearchResult> {
  const apiQuery = buildGoogleQuery(params);
  if (!apiQuery) {
    throw new BookApiError(
      'invalid',
      'Digite um título, autor ou assunto para iniciar a busca.',
      { source: 'google' },
    );
  }

  const startIndex = Math.max(0, Math.trunc(params.startIndex ?? 0));
  const maxResults = clamp(
    params.maxResults ?? GOOGLE_MAX_RESULTS,
    1,
    GOOGLE_MAX_RESULTS,
  );

  const url = buildGoogleVolumesUrl({
    apiQuery,
    startIndex,
    maxResults,
    apiKey: GOOGLE_API_KEY,
    country: GOOGLE_COUNTRY,
  });

  const data = await fetchJson<GoogleVolumesResponse>(url, {
    source: 'google',
    signal: params.signal,
  });

  const items = Array.isArray(data.items) ? data.items : [];
  const books: Book[] = [];
  for (const item of items) {
    const book = normalizeGoogleVolume(item);
    if (book) books.push(book);
  }

  cacheBooks(books);

  return {
    books,
    totalItems:
      typeof data.totalItems === 'number' && data.totalItems >= 0
        ? data.totalItems
        : books.length,
    source: 'google',
    apiQuery,
    queryLabel: describeSearch(params),
    startIndex,
    pageSize: maxResults,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getGoogleBook(
  volumeId: string,
  signal?: AbortSignal,
): Promise<BookDetailResult> {
  const cached = getCachedBook(`google:${volumeId}`);
  if (cached?.description) {
    return { book: cached, fromCache: true };
  }

  try {
    const url = `${GOOGLE_BOOKS_ENDPOINT}/${encodeURIComponent(volumeId)}${
      GOOGLE_API_KEY ? `?key=${encodeURIComponent(GOOGLE_API_KEY)}` : ''
    }`;
    const item = await fetchJson<{
      id?: string;
      volumeInfo?: GoogleVolumeInfo;
      accessInfo?: { webReaderLink?: string };
    }>(url, { source: 'google', signal });

    const book = normalizeGoogleVolume({
      id: item.id,
      volumeInfo: item.volumeInfo,
      accessInfo: item.accessInfo,
    });

    if (!book) {
      throw new BookApiError(
        'invalid',
        'A API não retornou dados suficientes para este livro.',
        { source: 'google' },
      );
    }

    cacheBooks([book]);
    return { book, fromCache: false };
  } catch (error) {
    if (isAbortedError(error)) throw error;
    if (cached) {
      return { book: cached, fromCache: true, detailIncomplete: true };
    }
    throw error;
  }
}
