import type { Book } from '../types/book';
import type {
  GoogleVolume,
  OpenLibraryDoc,
  OpenLibraryWorkResponse,
} from '../types/api';
import {
  cleanLongText,
  cleanText,
  normalizeKey,
  parseYear,
  splitCategories,
  uniqueStrings,
} from '../lib/text';

const NOISY_OPEN_LIBRARY_SUBJECTS = new Set(
  [
    'accessible book',
    'protected daisy',
    'in library',
    'overdrive',
    'large type books',
    'reading level',
    'open library',
    'internet archive',
    'lending library',
    'cd-rom',
    'audio book',
    'audiobook',
  ].map(normalizeKey),
);

function normalizeExternalUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const clean = value.trim();
  if (!clean) return undefined;
  return clean.replace(/^http:/i, 'https:');
}

function normalizeImageUrl(value: unknown): string | undefined {
  const external = normalizeExternalUrl(value);
  if (!external) return undefined;

  let url = external.replace(/&edge=curl/gi, '');
  if (url.includes('books.google.')) {
    if (!/[?&]zoom=/.test(url)) {
      url += `${url.includes('?') ? '&' : '?'}zoom=1`;
    }
  }
  return url;
}

function firstClean(values: Array<unknown> | undefined): string | undefined {
  if (!Array.isArray(values)) return undefined;
  for (const value of values) {
    const clean = cleanText(value);
    if (clean) return clean;
  }
  return undefined;
}

function normalizeIsbn(
  identifiers: Array<{ type?: string; identifier?: string }> | undefined,
): string | undefined {
  if (!Array.isArray(identifiers)) return undefined;
  const preferred =
    identifiers.find((item) => item.type === 'ISBN_13') ??
    identifiers.find((item) => item.type === 'ISBN_10') ??
    identifiers[0];
  return cleanText(preferred?.identifier) || undefined;
}

function validPageCount(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  const rounded = Math.round(value);
  return rounded > 0 && rounded < 100_000 ? rounded : undefined;
}

function validRating(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return value > 0 && value <= 5 ? Math.round(value * 10) / 10 : undefined;
}

export function normalizeGoogleVolume(item: GoogleVolume): Book | null {
  const info = item.volumeInfo;
  const sourceId = cleanText(item.id);
  const title = cleanText(info?.title);
  if (!sourceId || !title) return null;

  const publishedDate = cleanText(info?.publishedDate) || undefined;
  const description = cleanLongText(info?.description) || undefined;
  const thumbnail = normalizeImageUrl(
    info?.imageLinks?.thumbnail ?? info?.imageLinks?.smallThumbnail,
  );

  return {
    id: `google:${sourceId}`,
    source: 'google',
    sourceId,
    title,
    subtitle: cleanText(info?.subtitle) || undefined,
    authors: uniqueStrings(info?.authors, 8),
    description,
    publisher: cleanText(info?.publisher) || undefined,
    publishedDate,
    year: parseYear(publishedDate),
    categories: splitCategories(info?.categories, 3),
    pageCount: validPageCount(info?.pageCount),
    language: cleanText(info?.language) || undefined,
    thumbnail,
    previewLink:
      normalizeExternalUrl(info?.previewLink) ??
      normalizeExternalUrl(item.accessInfo?.webReaderLink),
    averageRating: validRating(info?.averageRating),
    ratingsCount: validPageCount(info?.ratingsCount),
    isbn: normalizeIsbn(info?.industryIdentifiers),
  };
}

export function normalizeOpenLibrarySubjects(
  subjects: Array<unknown> | undefined,
  limit = 3,
): string[] {
  if (!Array.isArray(subjects)) return [];
  const filtered = subjects.filter((subject) => {
    if (typeof subject !== 'string') return false;
    const key = normalizeKey(subject);
    if (!key || NOISY_OPEN_LIBRARY_SUBJECTS.has(key)) return false;
    return key.length > 2 && key.length < 80;
  });
  return splitCategories(filtered, limit);
}

export function normalizeOpenLibraryDoc(doc: OpenLibraryDoc): Book | null {
  const key = cleanText(doc.key);
  const title = cleanText(doc.title);
  if (!key || !title) return null;

  const sourceId = key.replace(/^\/works\//, '');
  const publishedDate = doc.first_publish_year
    ? String(doc.first_publish_year)
    : undefined;
  const coverId =
    typeof doc.cover_i === 'number' && Number.isFinite(doc.cover_i)
      ? doc.cover_i
      : undefined;

  return {
    id: `openlibrary:${sourceId}`,
    source: 'openlibrary',
    sourceId,
    title,
    subtitle: cleanText(doc.subtitle) || undefined,
    authors: uniqueStrings(doc.author_name, 8),
    publisher: firstClean(doc.publisher),
    publishedDate,
    year: parseYear(publishedDate),
    categories: normalizeOpenLibrarySubjects(doc.subject),
    pageCount: validPageCount(doc.number_of_pages_median),
    language: firstClean(doc.language),
    thumbnail: coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : undefined,
    previewLink: `https://openlibrary.org${key}`,
    averageRating: validRating(doc.ratings_average),
    ratingsCount: validPageCount(doc.ratings_count),
    isbn: firstClean(doc.isbn),
  };
}

export function normalizeOpenLibraryWork(
  work: OpenLibraryWorkResponse,
  fallback?: Book,
  authors?: string[],
): Book | null {
  const key = cleanText(work.key) || (fallback ? `/works/${fallback.sourceId}` : '');
  const sourceId = key.replace(/^\/works\//, '');
  const title = cleanText(work.title) || fallback?.title || '';
  if (!sourceId || !title) return null;

  const rawDescription =
    typeof work.description === 'string'
      ? work.description
      : work.description?.value;
  const description =
    cleanLongText(rawDescription) || fallback?.description || undefined;
  const publishedDate =
    cleanText(work.first_publish_date) || fallback?.publishedDate;
  const coverId = work.covers?.find(
    (cover): cover is number => typeof cover === 'number' && cover > 0,
  );
  const categories = normalizeOpenLibrarySubjects(work.subjects, 3);
  const normalizedAuthors = uniqueStrings(authors, 8);

  return {
    id: `openlibrary:${sourceId}`,
    source: 'openlibrary',
    sourceId,
    title,
    subtitle: fallback?.subtitle,
    authors:
      normalizedAuthors.length > 0
        ? normalizedAuthors
        : (fallback?.authors ?? []),
    description,
    publisher: fallback?.publisher,
    publishedDate,
    year: parseYear(publishedDate) ?? fallback?.year,
    categories: categories.length > 0 ? categories : (fallback?.categories ?? []),
    pageCount: fallback?.pageCount,
    language: fallback?.language,
    thumbnail: coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : fallback?.thumbnail,
    previewLink: `https://openlibrary.org${key || `/works/${sourceId}`}`,
    averageRating: fallback?.averageRating,
    ratingsCount: fallback?.ratingsCount,
    isbn: fallback?.isbn,
  };
}

export function dedupeBooks(books: Book[]): Book[] {
  const seenIds = new Set<string>();
  const seenTitleAuthor = new Set<string>();
  const result: Book[] = [];

  for (const book of books) {
    if (seenIds.has(book.id)) continue;
    seenIds.add(book.id);

    const authorKey = normalizeKey(book.authors[0] ?? '');
    const titleKey = normalizeKey(book.title);
    const composite = `${titleKey}|${authorKey}`;

    if (titleKey && authorKey && seenTitleAuthor.has(composite)) continue;
    if (titleKey && authorKey) seenTitleAuthor.add(composite);
    result.push(book);
  }

  return result;
}
