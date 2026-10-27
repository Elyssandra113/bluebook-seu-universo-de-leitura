import { describe, expect, it } from 'vitest';
import {
  dedupeBooks,
  normalizeGoogleVolume,
  normalizeOpenLibraryDoc,
  normalizeOpenLibraryWork,
  normalizeOpenLibrarySubjects,
} from '../data/normalize';
import {
  cleanLongText,
  cleanText,
  parseYear,
  splitCategories,
  stripMarkdown,
} from '../lib/text';
import {
  googleVolumeFixture,
  makeBook,
  openLibraryDocFixture,
} from './fixtures';

describe('normalizeGoogleVolume', () => {
  it('normaliza campos, autores e categorias da Google Books', () => {
    const book = normalizeGoogleVolume(googleVolumeFixture);

    expect(book).not.toBeNull();
    expect(book?.id).toBe('google:volume-1');
    expect(book?.source).toBe('google');
    expect(book?.title).toBe('Dom Casmurro');
    expect(book?.authors).toEqual(['Machado de Assis']);
    expect(book?.categories).toEqual(['Fiction', 'Classics', 'Literary']);
    expect(book?.year).toBe(1899);
    expect(book?.pageCount).toBe(256);
    expect(book?.isbn).toBe('9781234567890');
    expect(book?.thumbnail).toContain('https://');
    expect(book?.thumbnail).toContain('zoom=1');
    expect(book?.thumbnail).not.toContain('edge=curl');
  });

  it('descarta registros sem título ou identificador', () => {
    expect(normalizeGoogleVolume({ id: 'x', volumeInfo: {} })).toBeNull();
    expect(
      normalizeGoogleVolume({ id: '', volumeInfo: { title: 'Sem id' } }),
    ).toBeNull();
  });

  it('remove HTML e entidades da descrição', () => {
    const book = normalizeGoogleVolume(googleVolumeFixture);
    expect(book?.description).toBe('Uma história de ciúme.');
  });
});

describe('normalizeOpenLibraryDoc', () => {
  it('normaliza obra, capa e ignora assuntos ruidosos', () => {
    const book = normalizeOpenLibraryDoc(openLibraryDocFixture);

    expect(book?.id).toBe('openlibrary:OL123W');
    expect(book?.source).toBe('openlibrary');
    expect(book?.year).toBe(1977);
    expect(book?.pageCount).toBe(96);
    expect(book?.thumbnail).toBe(
      'https://covers.openlibrary.org/b/id/456-L.jpg',
    );
    expect(book?.previewLink).toBe('https://openlibrary.org/works/OL123W');
    expect(book?.categories).not.toContain('protected daisy');
    expect(book?.categories).toContain('Brazilian fiction');
  });

  it('mantém os dados da consulta ao completar detalhes da obra', () => {
    const fallback = makeBook({
      id: 'openlibrary:OL123W',
      source: 'openlibrary',
      sourceId: 'OL123W',
      title: 'A Hora da Estrela',
      publisher: 'Rocco',
      pageCount: 96,
      isbn: '9788532500000',
    });

    const book = normalizeOpenLibraryWork(
      {
        key: '/works/OL123W',
        title: 'A Hora da Estrela',
        description: { value: 'Uma obra de Clarice.' },
        subjects: ['Brazilian fiction'],
        covers: [456],
      },
      fallback,
      ['Clarice Lispector'],
    );

    expect(book?.authors).toEqual(['Clarice Lispector']);
    expect(book?.description).toBe('Uma obra de Clarice.');
    expect(book?.publisher).toBe('Rocco');
    expect(book?.pageCount).toBe(96);
  });

  it('filtra assuntos técnicos e limita a quantidade', () => {
    expect(
      normalizeOpenLibrarySubjects(
        ['protected daisy', 'in library', 'Fantasy', 'Fantasy'],
        2,
      ),
    ).toEqual(['Fantasy']);
  });
});

describe('dedupeBooks', () => {
  it('remove duplicatas por id e por título + primeiro autor', () => {
    const books = [
      makeBook({ id: 'google:1', title: 'Livro A', authors: ['Autora'] }),
      makeBook({ id: 'google:1', title: 'Livro A', authors: ['Autora'] }),
      makeBook({ id: 'google:2', title: 'Livro A', authors: ['Autora'] }),
      makeBook({ id: 'google:3', title: 'Livro B', authors: ['Autora'] }),
    ];

    const unique = dedupeBooks(books);
    expect(unique).toHaveLength(2);
    expect(unique.map((book) => book.id)).toEqual(['google:1', 'google:3']);
  });

  it('mantém títulos iguais de autores diferentes', () => {
    const books = [
      makeBook({ id: 'google:1', title: 'Contos', authors: ['Autor A'] }),
      makeBook({ id: 'google:2', title: 'Contos', authors: ['Autor B'] }),
    ];

    expect(dedupeBooks(books)).toHaveLength(2);
  });
});

describe('text helpers', () => {
  it('faz parsing de ano apenas dentro do intervalo plausível', () => {
    expect(parseYear('publicado em 1999')).toBe(1999);
    expect(parseYear('1999-05-01')).toBe(1999);
    expect(parseYear('999')).toBeUndefined();
    expect(parseYear('2999')).toBeUndefined();
    expect(parseYear(undefined)).toBeUndefined();
  });

  it('limpa HTML, entidades e espaços', () => {
    expect(cleanText('  <b>Olá</b>&nbsp;mundo  ')).toBe('Olá mundo');
    expect(cleanLongText('<p>Linha 1</p><p>Linha 2</p>')).toBe(
      'Linha 1\n\nLinha 2',
    );
  });

  it('divide categorias compostas e remove repetições', () => {
    expect(splitCategories(['Fiction / Fantasy', 'Fiction > Epic'], 4)).toEqual(
      ['Fiction', 'Fantasy', 'Epic'],
    );
    expect(splitCategories(['Fiction / Fantasy.', 'Science / Nature;'])).toEqual(
      ['Fiction', 'Fantasy', 'Science'],
    );
  });

  it('remove marcações simples de Markdown das descrições', () => {
    expect(stripMarkdown('Um **clássico** da *literatura* [moderna](https://x.test).')).toBe(
      'Um clássico da literatura moderna.',
    );
    expect(cleanLongText('## Sinopse\n\nTexto com `código` e __ênfase__.')).toBe(
      'Sinopse\n\nTexto com código e ênfase.',
    );
  });
});
