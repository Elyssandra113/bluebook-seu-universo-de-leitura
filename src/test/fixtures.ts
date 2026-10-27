import type { Book } from '../types/book';

export function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'google:abc123',
    source: 'google',
    sourceId: 'abc123',
    title: 'Livro de Teste',
    authors: ['Autora Teste'],
    categories: ['Fiction'],
    year: 2020,
    pageCount: 320,
    description: 'Uma descrição de teste.',
    thumbnail: 'https://example.com/cover.jpg',
    ...overrides,
  };
}

export const googleVolumeFixture = {
  id: 'volume-1',
  volumeInfo: {
    title: 'Dom Casmurro',
    subtitle: 'Romance',
    authors: ['Machado de Assis', 'Machado de Assis'],
    description: '<p>Uma história de <b>ciúme</b>.</p>',
    publisher: 'Editora Teste',
    publishedDate: '1899-01-01',
    pageCount: 256,
    categories: ['Fiction / Classics', 'Fiction / Literary'],
    language: 'pt',
    imageLinks: {
      thumbnail: 'http://books.google.com/books/content?id=abc&edge=curl',
    },
    previewLink: 'http://books.google.com/books?id=abc',
    averageRating: 4.7,
    ratingsCount: 120,
    industryIdentifiers: [
      { type: 'ISBN_10', identifier: '1234567890' },
      { type: 'ISBN_13', identifier: '9781234567890' },
    ],
  },
};

export const openLibraryDocFixture = {
  key: '/works/OL123W',
  title: 'A Hora da Estrela',
  author_name: ['Clarice Lispector'],
  first_publish_year: 1977,
  publisher: ['Rocco'],
  subject: ['Brazilian fiction', 'protected daisy', 'Women authors'],
  number_of_pages_median: 96,
  cover_i: 456,
  language: ['por'],
  isbn: ['9788532500000'],
  ratings_average: 4.4,
  ratings_count: 42,
};
