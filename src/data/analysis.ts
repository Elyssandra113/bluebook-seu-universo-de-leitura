import type { Book } from '../types/book';
import type {
  AnalysisMeta,
  BookAnalysis,
  CountItem,
  YearItem,
} from '../types/api';
import { dedupeBooks } from './normalize';
import { normalizeKey } from '../lib/text';

function percent(value: number, base: number): number {
  if (base <= 0) return 0;
  return Math.round((value / base) * 1000) / 10;
}

function sortCounts(a: CountItem, b: CountItem): number {
  return b.value - a.value || a.label.localeCompare(b.label, 'pt-BR');
}

function addToMap(
  map: Map<string, CountItem>,
  rawLabel: string,
  base: number,
): void {
  const label = rawLabel.trim();
  if (!label) return;
  const key = normalizeKey(label);
  if (!key) return;
  const current = map.get(key);
  if (current) {
    current.value += 1;
    current.percent = percent(current.value, base);
  } else {
    map.set(key, { label, value: 1, percent: percent(1, base) });
  }
}

export function topWithOthers(
  items: CountItem[],
  limit: number,
  otherLabel = 'Outros',
): CountItem[] {
  if (items.length <= limit) return items;
  const top = items.slice(0, limit);
  const rest = items.slice(limit);
  const othersValue = rest.reduce((sum, item) => sum + item.value, 0);
  const othersPercent = Math.round(
    rest.reduce((sum, item) => sum + item.percent, 0) * 10,
  ) / 10;
  return [
    ...top,
    {
      label: otherLabel,
      value: othersValue,
      percent: othersPercent,
    },
  ];
}

function groupYears(books: Book[]): {
  years: YearItem[];
  period: 'year' | 'decade';
  range?: { min: number; max: number };
} {
  const years = books
    .map((book) => book.year)
    .filter((year): year is number => typeof year === 'number');

  if (years.length === 0) {
    return { years: [], period: 'year' };
  }

  const min = Math.min(...years);
  const max = Math.max(...years);
  const period: 'year' | 'decade' = max - min > 25 ? 'decade' : 'year';
  const counts = new Map<number, number>();

  for (const year of years) {
    const key = period === 'decade' ? Math.floor(year / 10) * 10 : year;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const items: YearItem[] = [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, value]) => ({
      label:
        period === 'decade' ? `${key}–${key + 9}` : String(key),
      value,
      percent: percent(value, years.length),
      period,
    }));

  return { years: items, period, range: { min, max } };
}

export function getUniqueBooks(books: Book[]): Book[] {
  return dedupeBooks(
    books.filter((book) => typeof book.title === 'string' && book.title.trim()),
  );
}

export function analyzeBooks(
  books: Book[],
  meta: AnalysisMeta,
): BookAnalysis {
  const validBooks = books.filter(
    (book) => typeof book.title === 'string' && book.title.trim().length > 0,
  );
  const uniqueBooks = dedupeBooks(validBooks);
  const uniqueCount = uniqueBooks.length;

  const categoryMap = new Map<string, CountItem>();
  const primaryCategoryMap = new Map<string, CountItem>();
  const authorMap = new Map<string, CountItem>();

  let missingCover = 0;
  let missingYear = 0;
  let missingCategory = 0;
  let missingDescription = 0;
  let missingPages = 0;
  let withPages = 0;
  let pagesTotal = 0;
  let ratedCount = 0;
  let ratingsTotal = 0;

  for (const book of uniqueBooks) {
    if (!book.thumbnail) missingCover += 1;
    if (!book.year) missingYear += 1;
    if (book.categories.length === 0) missingCategory += 1;
    if (!book.description) missingDescription += 1;
    if (!book.pageCount) {
      missingPages += 1;
    } else {
      withPages += 1;
      pagesTotal += book.pageCount;
    }

    if (book.averageRating) {
      ratedCount += 1;
      ratingsTotal += book.averageRating;
    }

    const seenCategories = new Set<string>();
    for (const category of book.categories) {
      const key = normalizeKey(category);
      if (seenCategories.has(key)) continue;
      seenCategories.add(key);
      addToMap(categoryMap, category, uniqueCount);
    }

    const primary = book.categories[0];
    addToMap(
      primaryCategoryMap,
      primary ?? 'Sem categoria informada',
      uniqueCount,
    );

    const seenAuthors = new Set<string>();
    for (const author of book.authors) {
      const key = normalizeKey(author);
      if (!key || seenAuthors.has(key)) continue;
      seenAuthors.add(key);
      addToMap(authorMap, author, uniqueCount);
    }
  }

  const { years, period, range } = groupYears(uniqueBooks);
  const categories = [...categoryMap.values()].sort(sortCounts).slice(0, 8);
  const authors = [...authorMap.values()].sort(sortCounts).slice(0, 8);
  const primaryCategories = topWithOthers(
    [...primaryCategoryMap.values()].sort(sortCounts),
    6,
    'Outros',
  );

  return {
    meta,
    rawCount: books.length,
    validCount: validBooks.length,
    uniqueCount,
    duplicateCount: Math.max(0, validBooks.length - uniqueCount),
    categories,
    primaryCategories,
    authors,
    years,
    yearPeriod: period,
    yearsRange: range,
    averagePages:
      withPages > 0 ? Math.round(pagesTotal / withPages) : undefined,
    quality: {
      missingCover,
      missingYear,
      missingCategory,
      missingDescription,
      missingPages,
      withPages,
    },
    categoryCount: categoryMap.size,
    authorCount: authorMap.size,
    ratedCount,
    averageRating:
      ratedCount > 0
        ? Math.round((ratingsTotal / ratedCount) * 10) / 10
        : undefined,
  };
}
