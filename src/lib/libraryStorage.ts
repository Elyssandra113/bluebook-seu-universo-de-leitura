import type {
  Book,
  BookSource,
  LibraryCounts,
  LibraryEntry,
  LibraryState,
  ReadingStatus,
} from '../types/book';
import { LIBRARY_STORAGE_KEY } from './constants';
import { cleanText } from './text';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidSource(value: unknown): value is BookSource {
  return value === 'google' || value === 'openlibrary';
}

function isValidStatus(value: unknown): value is ReadingStatus {
  return value === 'want' || value === 'reading' || value === 'finished';
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const clean = cleanText(value);
  return clean || undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? cleanText(item) : ''))
    .filter(Boolean);
}

function sanitizeBook(value: unknown): Book | null {
  if (!isRecord(value)) return null;
  const id = optionalString(value.id);
  const source = value.source;
  const sourceId = optionalString(value.sourceId);
  const title = optionalString(value.title);
  if (!id || !isValidSource(source) || !sourceId || !title) return null;

  return {
    id,
    source,
    sourceId,
    title,
    subtitle: optionalString(value.subtitle),
    authors: stringArray(value.authors),
    description: optionalString(value.description),
    publisher: optionalString(value.publisher),
    publishedDate: optionalString(value.publishedDate),
    year: optionalNumber(value.year),
    categories: stringArray(value.categories),
    pageCount: optionalNumber(value.pageCount),
    language: optionalString(value.language),
    thumbnail: optionalString(value.thumbnail),
    previewLink: optionalString(value.previewLink),
    averageRating:
      typeof value.averageRating === 'number' &&
      value.averageRating > 0 &&
      value.averageRating <= 5
        ? value.averageRating
        : undefined,
    ratingsCount: optionalNumber(value.ratingsCount),
    isbn: optionalString(value.isbn),
  };
}

function sanitizeEntry(value: unknown): LibraryEntry | null {
  if (!isRecord(value)) return null;
  const book = sanitizeBook(value.book);
  if (!book || !isValidStatus(value.status)) return null;
  const now = new Date().toISOString();
  return {
    book,
    status: value.status,
    addedAt: optionalString(value.addedAt) ?? now,
    updatedAt: optionalString(value.updatedAt) ?? now,
  };
}

export function emptyLibrary(): LibraryState {
  return { version: 1, entries: {} };
}

function getDefaultStorage(): StorageLike | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadLibrary(storage?: StorageLike): LibraryState {
  const target = storage ?? getDefaultStorage();
  if (!target) return emptyLibrary();

  try {
    const raw = target.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) return emptyLibrary();
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isRecord(parsed.entries)) {
      return emptyLibrary();
    }

    const entries: Record<string, LibraryEntry> = {};
    for (const value of Object.values(parsed.entries)) {
      const entry = sanitizeEntry(value);
      if (entry) entries[entry.book.id] = entry;
    }

    return { version: 1, entries };
  } catch {
    return emptyLibrary();
  }
}

export function saveLibrary(
  state: LibraryState,
  storage?: StorageLike,
): { ok: boolean; error?: string } {
  const target = storage ?? getDefaultStorage();
  if (!target) {
    return { ok: false, error: 'O armazenamento local não está disponível.' };
  }

  try {
    target.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        'Não foi possível salvar a biblioteca. O armazenamento do navegador pode estar cheio ou bloqueado.',
    };
  }
}

export function addBook(
  state: LibraryState,
  book: Book,
  status: ReadingStatus = 'want',
): LibraryState {
  const existing = state.entries[book.id];
  const now = new Date().toISOString();

  if (existing) {
    return {
      ...state,
      entries: {
        ...state.entries,
        [book.id]: {
          ...existing,
          book,
          updatedAt: now,
        },
      },
    };
  }

  return {
    ...state,
    entries: {
      ...state.entries,
      [book.id]: {
        book,
        status,
        addedAt: now,
        updatedAt: now,
      },
    },
  };
}

export function setBookStatus(
  state: LibraryState,
  bookId: string,
  status: ReadingStatus,
): LibraryState {
  const existing = state.entries[bookId];
  if (!existing) return state;

  return {
    ...state,
    entries: {
      ...state.entries,
      [bookId]: {
        ...existing,
        status,
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

export function removeBook(state: LibraryState, bookId: string): LibraryState {
  if (!state.entries[bookId]) return state;
  const entries = { ...state.entries };
  delete entries[bookId];
  return { ...state, entries };
}

export function restoreEntry(
  state: LibraryState,
  entry: LibraryEntry,
): LibraryState {
  return {
    ...state,
    entries: {
      ...state.entries,
      [entry.book.id]: entry,
    },
  };
}

export function countLibrary(state: LibraryState): LibraryCounts {
  const counts: LibraryCounts = {
    total: 0,
    want: 0,
    reading: 0,
    finished: 0,
  };

  for (const entry of Object.values(state.entries)) {
    counts.total += 1;
    counts[entry.status] += 1;
  }

  return counts;
}
