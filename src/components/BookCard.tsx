import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Book } from '../types/book';
import { useLibrary } from '../hooks/useLibrary';
import { useToast } from '../hooks/useToast';
import { formatAuthors, formatPages } from '../lib/formatters';
import { BookCover } from './BookCover';
import { IconButton } from './IconButton';

interface BookCardProps {
  book: Book;
  priority?: boolean;
}

export function BookCard({ book, priority = false }: BookCardProps) {
  const { isSaved, addBook, removeBook, restoreEntry } = useLibrary();
  const { showToast } = useToast();
  const saved = isSaved(book.id);
  const detailPath = `/livro/${book.source}/${encodeURIComponent(book.sourceId)}`;

  const toggleSaved = () => {
    if (saved) {
      const removed = removeBook(book.id);
      if (removed) {
        showToast({
          message: `“${book.title}” foi removido da sua biblioteca.`,
          tone: 'info',
          action: {
            label: 'Desfazer',
            onClick: () => restoreEntry(removed),
          },
        });
      }
      return;
    }

    addBook(book, 'want');
    showToast({
      message: `“${book.title}” foi salvo em Quero ler.`,
      tone: 'success',
    });
  };

  const meta = [book.year, book.pageCount ? formatPages(book.pageCount) : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="book-card">
      <div className="book-card__cover-wrap">
        <Link
          to={detailPath}
          className="book-card__cover-link"
          aria-label={`Ver detalhes de ${book.title}`}
        >
          <BookCover book={book} eager={priority} />
        </Link>
        <IconButton
          label={
            saved
              ? `Remover ${book.title} da biblioteca`
              : `Adicionar ${book.title} à biblioteca`
          }
          aria-pressed={saved}
          className={`book-card__heart${saved ? ' is-saved' : ''}`}
          onClick={toggleSaved}
        >
          <Heart
            size={18}
            fill={saved ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </IconButton>
      </div>

      <div className="book-card__body">
        <span className="book-card__category">
          {book.categories[0] ?? 'Sem categoria informada'}
        </span>
        <h3 className="book-card__title">
          <Link to={detailPath}>{book.title}</Link>
        </h3>
        <p className="book-card__authors">
          {formatAuthors(book.authors) || 'Autor não informado pela API'}
        </p>
        {meta && <p className="book-card__meta">{meta}</p>}
      </div>
    </article>
  );
}

export function BookCardSkeleton() {
  return (
    <article className="book-card book-card--skeleton" aria-hidden="true">
      <div className="book-card__cover-wrap">
        <div className="book-cover book-cover--md skeleton-block" />
      </div>
      <div className="book-card__body">
        <span className="skeleton-line skeleton-line--short" />
        <span className="skeleton-line" />
        <span className="skeleton-line skeleton-line--medium" />
        <span className="skeleton-line skeleton-line--short" />
      </div>
    </article>
  );
}
