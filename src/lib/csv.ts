import type { Book } from '../types/book';
import { formatSource } from './formatters';

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function booksToCsv(books: Book[]): string {
  const header = [
    'Título',
    'Subtítulo',
    'Autores',
    'Categorias',
    'Ano',
    'Editora',
    'Páginas',
    'Idioma',
    'ISBN',
    'Fonte',
    'Link',
  ];

  const rows = books.map((book) => [
    book.title,
    book.subtitle ?? '',
    book.authors.join('; '),
    book.categories.join('; '),
    book.year?.toString() ?? '',
    book.publisher ?? '',
    book.pageCount?.toString() ?? '',
    book.language ?? '',
    book.isbn ?? '',
    formatSource(book.source),
    book.previewLink ?? '',
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
    .join('\r\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([`\uFEFF${content}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
