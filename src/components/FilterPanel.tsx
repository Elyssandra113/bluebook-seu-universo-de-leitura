import { SlidersHorizontal, X } from 'lucide-react';
import { SUBJECT_OPTIONS } from '../lib/constants';

const CURRENT_YEAR = new Date().getFullYear();

export interface BookFilters {
  category: string;
  subject: string;
  yearFrom: string;
  yearTo: string;
}

interface FilterPanelProps {
  filters: BookFilters;
  categories: string[];
  onChange: (next: Partial<BookFilters>) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
  allowAllSubjects?: boolean;
}

export function FilterPanel({
  filters,
  categories,
  onChange,
  onReset,
  isOpen,
  onClose,
  allowAllSubjects = true,
}: FilterPanelProps) {
  const currentYear = CURRENT_YEAR;
  const hasFilters = Boolean(
    filters.category || filters.subject || filters.yearFrom || filters.yearTo,
  );

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="filters-backdrop"
          aria-label="Fechar filtros"
          onClick={onClose}
        />
      )}
      <aside
        className={`filters${isOpen ? ' is-open' : ''}`}
        id="filtros"
        aria-label="Filtros de livros"
      >
        <div className="filters__header">
          <div>
            <p className="eyebrow">Refinar</p>
            <h2 className="filters__title">Filtros</h2>
          </div>
          <button
            type="button"
            className="filters__close"
            onClick={onClose}
            aria-label="Fechar filtros"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="field">
          <label htmlFor="filtro-assunto">Assunto</label>
          <select
            id="filtro-assunto"
            value={filters.subject}
            onChange={(event) => onChange({ subject: event.target.value })}
          >
            <option value="" disabled={!allowAllSubjects}>
              Todos os assuntos
            </option>
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="field__hint">
            {allowAllSubjects
              ? 'O assunto é enviado diretamente à API.'
              : 'Com a busca vazia, escolha um assunto para consultar.'}
          </p>
        </div>

        <div className="field">
          <label htmlFor="filtro-categoria">Categoria</label>
          <select
            id="filtro-categoria"
            value={filters.category}
            onChange={(event) => onChange({ category: event.target.value })}
            disabled={categories.length === 0}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <p className="field__hint">
            Categorias disponíveis nos livros já carregados.
          </p>
        </div>

        <fieldset className="field field--group">
          <legend>Ano de publicação</legend>
          <div className="field-row">
            <div>
              <label htmlFor="filtro-ano-de" className="field__sublabel">
                De
              </label>
              <input
                id="filtro-ano-de"
                type="number"
                inputMode="numeric"
                min={1000}
                max={currentYear}
                placeholder="1990"
                value={filters.yearFrom}
                onChange={(event) =>
                  onChange({ yearFrom: event.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="filtro-ano-ate" className="field__sublabel">
                Até
              </label>
              <input
                id="filtro-ano-ate"
                type="number"
                inputMode="numeric"
                min={1000}
                max={currentYear}
                placeholder={String(currentYear)}
                value={filters.yearTo}
                onChange={(event) => onChange({ yearTo: event.target.value })}
              />
            </div>
          </div>
          <p className="field__hint">
            Aplicado aos registros que possuem ano informado.
          </p>
        </fieldset>

        <div className="filters__footer">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={onReset}
            disabled={!hasFilters}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span>Limpar filtros</span>
          </button>
        </div>
      </aside>
    </>
  );
}
