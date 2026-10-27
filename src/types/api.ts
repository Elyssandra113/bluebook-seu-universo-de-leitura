import type { Book, BookSearchType, BookSource } from './book';

export interface GoogleIndustryIdentifier {
  type?: string;
  identifier?: string;
}

export interface GoogleVolumeInfo {
  title?: string;
  subtitle?: string;
  authors?: string[];
  description?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  language?: string;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
  previewLink?: string;
  averageRating?: number;
  ratingsCount?: number;
  industryIdentifiers?: GoogleIndustryIdentifier[];
}

export interface GoogleVolume {
  id?: string;
  volumeInfo?: GoogleVolumeInfo;
  accessInfo?: {
    webReaderLink?: string;
  };
}

export interface GoogleVolumesResponse {
  kind?: string;
  totalItems?: number;
  items?: GoogleVolume[];
}

export interface OpenLibraryDoc {
  key?: string;
  title?: string;
  subtitle?: string;
  author_name?: string[];
  first_publish_year?: number;
  publisher?: string[];
  subject?: string[];
  number_of_pages_median?: number;
  cover_i?: number;
  language?: string[];
  isbn?: string[];
  ratings_average?: number;
  ratings_count?: number;
  edition_count?: number;
}

export interface OpenLibrarySearchResponse {
  numFound?: number;
  start?: number;
  docs?: OpenLibraryDoc[];
}

export interface OpenLibraryWorkResponse {
  key?: string;
  title?: string;
  description?: string | { value?: string };
  subjects?: string[];
  first_publish_date?: string;
  covers?: number[];
  authors?: Array<{ author?: { key?: string } }>;
}

export interface OpenLibraryAuthorResponse {
  name?: string;
}

export type ApiErrorKind =
  | 'quota'
  | 'auth'
  | 'network'
  | 'timeout'
  | 'server'
  | 'invalid'
  | 'empty'
  | 'aborted'
  | 'unknown';

export interface SearchParams {
  query?: string;
  searchType?: BookSearchType;
  subject?: string;
  startIndex?: number;
  maxResults?: number;
  signal?: AbortSignal;
}

export interface SearchResult {
  books: Book[];
  totalItems: number;
  source: BookSource;
  /** Actual query sent to the API, useful for methodology. */
  apiQuery: string;
  /** Human-readable query in Portuguese. */
  queryLabel: string;
  startIndex: number;
  pageSize: number;
  fetchedAt: string;
  fallbackReason?: string;
}

export interface BookDetailResult {
  book: Book;
  fromCache: boolean;
  detailIncomplete?: boolean;
}

export interface AnalysisMeta {
  queryLabel: string;
  apiQuery: string;
  source: BookSource;
  fetchedAt: string;
  totalItems: number;
  fallbackReason?: string;
}

export interface CountItem {
  label: string;
  value: number;
  percent: number;
}

export interface YearItem extends CountItem {
  period: 'year' | 'decade';
}

export interface AnalysisQuality {
  missingCover: number;
  missingYear: number;
  missingCategory: number;
  missingDescription: number;
  missingPages: number;
  withPages: number;
}

export interface BookAnalysis {
  meta: AnalysisMeta;
  rawCount: number;
  validCount: number;
  uniqueCount: number;
  duplicateCount: number;
  categories: CountItem[];
  primaryCategories: CountItem[];
  authors: CountItem[];
  years: YearItem[];
  yearPeriod: 'year' | 'decade';
  yearsRange?: { min: number; max: number };
  averagePages?: number;
  quality: AnalysisQuality;
  categoryCount: number;
  authorCount: number;
  ratedCount: number;
  averageRating?: number;
}
