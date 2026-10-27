export type BookSource = 'google' | 'openlibrary';

export type BookSearchType = 'all' | 'title' | 'author' | 'subject';

export type ReadingStatus = 'want' | 'reading' | 'finished';

export interface Book {
  /** Stable, source-prefixed identifier used by the local library. */
  id: string;
  source: BookSource;
  /** Identifier inside the source API (volume id or work key). */
  sourceId: string;
  title: string;
  subtitle?: string;
  authors: string[];
  description?: string;
  publisher?: string;
  publishedDate?: string;
  year?: number;
  categories: string[];
  pageCount?: number;
  language?: string;
  thumbnail?: string;
  previewLink?: string;
  averageRating?: number;
  ratingsCount?: number;
  isbn?: string;
}

export interface LibraryEntry {
  book: Book;
  status: ReadingStatus;
  addedAt: string;
  updatedAt: string;
}

export interface LibraryState {
  version: 1;
  entries: Record<string, LibraryEntry>;
}

export interface LibraryCounts {
  total: number;
  want: number;
  reading: number;
  finished: number;
}
