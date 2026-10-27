import type {
  BookSource,
  ReadingStatus,
} from '../types/book';
import { cleanText, truncate } from './text';

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'data indisponível';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return cleanText(value);
  if (/^\d{4}$/.test(value)) return value;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatAuthors(authors: string[], max = 0): string {
  const cleaned = authors.map(cleanText).filter(Boolean);
  if (cleaned.length === 0) return '';
  const selected = max > 0 ? cleaned.slice(0, max) : cleaned;
  const formatted =
    selected.length === 1
      ? selected[0]
      : `${selected.slice(0, -1).join(', ')} e ${selected[selected.length - 1]}`;
  if (max > 0 && cleaned.length > max) {
    return `${formatted} e mais ${cleaned.length - max}`;
  }
  return formatted;
}

export function formatSource(source: BookSource): string {
  return source === 'google' ? 'Google Books' : 'Open Library';
}

export function formatSourceDetail(source: BookSource): string {
  return source === 'google'
    ? 'Google Books API'
    : 'Open Library (contingência)';
}

export function formatStatus(status: ReadingStatus): string {
  const labels: Record<ReadingStatus, string> = {
    want: 'Quero ler',
    reading: 'Lendo',
    finished: 'Concluído',
  };
  return labels[status];
}

export function formatPages(pageCount: number | undefined): string {
  if (!pageCount) return '';
  return `${formatNumber(pageCount)} ${pageCount === 1 ? 'página' : 'páginas'}`;
}

export function formatLanguage(value: string | undefined): string {
  if (!value) return '';
  const labels: Record<string, string> = {
    pt: 'Português',
    por: 'Português',
    en: 'Inglês',
    eng: 'Inglês',
    es: 'Espanhol',
    spa: 'Espanhol',
    fr: 'Francês',
    fre: 'Francês',
    fra: 'Francês',
    de: 'Alemão',
    ger: 'Alemão',
    deu: 'Alemão',
    it: 'Italiano',
    ita: 'Italiano',
    ja: 'Japonês',
    jpn: 'Japonês',
  };
  return labels[value.toLowerCase()] ?? value;
}

export function formatRating(
  averageRating: number | undefined,
  ratingsCount: number | undefined,
): string {
  if (!averageRating) return '';
  const base = averageRating.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  if (!ratingsCount) return base;
  return `${base} (${formatNumber(ratingsCount)} avaliações)`;
}

export function pluralize(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? singular : plural;
}

export function bookSubtitle(book: {
  authors: string[];
  year?: number;
  pageCount?: number;
}): string {
  return [formatAuthors(book.authors), book.year, formatPages(book.pageCount)]
    .filter(Boolean)
    .join(' · ');
}

export function descriptionPreview(value: string, maxLength = 220): string {
  return truncate(cleanText(value), maxLength);
}

export function coverAlt(title: string): string {
  return `Capa do livro ${title}`;
}
