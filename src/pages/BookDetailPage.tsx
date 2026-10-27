import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight,
  ExternalLink,
  Info,
  Star,
} from 'lucide-react';
import type { BookSource } from '../types/book';
import { useBookDetail } from '../hooks/useBookDetail';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLibrary } from '../hooks/useLibrary';
import {
  formatAuthors,
  formatDate,
  formatLanguage,
  formatPages,
  formatRating,
  formatSource,
} from '../lib/formatters';
import { toParagraphs, truncate } from '../lib/text';
import { BookCover } from '../components/BookCover';
import { Button, ButtonLink } from '../components/Button';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LibraryActions } from '../components/LibraryActions';
import { SourceBadge } from '../components/SourceBadge';

function isValidSource(value: string | undefined): value is BookSource {
  return value === 'google' || value === 'openlibrary';
}

export function BookDetailPage() {
  const { source, sourceId } = useParams<{
    source: string;
    sourceId: string;
  }>();
  const validSource = isValidSource(source) ? source : undefined;
  const detail = useBookDetail(validSource, sourceId);
  const { getEntry } = useLibrary();
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);

  const libraryEntry =
    validSource && sourceId
      ? getEntry(`${validSource}:${sourceId}`)
      : undefined;
  const book = detail.result?.book ?? libraryEntry?.book;
  const title = book?.title ?? 'Detalhes do livro';
  const expanded = Boolean(book && expandedBookId === book.id);

  useDocumentTitle(title);

  if (!validSource || !sourceId) {
    return (
      <div className="container detail-page">
        <EmptyState
          eyebrow="Endereço incompleto"
          title="Não foi possível identificar este livro"
          description="O endereço não contém uma fonte e um identificador válidos. Volte ao catálogo e escolha um livro."
        >
          <ButtonLink to="/explorar" variant="primary">
            Explorar livros
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  if (detail.status === 'loading' && !book) {
    return (
      <div className="container detail-page">
        <div
          className="detail-skeleton"
          aria-busy="true"
          aria-label="Carregando detalhes do livro"
        >
          <div className="detail-skeleton__cover skeleton-block" />
          <div className="detail-skeleton__info">
            <span className="skeleton-line skeleton-line--short" />
            <span className="skeleton-line skeleton-line--title" />
            <span className="skeleton-line skeleton-line--medium" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
            <span className="skeleton-line skeleton-line--medium" />
          </div>
        </div>
      </div>
    );
  }

  if (detail.status === 'error' && !book) {
    return (
      <div className="container detail-page">
        <nav className="breadcrumbs" aria-label="Trilha de navegação">
          <Link to="/">Início</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link to="/explorar">Explorar</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">Livro</span>
        </nav>
        <ErrorState
          error={detail.error}
          onRetry={detail.retry}
          title="Não foi possível carregar este livro"
        />
        <div className="detail-error-actions">
          <ButtonLink to="/explorar" variant="secondary">
            Voltar para o catálogo
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container detail-page">
        <EmptyState
          title="Livro não encontrado"
          description="A API não retornou dados para este identificador. Ele pode ter sido removido ou o endereço pode estar incorreto."
        >
          <ButtonLink to="/explorar" variant="primary">
            Explorar livros
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const paragraphs = book.description ? toParagraphs(book.description) : [];
  const descriptionIsLong =
    paragraphs.length > 3 || paragraphs.join(' ').length > 900;
  const visibleParagraphs = expanded ? paragraphs : paragraphs.slice(0, 3);
  const authors = formatAuthors(book.authors);
  const hasRating = Boolean(book.averageRating);
  const incomplete = detail.result?.detailIncomplete;

  return (
    <div className="container detail-page">
      <nav className="breadcrumbs" aria-label="Trilha de navegação">
        <Link to="/">Início</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link to="/explorar">Explorar</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{truncate(book.title, 52)}</span>
      </nav>

      {(incomplete || (detail.status === 'error' && book)) && (
        <div className="detail-notice" role="status">
          <Info size={18} aria-hidden="true" />
          <p>
            Não foi possível atualizar todos os detalhes agora. Exibindo os
            dados disponíveis na consulta ou na sua biblioteca.
          </p>
          {detail.status === 'error' && (
            <Button variant="ghost" size="sm" onClick={detail.retry}>
              Tentar atualizar
            </Button>
          )}
        </div>
      )}

      <div className="detail-hero">
        <div className="detail-cover">
          <BookCover book={book} size="hero" eager />
          <p className="detail-cover__source">
            <SourceBadge source={book.source} />
          </p>
        </div>

        <div className="detail-info">
          <div className="detail-badges">
            {book.categories.length > 0 ? (
              book.categories.map((category) => (
                <Chip key={category} tone="neutral">
                  {category}
                </Chip>
              ))
            ) : (
              <Chip tone="neutral">Categoria não informada</Chip>
            )}
          </div>

          <h1 className="detail-title">{book.title}</h1>
          {book.subtitle && <p className="detail-subtitle">{book.subtitle}</p>}
          <p className="detail-authors">
            {authors || 'Autor não informado pela API'}
          </p>

          {hasRating && (
            <p className="detail-rating">
              <Star size={17} fill="currentColor" aria-hidden="true" />
              <span>{formatRating(book.averageRating, book.ratingsCount)}</span>
            </p>
          )}

          <LibraryActions book={book} />

          {book.previewLink && (
            <a
              className="btn btn--secondary btn--md detail-preview"
              href={book.previewLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>
                Ver {book.source === 'google' ? 'no Google Books' : 'na Open Library'}
              </span>
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          )}

          <dl className="detail-meta">
            <div>
              <dt>Editora</dt>
              <dd>
                {book.publisher ?? (
                  <span className="meta-missing">Não informada pela API</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Publicação</dt>
              <dd>
                {book.publishedDate ? (
                  formatDate(book.publishedDate)
                ) : (
                  <span className="meta-missing">Não informada pela API</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Páginas</dt>
              <dd>
                {book.pageCount ? (
                  formatPages(book.pageCount)
                ) : (
                  <span className="meta-missing">Não informadas pela API</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Idioma</dt>
              <dd>
                {book.language ? (
                  formatLanguage(book.language)
                ) : (
                  <span className="meta-missing">Não informado pela API</span>
                )}
              </dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>
                {book.isbn ?? (
                  <span className="meta-missing">Não informado pela API</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Fonte</dt>
              <dd>{formatSource(book.source)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="detail-description" aria-labelledby="sinopse">
        <p className="eyebrow">Sobre o livro</p>
        <h2 id="sinopse">Sinopse</h2>
        {paragraphs.length > 0 ? (
          <>
            <div className="detail-description__text">
              {visibleParagraphs.map((paragraph, index) => (
                <p key={`${book.id}-p-${index}`}>{paragraph}</p>
              ))}
            </div>
            {descriptionIsLong && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setExpandedBookId(expanded ? null : (book?.id ?? null))
                }
                aria-expanded={expanded}
              >
                {expanded ? 'Mostrar menos' : 'Ler descrição completa'}
              </Button>
            )}
          </>
        ) : (
          <p className="detail-description__empty">
            A API não forneceu uma descrição para este livro. Outros metadados
            disponíveis estão acima.
          </p>
        )}
      </section>

      <section className="detail-cta" aria-labelledby="continuar">
        <div>
          <p className="eyebrow">Próxima página</p>
          <h2 id="continuar">Continue explorando</h2>
          <p>
            Volte ao catálogo para combinar outros assuntos e filtros, ou veja
            como este livro se encaixa nos dados da amostra.
          </p>
        </div>
        <div className="detail-cta__actions">
          <ButtonLink to="/explorar" variant="primary">
            Explorar mais livros
          </ButtonLink>
          <ButtonLink to="/dados" variant="secondary">
            Ver análise de dados
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
