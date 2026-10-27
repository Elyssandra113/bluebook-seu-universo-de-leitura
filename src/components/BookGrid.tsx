import type { Book } from '../types/book';
import { BookCard, BookCardSkeleton } from './BookCard';

interface BookGridProps {
  books: Book[];
  priorityCount?: number;
}

export function BookGrid({ books, priorityCount = 0 }: BookGridProps) {
  return (
    <ul className="book-grid" aria-label="Livros">
      {books.map((book, index) => (
        <li key={book.id} className="book-grid__item">
          <BookCard book={book} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="book-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="book-grid__item">
          <BookCardSkeleton />
        </div>
      ))}
    </div>
  );
}
