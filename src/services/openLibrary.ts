import type { Book } from '../types/book';
import type {
  BookDetailResult,
  OpenLibraryAuthorResponse,
  OpenLibrarySearchResponse,
  OpenLibraryWorkResponse,
  SearchParams,
  SearchResult,
} from '../types/api';
import {
  OPEN_LIBRARY_ENDPOINT,
  OPEN_LIBRARY_MAX_RESULTS,
} from '../lib/constants';
import {
  normalizeOpenLibraryDoc,
  normalizeOpenLibraryWork,
} from '../data/normalize';
import { BookApiError, fetchJson, isAbortedError } from './http';
import { buildOpenLibraryQuery, describeSearch } from './queries';
import { cacheBooks, getCachedBook } from './cache';

const SEARCH_FIELDS = [
  'key',
  'title',
  'subtitle',
  'author_name',
  'first_publish_year',
  'publisher',
  'subject',
  'number_of_pages_median',
  'cover_i',
  'language',
  'isbn',
  'ratings_average',
  'ratings_count',
  'edition_count',
].join(',');

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export function buildOpenLibrarySearchUrl(options: {
  apiQuery: string;
  startIndex: number;
  maxResults: number;
}): string {
  const page = Math.floor(options.startIndex / options.maxResults) + 1;
  const url = new URL('/search.json', OPEN_LIBRARY_ENDPOINT);
  url.searchParams.set('q', options.apiQuery);
  url.searchParams.set('limit', String(options.maxResults));
  url.searchParams.set('page', String(Math.max(1, page)));
  url.searchParams.set('fields', SEARCH_FIELDS);
  return url.toString();
}

export async function searchOpenLibraryBooks(
  params: SearchParams,
): Promise<SearchResult> {
  const apiQuery = buildOpenLibraryQuery(params);
  if (!apiQuery) {
    throw new BookApiError(
      'invalid',
      'Digite um título, autor ou assunto para iniciar a busca.',
      { source: 'openlibrary' },
    );
  }

  const startIndex = Math.max(0, Math.trunc(params.startIndex ?? 0));
  const maxResults = clamp(
    params.maxResults ?? 40,
    1,
    OPEN_LIBRARY_MAX_RESULTS,
  );

  const url = buildOpenLibrarySearchUrl({
    apiQuery,
    startIndex,
    maxResults,
  });

  const data = await fetchJson<OpenLibrarySearchResponse>(url, {
    source: 'openlibrary',
    signal: params.signal,
  });

  const docs = Array.isArray(data.docs) ? data.docs : [];
  const books: Book[] = [];
  for (const doc of docs) {
    const book = normalizeOpenLibraryDoc(doc);
    if (book) books.push(book);
  }

  cacheBooks(books);

  return {
    books,
    totalItems:
      typeof data.numFound === 'number' && data.numFound >= 0
        ? data.numFound
        : books.length,
    source: 'openlibrary',
    apiQuery,
    queryLabel: describeSearch(params),
    startIndex,
    pageSize: maxResults,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchAuthorName(
  authorKey: string,
  signal?: AbortSignal,
): Promise<string | undefined> {
  const id = authorKey.replace(/^\/authors\//, '');
  if (!id) return undefined;
  const author = await fetchJson<OpenLibraryAuthorResponse>(
    `${OPEN_LIBRARY_ENDPOINT}/authors/${encodeURIComponent(id)}.json`,
    { source: 'openlibrary', signal },
  );
  return typeof author.name === 'string' ? author.name : undefined;
}

export async function getOpenLibraryBook(
  sourceId: string,
  signal?: AbortSignal,
): Promise<BookDetailResult> {
  const id = sourceId.replace(/^\/?works\//, '').replace(/[^A-Za-z0-9]/g, '');
  if (!id) {
    throw new BookApiError('invalid', 'Identificador de livro inválido.', {
      source: 'openlibrary',
    });
  }

  const cached = getCachedBook(`openlibrary:${id}`);

  try {
    const work = await fetchJson<OpenLibraryWorkResponse>(
      `${OPEN_LIBRARY_ENDPOINT}/works/${encodeURIComponent(id)}.json`,
      { source: 'openlibrary', signal },
    );

    const authorKeys =
      work.authors
        ?.map((entry) => entry.author?.key)
        .filter((key): key is string => typeof key === 'string') ?? [];

    const authors: string[] = [];
    for (const key of authorKeys.slice(0, 3)) {
      try {
        const name = await fetchAuthorName(key, signal);
        if (name) authors.push(name);
      } catch (error) {
        if (isAbortedError(error)) throw error;
        // An author endpoint failure must not hide the work itself.
      }
    }

    const book = normalizeOpenLibraryWork(work, cached, authors);
    if (!book) {
      if (cached) {
        return { book: cached, fromCache: true, detailIncomplete: true };
      }
      throw new BookApiError(
        'invalid',
        'A Open Library não retornou dados suficientes para este livro.',
        { source: 'openlibrary' },
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
