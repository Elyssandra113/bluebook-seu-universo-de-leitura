import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownUp,
  Compass,
  SearchX,
  SlidersHorizontal,
} from 'lucide-react';
import type { Book, BookSearchType } from '../types/book';
import { useBookSearch } from '../hooks/useBookSearch';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  EXPLORE_PAGE_SIZE,
  SEARCH_TYPE_LABELS,
} from '../lib/constants';
import { formatNumber } from '../lib/formatters';
import { normalizeKey } from '../lib/text';
import { subjectLabel } from '../services/queries';
import { BookGrid, BookGridSkeleton } from '../components/BookGrid';
import { Button } from '../components/Button';
import { ActiveFilters, type ActiveFilterItem } from '../components/ActiveFilters';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import {
  FilterPanel,
  type BookFilters,
} from '../components/FilterPanel';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { ResultsSummary } from '../components/ResultsSummary';
import { SearchForm } from '../components/SearchForm';
import { SourceNotice } from '../components/SourceNotice';

type SortOption =
  | 'relevance'
  | 'title'
  | 'year-desc'
  | 'year-asc'
  | 'pages-desc';

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'title', label: 'Título (A–Z)' },
  { value: 'year-desc', label: 'Ano (mais recente)' },
  { value: 'year-asc', label: 'Ano (mais antigo)' },
  { value: 'pages-desc', label: 'Páginas (maior)' },
];

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 1000 ? parsed : undefined;
}

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function compareYears(a: Book, b: Book, direction: 1 | -1): number {
  if (a.year && b.year) return (a.year - b.year) * direction;
  if (a.year) return -1;
  if (b.year) return 1;
  return 0;
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = (searchParams.get('q') ?? '').trim();
  const typeParam = searchParams.get('type');
  const searchType: BookSearchType =
    typeParam === 'title' || typeParam === 'author' || typeParam === 'subject'
      ? typeParam
      : 'all';
  const subjectParam = searchParams.get('subject');
  const subject =
    subjectParam !== null && subjectParam !== ''
      ? subjectParam
      : q
        ? ''
        : 'fiction';
  const category = searchParams.get('category') ?? '';
  const yearFrom = searchParams.get('yearFrom') ?? '';
  const yearTo = searchParams.get('yearTo') ?? '';
  const sortParam = searchParams.get('sort');
  const sort: SortOption = SORT_OPTIONS.some(
    (option) => option.value === sortParam,
  )
    ? (sortParam as SortOption)
    : 'relevance';
  const requestedPage = parsePage(searchParams.get('page'));

  useDocumentTitle(q ? `Explorar: ${q}` : 'Explorar livros');

  const search = useBookSearch({
    query: q,
    searchType,
    subject,
    maxResults: 40,
  });

  const allBooks = useMemo(
    () => search.result?.books ?? [],
    [search.result],
  );

  useEffect(() => {
    if (!filtersOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [filtersOpen]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (key === 'subject') {
      next.set('subject', value ?? '');
    } else if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const updateFilters = (patch: Partial<BookFilters>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (key === 'subject') {
        next.set('subject', value);
      } else if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }
    next.delete('page');
    setSearchParams(next);
  };

  const resetFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    next.delete('yearFrom');
    next.delete('yearTo');
    next.delete('sort');
    next.delete('page');
    next.delete('subject');
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleSearch = (input: {
    query: string;
    searchType: BookSearchType;
  }) => {
    const next = new URLSearchParams(searchParams);
    if (input.query) next.set('q', input.query);
    else next.delete('q');
    if (input.searchType !== 'all') next.set('type', input.searchType);
    else next.delete('type');
    if (input.query && !searchParams.has('subject')) next.delete('subject');
    next.delete('page');
    setFiltersOpen(false);
    setSearchParams(next);
  };

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const book of allBooks) {
      for (const item of book.categories) {
        const key = normalizeKey(item);
        if (key && !map.has(key)) map.set(key, item);
      }
    }
    if (category) {
      const selectedKey = normalizeKey(category);
      if (!map.has(selectedKey)) map.set(selectedKey, category);
    }
    return [...map.values()]
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .slice(0, 40);
  }, [allBooks, category]);

  const fromYear = parsePositiveInt(yearFrom);
  const toYear = parsePositiveInt(yearTo);
  const yearRangeInvalid = Boolean(
    fromYear && toYear && fromYear > toYear,
  );

  const filteredBooks = useMemo(() => {
    const categoryKey = category ? normalizeKey(category) : '';
    return allBooks.filter((book) => {
      if (
        categoryKey &&
        !book.categories.some((item) => normalizeKey(item) === categoryKey)
      ) {
        return false;
      }
      if (!yearRangeInvalid) {
        if (fromYear && (!book.year || book.year < fromYear)) return false;
        if (toYear && (!book.year || book.year > toYear)) return false;
      }
      return true;
    });
  }, [allBooks, category, fromYear, toYear, yearRangeInvalid]);

  const sortedBooks = useMemo(() => {
    const copy = [...filteredBooks];
    switch (sort) {
      case 'title':
        return copy.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
      case 'year-desc':
        return copy.sort((a, b) => compareYears(a, b, -1));
      case 'year-asc':
        return copy.sort((a, b) => compareYears(a, b, 1));
      case 'pages-desc':
        return copy.sort((a, b) => {
          if (a.pageCount && b.pageCount) return b.pageCount - a.pageCount;
          if (a.pageCount) return -1;
          if (b.pageCount) return 1;
          return 0;
        });
      default:
        return copy;
    }
  }, [filteredBooks, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedBooks.length / EXPLORE_PAGE_SIZE),
  );
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * EXPLORE_PAGE_SIZE;
  const visibleBooks = sortedBooks.slice(
    startIndex,
    startIndex + EXPLORE_PAGE_SIZE,
  );

  const activeItems: ActiveFilterItem[] = [];
  if (q) {
    activeItems.push({
      key: 'q',
      label: `Busca: “${q}”`,
      onRemove: () => setParam('q', null),
    });
  }
  if (subject && (q || subject !== 'fiction')) {
    activeItems.push({
      key: 'subject',
      label: `Assunto: ${subjectLabel(subject)}`,
      onRemove: () => setParam('subject', ''),
    });
  }
  if (category) {
    activeItems.push({
      key: 'category',
      label: `Categoria: ${category}`,
      onRemove: () => setParam('category', null),
    });
  }
  if (yearFrom || yearTo) {
    activeItems.push({
      key: 'years',
      label: `Ano: ${yearFrom || '…'}–${yearTo || '…'}`,
      onRemove: () => {
        const next = new URLSearchParams(searchParams);
        next.delete('yearFrom');
        next.delete('yearTo');
        next.delete('page');
        setSearchParams(next);
      },
    });
  }

  const changePage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) next.delete('page');
    else next.set('page', String(page));
    setSearchParams(next);
    const target = document.getElementById('resultados');
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    target?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const contextLabel = q
    ? `Resultados para “${q}”${
        searchType !== 'all' ? ` em ${SEARCH_TYPE_LABELS[searchType]}` : ''
      }`
    : `Universo de ${subjectLabel(subject || 'fiction')}`;

  return (
    <>
      <div className="page-hero page-hero--compact">
        <div className="container">
          <PageHeader
            eyebrow="Catálogo aberto"
            title="Explore livros"
            description="Pesquise por título, autor ou assunto, combine filtros e encontre sua próxima leitura. Cada resultado vem de uma consulta real à API."
          >
            <SearchForm
              key={`${q}:${searchType}`}
              defaultQuery={q}
              defaultType={searchType}
              onSearch={handleSearch}
              requireQuery={false}
              compact
            />
          </PageHeader>
        </div>
      </div>

      <div className="container explore-layout">
        <FilterPanel
          filters={{ category, subject, yearFrom, yearTo }}
          categories={categories}
          onChange={updateFilters}
          onReset={resetFilters}
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          allowAllSubjects={Boolean(q)}
        />

        <section
          className="explore-results"
          id="resultados"
          aria-labelledby="resultados-titulo"
          aria-busy={search.isLoading}
        >
          <h2 className="sr-only" id="resultados-titulo">
            Resultados da busca
          </h2>
          <div className="explore-toolbar">
            <div className="explore-toolbar__left">
              <button
                type="button"
                className="btn btn--secondary btn--sm filters-toggle"
                onClick={() => setFiltersOpen(true)}
                aria-expanded={filtersOpen}
                aria-controls="filtros"
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                <span>Filtros</span>
              </button>
              <p className="explore-context">
                <Compass size={16} aria-hidden="true" />
                <span>{contextLabel}</span>
              </p>
            </div>

            <div className="explore-toolbar__sort">
              <label htmlFor="ordenar-por">
                <ArrowDownUp size={15} aria-hidden="true" />
                Ordenar
              </label>
              <select
                id="ordenar-por"
                value={sort}
                onChange={(event) => setParam('sort', event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ActiveFilters items={activeItems} onClearAll={clearAll} />

          {yearRangeInvalid && (
            <p className="filter-error" role="alert">
              O ano inicial não pode ser maior que o ano final. Ajuste o
              intervalo para aplicar o filtro.
            </p>
          )}

          {search.result && (
            <>
              <ResultsSummary
                loaded={search.result.books.length}
                total={search.result.totalItems}
                source={search.result.source}
                fallbackReason={search.result.fallbackReason}
                filtered={sortedBooks.length}
                page={currentPage}
                pageSize={EXPLORE_PAGE_SIZE}
              />
              <SourceNotice
                source={search.result.source}
                fallbackReason={search.result.fallbackReason}
              />
            </>
          )}

          {search.isLoading && <BookGridSkeleton count={8} />}

          {search.status === 'error' && search.error && (
            <ErrorState error={search.error} onRetry={search.retry} />
          )}

          {search.status === 'success' &&
            search.result &&
            search.result.books.length === 0 && (
              <EmptyState
                icon={<SearchX size={28} />}
                eyebrow="Sem resultados"
                title="Nenhum livro encontrado"
                description="A API não retornou registros para esta consulta. Tente outro termo, outro tipo de busca ou um assunto diferente."
              >
                <Button variant="primary" onClick={clearAll}>
                  Limpar busca e filtros
                </Button>
              </EmptyState>
            )}

          {search.status === 'success' &&
            search.result &&
            search.result.books.length > 0 &&
            sortedBooks.length === 0 && (
              <EmptyState
                icon={<SearchX size={28} />}
                eyebrow="Filtros ativos"
                title="Nenhum livro atende a esses filtros"
                description="Os livros foram carregados, mas nenhum corresponde à combinação de categoria e ano selecionada. Limpe os filtros para ver a amostra completa."
              >
                <Button variant="primary" onClick={resetFilters}>
                  Limpar filtros
                </Button>
              </EmptyState>
            )}

          {search.status === 'success' && sortedBooks.length > 0 && (
            <>
              <BookGrid books={visibleBooks} priorityCount={4} />
              <div className="explore-pagination">
                <p>
                  Mostrando {formatNumber(startIndex + 1)}–
                  {formatNumber(startIndex + visibleBooks.length)} de{' '}
                  {formatNumber(sortedBooks.length)} livros
                </p>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={changePage}
                />
              </div>
            </>
          )}

          <p className="section-footnote">
            A consulta carrega até 40 registros da API. A paginação e os filtros
            de categoria/ano são aplicados sobre essa amostra; a API pode
            informar um total maior. Fonte e limitações aparecem no resumo acima.
          </p>
        </section>
      </div>
    </>
  );
}
