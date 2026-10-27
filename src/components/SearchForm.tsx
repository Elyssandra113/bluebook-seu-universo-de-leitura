import { useId, useState, type FormEvent } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import type { BookSearchType } from '../types/book';
import { SEARCH_TYPE_OPTIONS } from '../lib/constants';

interface SearchFormProps {
  defaultQuery?: string;
  defaultType?: BookSearchType;
  onSearch: (input: { query: string; searchType: BookSearchType }) => void;
  requireQuery?: boolean;
  compact?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

export function SearchForm({
  defaultQuery = '',
  defaultType = 'all',
  onSearch,
  requireQuery = true,
  compact = false,
  autoFocus = false,
  placeholder = 'Título, autor ou assunto…',
}: SearchFormProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [type, setType] = useState<BookSearchType>(defaultType);
  const [error, setError] = useState('');
  const inputId = useId();
  const selectId = useId();
  const errorId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (requireQuery && !trimmed) {
      setError('Digite um título, autor ou assunto para começar.');
      return;
    }
    setError('');
    onSearch({ query: trimmed, searchType: type });
  };

  return (
    <form
      className={`search-form${compact ? ' search-form--compact' : ''}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="search-form__field">
        <label className="sr-only" htmlFor={inputId}>
          Buscar livros
        </label>
        <Search
          className="search-form__icon"
          size={20}
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (error) setError('');
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
        />
      </div>

      <div className="search-form__divider" aria-hidden="true" />

      <div className="search-form__select">
        <label className="sr-only" htmlFor={selectId}>
          Buscar por
        </label>
        <select
          id={selectId}
          value={type}
          onChange={(event) =>
            setType(event.target.value as BookSearchType)
          }
        >
          {SEARCH_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="search-form__submit">
        <span>Buscar</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      {error && (
        <p id={errorId} className="search-form__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
