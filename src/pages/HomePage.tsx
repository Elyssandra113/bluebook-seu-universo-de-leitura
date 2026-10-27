import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  Compass,
  LibraryBig,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { BookSearchType } from '../types/book';
import { useBookSearch } from '../hooks/useBookSearch';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLibrary } from '../hooks/useLibrary';
import { analyzeBooks } from '../data/analysis';
import { formatNumber } from '../lib/formatters';
import { SUBJECT_OPTIONS } from '../lib/constants';
import { BookCover } from '../components/BookCover';
import { BookGrid, BookGridSkeleton } from '../components/BookGrid';
import { ButtonLink } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { SearchForm } from '../components/SearchForm';
import { SectionHeader } from '../components/SectionHeader';
import { SourceNotice } from '../components/SourceNotice';
import { StatCard } from '../components/StatCard';

const HOME_SUBJECTS = SUBJECT_OPTIONS.filter((subject) =>
  ['fiction', 'fantasy', 'science', 'history', 'biography', 'poetry'].includes(
    subject.value,
  ),
);

const UNIVERSE_ICONS = {
  fiction: BookMarked,
  fantasy: Sparkles,
  science: Compass,
  history: TrendingUp,
  biography: LibraryBig,
  poetry: BookMarked,
} as const;

export function HomePage() {
  useDocumentTitle();
  const navigate = useNavigate();
  const { counts } = useLibrary();
  const featured = useBookSearch({
    query: '',
    subject: 'fiction',
    maxResults: 8,
  });

  const analysis = useMemo(() => {
    if (!featured.result) return null;
    return analyzeBooks(featured.result.books, {
      queryLabel: featured.result.queryLabel,
      apiQuery: featured.result.apiQuery,
      source: featured.result.source,
      fetchedAt: featured.result.fetchedAt,
      totalItems: featured.result.totalItems,
      fallbackReason: featured.result.fallbackReason,
    });
  }, [featured.result]);

  const heroBooks = featured.result?.books.slice(0, 3) ?? [];

  const handleSearch = (input: {
    query: string;
    searchType: BookSearchType;
  }) => {
    const params = new URLSearchParams();
    if (input.query) params.set('q', input.query);
    if (input.searchType !== 'all') params.set('type', input.searchType);
    navigate(`/explorar${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero__backdrop" aria-hidden="true">
          <span className="hero__orb hero__orb--one" />
          <span className="hero__orb hero__orb--two" />
          <span className="hero__grid" />
        </div>

        <div className="container hero__inner">
          <div className="hero__content">
            <p className="hero__eyebrow">
              <Sparkles size={15} aria-hidden="true" />
              Leitura, descoberta e dados
            </p>
            <h1 className="hero__title">
              Descubra seu <em>próximo universo</em>
            </h1>
            <p className="hero__subtitle">
              Explore histórias, autores e conhecimentos reais. Monte uma
              biblioteca pessoal e veja o que os dados revelam sobre o mundo
              dos livros.
            </p>

            <SearchForm onSearch={handleSearch} />

            <div className="hero__actions">
              <ButtonLink
                to="/explorar"
                variant="primary"
                size="lg"
                icon={<Compass size={18} />}
              >
                Explorar livros
              </ButtonLink>
              <ButtonLink
                to="/dados"
                variant="ghost"
                size="lg"
                icon={<BarChart3 size={18} />}
              >
                Conhecer as estatísticas
              </ButtonLink>
            </div>

            <ul className="hero__trust">
              <li>Busca real na Google Books API</li>
              <li>Favoritos salvos no navegador</li>
              <li>Gráficos com dados recebidos</li>
            </ul>
          </div>

          <div className="hero__visual" aria-label="Destaques literários">
            <div className="hero__covers">
              {heroBooks.length > 0 ? (
                heroBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className={`hero__cover hero__cover--${index + 1}`}
                  >
                    <BookCover book={book} size="lg" eager={index === 0} />
                  </div>
                ))
              ) : featured.isLoading ? (
                <>
                  <div className="hero__cover hero__cover--1 skeleton-block" />
                  <div className="hero__cover hero__cover--2 skeleton-block" />
                  <div className="hero__cover hero__cover--3 skeleton-block" />
                </>
              ) : (
                <>
                  <div className="hero__cover hero__cover--1 hero__cover--empty">
                    <span>Ficção</span>
                  </div>
                  <div className="hero__cover hero__cover--2 hero__cover--empty">
                    <span>Fantasia</span>
                  </div>
                  <div className="hero__cover hero__cover--3 hero__cover--empty">
                    <span>Ciência</span>
                  </div>
                </>
              )}
            </div>

            <div className="hero__floating-card">
              <span className="hero__floating-icon" aria-hidden="true">
                <LibraryBig size={18} />
              </span>
              <div>
                <p className="hero__floating-label">Sua estante</p>
                <p className="hero__floating-value">
                  {counts.total > 0
                    ? `${formatNumber(counts.total)} ${
                        counts.total === 1 ? 'livro salvo' : 'livros salvos'
                      }`
                    : 'Pronta para a primeira história'}
                </p>
              </div>
              <ButtonLink
                to="/biblioteca"
                variant="ghost"
                size="sm"
                aria-label="Abrir minha biblioteca"
              >
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="destaques-titulo">
        <div className="container">
          <SectionHeader
            eyebrow="Prateleira em destaque"
            title="Histórias para começar"
            description="Uma amostra real de ficção consultada agora na API. As capas e os metadados vêm dos registros retornados."
            id="destaques-titulo"
            action={
              <ButtonLink
                to="/explorar"
                variant="ghost"
                icon={<ArrowRight size={16} />}
              >
                Ver todos
              </ButtonLink>
            }
          />

          {featured.result && (
            <SourceNotice
              source={featured.result.source}
              fallbackReason={featured.result.fallbackReason}
            />
          )}

          {featured.isLoading && <BookGridSkeleton count={8} />}

          {featured.status === 'error' && featured.error && (
            <ErrorState
              error={featured.error}
              onRetry={featured.retry}
              title="Os destaques não puderam ser carregados"
            />
          )}

          {featured.status === 'success' &&
            featured.result &&
            featured.result.books.length === 0 && (
              <EmptyState
                title="Nenhum destaque disponível agora"
                description="A API respondeu sem registros para esta consulta. Tente explorar outro assunto."
              >
                <ButtonLink to="/explorar" variant="primary">
                  Explorar o acervo
                </ButtonLink>
              </EmptyState>
            )}

          {featured.status === 'success' &&
            featured.result &&
            featured.result.books.length > 0 && (
              <>
                <BookGrid
                  books={featured.result.books.slice(0, 8)}
                  priorityCount={4}
                />
                <p className="section-footnote">
                  Amostra de até 8 registros da consulta “ficção”. Não representa
                  todo o mercado editorial.
                </p>
              </>
            )}
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="dados-home">
        <div className="container">
          <div className="home-data">
            <div className="home-data__intro">
              <p className="eyebrow">Leitura em números</p>
              <h2 id="dados-home">
                O universo literário também se lê com dados
              </h2>
              <p>
                A mesma amostra de destaques alimenta indicadores calculados em
                tempo real. Sem números inventados: apenas o que a API
                devolveu.
              </p>
              <ButtonLink
                to="/dados"
                variant="primary"
                icon={<BarChart3 size={17} />}
              >
                Abrir painel de análise
              </ButtonLink>
            </div>

            <div className="home-data__stats">
              <StatCard
                label="Livros únicos"
                value={analysis?.uniqueCount ?? '—'}
                hint="Após normalização e deduplicação"
                icon={<BookMarked size={18} />}
              />
              <StatCard
                label="Categorias"
                value={analysis?.categoryCount ?? '—'}
                hint="Distintas na amostra"
                icon={<Compass size={18} />}
                tone="navy"
              />
              <StatCard
                label="Autores"
                value={analysis?.authorCount ?? '—'}
                hint="Contagem por livro"
                icon={<LibraryBig size={18} />}
                tone="green"
              />
              <StatCard
                label="Anos cobertos"
                value={
                  analysis?.yearsRange
                    ? `${analysis.yearsRange.min}–${analysis.yearsRange.max}`
                    : '—'
                }
                hint="Quando o ano está disponível"
                icon={<TrendingUp size={18} />}
                tone="amber"
              />
            </div>
          </div>
          <p className="section-footnote">
            Indicadores calculados sobre os destaques exibidos acima. O painel
            completo usa uma consulta própria de até 40 registros.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="universos-titulo">
        <div className="container">
          <SectionHeader
            eyebrow="Explore por assunto"
            title="Escolha um universo"
            description="Cada porta leva a uma consulta real por assunto. Você pode refinar por categoria e ano na página de exploração."
            id="universos-titulo"
          />
          <div className="universe-grid">
            {HOME_SUBJECTS.map((subject) => {
              const Icon =
                UNIVERSE_ICONS[
                  subject.value as keyof typeof UNIVERSE_ICONS
                ] ?? BookMarked;
              return (
                <Link
                  key={subject.value}
                  className="universe-card"
                  to={`/explorar?subject=${encodeURIComponent(subject.value)}`}
                >
                  <span className="universe-card__icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <span>
                    <strong>{subject.label}</strong>
                    <span>{subject.description}</span>
                  </span>
                  <ArrowRight
                    className="universe-card__arrow"
                    size={18}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--navy" aria-labelledby="como-funciona">
        <div className="container">
          <SectionHeader
            eyebrow="Como funciona"
            title="Três passos entre a curiosidade e a leitura"
            description="O BlueBook conecta descoberta, organização pessoal e leitura crítica de dados em um único lugar."
            id="como-funciona"
          />
          <ol className="steps">
            <li className="step">
              <span className="step__number">01</span>
              <span className="step__icon" aria-hidden="true">
                <Search size={22} />
              </span>
              <h3>Busque e descubra</h3>
              <p>
                Pesquise por título, autor ou assunto e receba capas e
                metadados reais da API.
              </p>
            </li>
            <li className="step">
              <span className="step__number">02</span>
              <span className="step__icon" aria-hidden="true">
                <LibraryBig size={22} />
              </span>
              <h3>Monte sua biblioteca</h3>
              <p>
                Salve livros como “Quero ler”, “Lendo” ou “Concluído”. Tudo fica
                no seu navegador.
              </p>
            </li>
            <li className="step">
              <span className="step__number">03</span>
              <span className="step__icon" aria-hidden="true">
                <BarChart3 size={22} />
              </span>
              <h3>Leia os dados</h3>
              <p>
                Veja categorias, anos e autores mais frequentes na amostra, com
                metodologia e limitações.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="home-quote">
        <div className="container home-quote__inner">
          <p className="eyebrow">Uma biblioteca feita de escolhas</p>
          <blockquote>
            “Ler é habitar outros mundos sem sair do lugar.”
          </blockquote>
          <p>
            Comece pela próxima capa. O resto vira história — e, no BlueBook,
            também vira dado.
          </p>
          <div className="home-quote__actions">
            <ButtonLink
              to="/explorar"
              variant="primary"
              size="lg"
              icon={<Compass size={18} />}
            >
              Encontrar meu próximo livro
            </ButtonLink>
            <ButtonLink to="/dados" variant="secondary" size="lg">
              Ver dados e tendências
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
