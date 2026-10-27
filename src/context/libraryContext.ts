import { createContext } from 'react';
import type {
  Book,
  LibraryCounts,
  LibraryEntry,
  LibraryState,
  ReadingStatus,
} from '../types/book';

export interface LibraryContextValue {
  state: LibraryState;
  entries: LibraryEntry[];
  counts: LibraryCounts;
  storageError: string | null;
  getEntry: (bookId: string) => LibraryEntry | undefined;
  isSaved: (bookId: string) => boolean;
  addBook: (book: Book, status?: ReadingStatus) => void;
  setStatus: (bookId: string, status: ReadingStatus) => void;
  removeBook: (bookId: string) => LibraryEntry | undefined;
  restoreEntry: (entry: LibraryEntry) => void;
}

export const LibraryContext = createContext<LibraryContextValue | null>(null);
