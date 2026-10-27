import type { Book } from '../types/book';
import type { SearchResult } from '../types/api';
import { SEARCH_CACHE_TTL_MS } from '../lib/constants';

const bookCache = new Map<string, Book>();

interface SearchCacheEntry {
  expiresAt: number;
  result: SearchResult;
}

const searchCache = new Map<string, SearchCacheEntry>();

export function cacheBooks(books: Book[]): void {
  for (const book of books) {
    bookCache.set(book.id, book);
  }
}

export function getCachedBook(id: string): Book | undefined {
  return bookCache.get(id);
}

export function getCachedSearch(key: string): SearchResult | undefined {
  const entry = searchCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    searchCache.delete(key);
    return undefined;
  }
  return entry.result;
}

export function setCachedSearch(key: string, result: SearchResult): void {
  searchCache.set(key, {
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    result,
  });
}

export function clearCaches(): void {
  bookCache.clear();
  searchCache.clear();
}
