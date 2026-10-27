import type { BookSearchType } from '../types/book';
import { SEARCH_TYPE_LABELS, SUBJECT_OPTIONS } from '../lib/constants';

export interface QueryInput {
  query?: string;
  searchType?: BookSearchType;
  subject?: string;
}

function sanitizeTerm(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/["\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function quote(value: string): string {
  return `"${value}"`;
}

function prefixFor(type: BookSearchType): string | null {
  switch (type) {
    case 'title':
      return 'intitle';
    case 'author':
      return 'inauthor';
    case 'subject':
      return 'subject';
    default:
      return null;
  }
}

export function buildGoogleQuery(input: QueryInput): string {
  const query = sanitizeTerm(input.query);
  const subject = sanitizeTerm(input.subject);
  const type = input.searchType ?? 'all';
  const parts: string[] = [];

  if (query) {
    const prefix = prefixFor(type);
    parts.push(prefix ? `${prefix}:${quote(query)}` : query);
  }

  if (subject) {
    parts.push(`subject:${quote(subject)}`);
  }

  return parts.join(' ').trim();
}

export function buildOpenLibraryQuery(input: QueryInput): string {
  const query = sanitizeTerm(input.query);
  const subject = sanitizeTerm(input.subject);
  const type = input.searchType ?? 'all';
  const parts: string[] = [];

  if (query) {
    const prefix =
      type === 'title' ? 'title' : type === 'author' ? 'author' : type === 'subject' ? 'subject' : null;
    parts.push(prefix ? `${prefix}:${quote(query)}` : query);
  }

  if (subject) {
    parts.push(`subject:${quote(subject)}`);
  }

  return parts.join(' ').trim();
}

export function subjectLabel(value: string | undefined): string {
  if (!value) return '';
  const found = SUBJECT_OPTIONS.find((option) => option.value === value);
  if (found) return found.label;
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function describeSearch(input: QueryInput): string {
  const query = sanitizeTerm(input.query);
  const subject = subjectLabel(input.subject);
  const type = input.searchType ?? 'all';
  const parts: string[] = [];

  if (query) {
    parts.push(
      type === 'all'
        ? `Busca livre por “${query}”`
        : `Busca por ${SEARCH_TYPE_LABELS[type]} “${query}”`,
    );
  }

  if (subject) {
    parts.push(`${query ? 'no' : 'No'} assunto “${subject}”`);
  }

  return parts.join(' ') || 'Acervo em destaque';
}
