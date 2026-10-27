import type { BookSearchType } from '../types/book';

export const GOOGLE_BOOKS_ENDPOINT =
  'https://www.googleapis.com/books/v1/volumes';
export const OPEN_LIBRARY_ENDPOINT = 'https://openlibrary.org';
export const OPEN_LIBRARY_COVERS_ENDPOINT =
  'https://covers.openlibrary.org/b/id';

export const GOOGLE_MAX_RESULTS = 40;
export const OPEN_LIBRARY_MAX_RESULTS = 100;
export const EXPLORE_PAGE_SIZE = 12;
export const ANALYSIS_SAMPLE_SIZE = 40;
export const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
export const REQUEST_TIMEOUT_MS = 14_000;
export const LIBRARY_STORAGE_KEY = 'bluebook:library:v1';

export const GOOGLE_API_KEY = (
  import.meta.env.VITE_GOOGLE_BOOKS_API_KEY ?? ''
).trim();

export const GOOGLE_COUNTRY = (
  import.meta.env.VITE_GOOGLE_BOOKS_COUNTRY ?? ''
).trim();

export interface SubjectOption {
  value: string;
  label: string;
  description: string;
}

export const SUBJECT_OPTIONS: SubjectOption[] = [
  {
    value: 'fiction',
    label: 'Ficção',
    description: 'Romances, contos e narrativas literárias',
  },
  {
    value: 'fantasy',
    label: 'Fantasia',
    description: 'Mundos imaginários e aventuras épicas',
  },
  {
    value: 'romance',
    label: 'Romance',
    description: 'Histórias de amor e relações humanas',
  },
  {
    value: 'science',
    label: 'Ciência',
    description: 'Divulgação científica e conhecimento',
  },
  {
    value: 'history',
    label: 'História',
    description: 'Passados, memórias e civilizações',
  },
  {
    value: 'biography',
    label: 'Biografia',
    description: 'Vidas reais e trajetórias inspiradoras',
  },
  {
    value: 'philosophy',
    label: 'Filosofia',
    description: 'Ideias, ética e pensamento crítico',
  },
  {
    value: 'poetry',
    label: 'Poesia',
    description: 'Versos, ritmo e sensibilidade',
  },
  {
    value: 'juvenile fiction',
    label: 'Infantojuvenil',
    description: 'Histórias para jovens leitores',
  },
  {
    value: 'computers',
    label: 'Tecnologia',
    description: 'Computação, dados e inovação',
  },
];

export const SEARCH_TYPE_OPTIONS: Array<{
  value: BookSearchType;
  label: string;
}> = [
  { value: 'all', label: 'Tudo' },
  { value: 'title', label: 'Título' },
  { value: 'author', label: 'Autor' },
  { value: 'subject', label: 'Assunto' },
];

export const SEARCH_TYPE_LABELS: Record<BookSearchType, string> = {
  all: 'busca livre',
  title: 'título',
  author: 'autor',
  subject: 'assunto',
};

export const ANALYTICS_PRESETS = [
  { label: 'Ficção', query: '', subject: 'fiction' },
  { label: 'Fantasia', query: '', subject: 'fantasy' },
  { label: 'Ciência', query: '', subject: 'science' },
  { label: 'História', query: '', subject: 'history' },
  { label: 'Romance', query: '', subject: 'romance' },
] as const;

export const NAV_ITEMS = [
  { to: '/', label: 'Início' },
  { to: '/explorar', label: 'Explorar livros' },
  { to: '/biblioteca', label: 'Minha biblioteca' },
  { to: '/dados', label: 'Análise de dados' },
] as const;
