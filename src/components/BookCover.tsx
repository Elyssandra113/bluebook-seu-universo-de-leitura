import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { Book } from '../types/book';
import { coverAlt } from '../lib/formatters';
import { getInitials, truncate } from '../lib/text';

interface BookCoverProps {
  book: Pick<Book, 'title' | 'thumbnail'>;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  eager?: boolean;
  className?: string;
}

interface ImageState {
  src: string | undefined;
  failed: boolean;
  loaded: boolean;
}

export function BookCover({
  book,
  size = 'md',
  eager = false,
  className,
}: BookCoverProps) {
  const [imageState, setImageState] = useState<ImageState>({
    src: book.thumbnail,
    failed: false,
    loaded: false,
  });

  const currentState: ImageState =
    imageState.src === book.thumbnail
      ? imageState
      : { src: book.thumbnail, failed: false, loaded: false };

  const showFallback = !book.thumbnail || currentState.failed;

  return (
    <div
      className={['book-cover', `book-cover--${size}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {showFallback ? (
        <div
          className="book-cover__fallback"
          role="img"
          aria-label={`Capa indisponível para ${book.title}`}
        >
          <span className="book-cover__initials">
            {getInitials(book.title)}
          </span>
          <BookOpen
            className="book-cover__fallback-icon"
            size={22}
            aria-hidden="true"
          />
          <span className="book-cover__fallback-title">
            {truncate(book.title, 64)}
          </span>
        </div>
      ) : (
        <>
          {!currentState.loaded && (
            <span className="book-cover__skeleton" aria-hidden="true" />
          )}
          <img
            src={book.thumbnail}
            alt={coverAlt(book.title)}
            className={`book-cover__image${currentState.loaded ? ' is-loaded' : ''}`}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() =>
              setImageState({
                src: book.thumbnail,
                failed: false,
                loaded: true,
              })
            }
            onError={() =>
              setImageState({
                src: book.thumbnail,
                failed: true,
                loaded: false,
              })
            }
          />
        </>
      )}
    </div>
  );
}
