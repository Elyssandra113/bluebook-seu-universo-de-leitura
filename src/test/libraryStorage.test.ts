import { describe, expect, it } from 'vitest';
import {
  addBook,
  countLibrary,
  emptyLibrary,
  loadLibrary,
  removeBook,
  restoreEntry,
  saveLibrary,
  setBookStatus,
  type StorageLike,
} from '../lib/libraryStorage';
import { LIBRARY_STORAGE_KEY } from '../lib/constants';
import { makeBook } from './fixtures';

function createStorage(initial?: string): StorageLike & { value: string | null } {
  return {
    value: initial ?? null,
    getItem() {
      return this.value;
    },
    setItem(_key, value) {
      this.value = value;
    },
  };
}

describe('libraryStorage', () => {
  it('adiciona, atualiza status, conta e remove', () => {
    const book = makeBook();
    let state = emptyLibrary();

    state = addBook(state, book, 'want');
    expect(state.entries[book.id]?.status).toBe('want');
    expect(countLibrary(state)).toEqual({
      total: 1,
      want: 1,
      reading: 0,
      finished: 0,
    });

    state = setBookStatus(state, book.id, 'reading');
    expect(state.entries[book.id]?.status).toBe('reading');
    expect(countLibrary(state).reading).toBe(1);

    state = addBook(state, book, 'finished');
    expect(countLibrary(state).total).toBe(1);
    expect(state.entries[book.id]?.status).toBe('reading');

    const removed = state.entries[book.id];
    state = removeBook(state, book.id);
    expect(state.entries[book.id]).toBeUndefined();

    if (removed) state = restoreEntry(state, removed);
    expect(state.entries[book.id]?.status).toBe('reading');
  });

  it('é idempotente ao adicionar o mesmo id', () => {
    const book = makeBook();
    let state = addBook(emptyLibrary(), book);
    state = addBook(state, book);

    expect(countLibrary(state).total).toBe(1);
  });

  it('persiste e recarrega o estado', () => {
    const storage = createStorage();
    const book = makeBook();
    const state = addBook(emptyLibrary(), book, 'finished');

    expect(saveLibrary(state, storage).ok).toBe(true);
    const loaded = loadLibrary(storage);

    expect(loaded.entries[book.id]?.status).toBe('finished');
    expect(loaded.entries[book.id]?.book.title).toBe(book.title);
  });

  it('trata JSON inválido sem quebrar', () => {
    const storage = createStorage('{não é json');
    expect(loadLibrary(storage)).toEqual(emptyLibrary());
  });

  it('descarta entradas com formato inválido', () => {
    const storage = createStorage(
      JSON.stringify({
        version: 1,
        entries: {
          bad: { book: { title: 'Sem id' }, status: 'want' },
          alsoBad: { book: makeBook(), status: 'unknown' },
        },
      }),
    );

    expect(loadLibrary(storage)).toEqual(emptyLibrary());
  });

  it('informa erro quando o storage não está disponível', () => {
    const result = saveLibrary(emptyLibrary(), {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Não foi possível salvar');
  });

  it('usa a chave versionada', () => {
    const storage = createStorage();
    saveLibrary(addBook(emptyLibrary(), makeBook()), storage);
    expect(storage.value).toContain('"version":1');
    expect(LIBRARY_STORAGE_KEY).toBe('bluebook:library:v1');
  });
});
