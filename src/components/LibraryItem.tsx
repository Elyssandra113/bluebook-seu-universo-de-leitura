import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useId } from 'react';
import type { LibraryEntry, ReadingStatus } from '../types/book';
import { useLibrary } from '../hooks/useLibrary';
import { useToast } from '../hooks/useToast';
import {
  formatAuthors,
  formatDateTime,
  formatPages,
  formatStatus,
} from '../lib/formatters';
import { BookCover } from './BookCover';

export function LibraryItem({ entry }: { entry: LibraryEntry }) {
  const { setStatus, removeBook, restoreEntry } = useLibrary();
  const { showToast } = useToast();
  const selectId = useId();
  const { book } = entry;

  const handleStatus = (status: ReadingStatus) => {
    setStatus(book.id, status);
    showToast({
      message: `“${book.title}” agora está em “${formatStatus(status)}”.`,
      tone: 'success',
    });
  };

  const handleRemove = () => {
    const removed = removeBook(book.id);
    if (!removed) return;
    showToast({
      message: `“${book.title}” foi removido da sua biblioteca.`,
      tone: 'info',
      action: {
        label: 'Desfazer',
        onClick: () => restoreEntry(removed),
      },
    });
  };

  return (
    <article className="library-card">
      <Link
        to={`/livro/${book.source}/${encodeURIComponent(book.sourceId)}`}
        className="library-card__cover"
        aria-label={`Ver detalhes de ${book.title}`}
      >
        <BookCover book={book} size="sm" />
      </Link>

      <div className="library-card__body">
        <span className="book-card__category">
          {book.categories[0] ?? 'Sem categoria informada'}
        </span>
        <h2 className="library-card__title">
          <Link
            to={`/livro/${book.source}/${encodeURIComponent(book.sourceId)}`}
          >
            {book.title}
          </Link>
        </h2>
        <p className="library-card__authors">
          {formatAuthors(book.authors) || 'Autor não informado pela API'}
        </p>
        {(book.year || book.pageCount) && (
          <p className="library-card__meta">
            {[book.year, book.pageCount ? formatPages(book.pageCount) : '']
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

        <div className="library-card__actions">
          <div className="library-card__status">
            <label htmlFor={selectId} className="sr-only">
              Status de leitura de {book.title}
            </label>
            <select
              id={selectId}
              value={entry.status}
              onChange={(event) =>
                handleStatus(event.target.value as ReadingStatus)
              }
            >
              <option value="want">Quero ler</option>
              <option value="reading">Lendo</option>
              <option value="finished">Concluído</option>
            </select>
          </div>
          <button
            type="button"
            className="library-card__remove"
            onClick={handleRemove}
            aria-label={`Remover ${book.title} da biblioteca`}
          >
            <Trash2 size={16} aria-hidden="true" />
            <span>Remover</span>
          </button>
        </div>

        <p className="library-card__added">
          Adicionado em {formatDateTime(entry.addedAt)}
        </p>
      </div>
    </article>
  );
}
