import { Heart, Trash2 } from 'lucide-react';
import type { Book, ReadingStatus } from '../types/book';
import { useLibrary } from '../hooks/useLibrary';
import { useToast } from '../hooks/useToast';
import { formatStatus } from '../lib/formatters';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';

interface LibraryActionsProps {
  book: Book;
}

export function LibraryActions({ book }: LibraryActionsProps) {
  const {
    getEntry,
    addBook,
    setStatus,
    removeBook,
    restoreEntry,
  } = useLibrary();
  const { showToast } = useToast();
  const entry = getEntry(book.id);

  const handleAdd = () => {
    addBook(book, 'want');
    showToast({
      message: `“${book.title}” foi salvo em Quero ler.`,
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

  if (!entry) {
    return (
      <div className="library-actions">
        <Button
          variant="primary"
          size="lg"
          icon={<Heart size={18} />}
          onClick={handleAdd}
        >
          Adicionar à biblioteca
        </Button>
        <p className="library-actions__hint">
          Salvo apenas neste navegador. Sem conta, sem servidor.
        </p>
      </div>
    );
  }

  return (
    <div className="library-actions library-actions--saved">
      <div className="library-actions__status">
        <StatusBadge status={entry.status} />
        <label htmlFor="status-leitura">Marcar como</label>
        <select
          id="status-leitura"
          value={entry.status}
          onChange={(event) => {
            const status = event.target.value as ReadingStatus;
            setStatus(book.id, status);
            showToast({
              message: `Status atualizado para “${formatStatus(status)}”.`,
              tone: 'success',
            });
          }}
        >
          <option value="want">Quero ler</option>
          <option value="reading">Lendo</option>
          <option value="finished">Concluído</option>
        </select>
      </div>
      <Button
        variant="ghost"
        size="md"
        icon={<Trash2 size={16} />}
        onClick={handleRemove}
      >
        Remover
      </Button>
    </div>
  );
}
