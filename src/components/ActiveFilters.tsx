import { Chip } from './Chip';

export interface ActiveFilterItem {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  items: ActiveFilterItem[];
  onClearAll?: () => void;
}

export function ActiveFilters({ items, onClearAll }: ActiveFiltersProps) {
  if (items.length === 0) return null;

  return (
    <div className="active-filters" aria-label="Filtros ativos">
      <span className="active-filters__label">Filtros ativos:</span>
      {items.map((item) => (
        <Chip
          key={item.key}
          onRemove={item.onRemove}
          removeLabel={`Remover filtro ${item.label}`}
        >
          {item.label}
        </Chip>
      ))}
      {onClearAll && items.length > 1 && (
        <button
          type="button"
          className="active-filters__clear"
          onClick={onClearAll}
        >
          Limpar tudo
        </button>
      )}
    </div>
  );
}
