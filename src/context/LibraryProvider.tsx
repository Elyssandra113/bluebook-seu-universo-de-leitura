import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Book,
  LibraryEntry,
  LibraryState,
  ReadingStatus,
} from '../types/book';
import {
  addBook as addBookToState,
  countLibrary,
  loadLibrary,
  removeBook as removeBookFromState,
  restoreEntry as restoreEntryInState,
  saveLibrary,
  setBookStatus,
} from '../lib/libraryStorage';
import { LIBRARY_STORAGE_KEY } from '../lib/constants';
import {
  LibraryContext,
  type LibraryContextValue,
} from './libraryContext';

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LibraryState>(() => loadLibrary());
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    const result = saveLibrary(state);
    // oxlint-disable-next-line react/set-state-in-effect -- synchronizes the UI with browser storage
    setStorageError(result.ok ? null : (result.error ?? null));
  }, [state]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LIBRARY_STORAGE_KEY) {
        setState(loadLibrary());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const entries = useMemo(
    () =>
      Object.values(state.entries).sort((a, b) =>
        b.addedAt.localeCompare(a.addedAt),
      ),
    [state.entries],
  );

  const counts = useMemo(() => countLibrary(state), [state]);

  const getEntry = useCallback(
    (bookId: string) => state.entries[bookId],
    [state.entries],
  );

  const isSaved = useCallback(
    (bookId: string) => Boolean(state.entries[bookId]),
    [state.entries],
  );

  const addBook = useCallback(
    (book: Book, status: ReadingStatus = 'want') => {
      setState((current) => addBookToState(current, book, status));
    },
    [],
  );

  const setStatus = useCallback((bookId: string, status: ReadingStatus) => {
    setState((current) => setBookStatus(current, bookId, status));
  }, []);

  const removeBook = useCallback(
    (bookId: string) => {
      const removed = state.entries[bookId];
      setState((current) => removeBookFromState(current, bookId));
      return removed;
    },
    [state.entries],
  );

  const restoreEntry = useCallback((entry: LibraryEntry) => {
    setState((current) => restoreEntryInState(current, entry));
  }, []);

  const value = useMemo<LibraryContextValue>(
    () => ({
      state,
      entries,
      counts,
      storageError,
      getEntry,
      isSaved,
      addBook,
      setStatus,
      removeBook,
      restoreEntry,
    }),
    [
      state,
      entries,
      counts,
      storageError,
      getEntry,
      isSaved,
      addBook,
      setStatus,
      removeBook,
      restoreEntry,
    ],
  );

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}
