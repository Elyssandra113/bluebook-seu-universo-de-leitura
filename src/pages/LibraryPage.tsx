import { useState } from 'react';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Download,
  Info,
  LibraryBig,
  ShieldCheck,
} from 'lucide-react';
import type { ReadingStatus } from '../types/book';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLibrary } from '../hooks/useLibrary';
import { useToast } from '../hooks/useToast';
import { booksToCsv, downloadCsv } from '../lib/csv';
import { formatNumber, pluralize } from '../lib/formatters';
import { Button, ButtonLink } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { LibraryItem } from '../components/LibraryItem';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';

type LibraryFilter = 'all' | ReadingStatus;

const TABS: Array<{ value: LibraryFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'want', label: 'Quero ler' },
  { value: 'reading', label: 'Lendo' },
  { value: 'finished', label: 'Concluído' },
];

export function LibraryPage() {
  useDocumentTitle('Minha biblioteca');
  const { entries, counts, storageError } = useLibrary();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<LibraryFilter>('all');

  const filteredEntries =
    filter === 'all'
      ? entries
      : entries.filter((entry) => entry.status === filter);

  const handleExport = () => {
    if (entries.length === 0) return;
    downloadCsv(
      booksToCsv(entries.map((entry) => entry.book)),
      'bluebook-minha-biblioteca.csv',
    );
    showToast({
      message: 'Biblioteca exportada em CSV.',
      tone: 'success',
    });
  };

  const emptyTitle =
    filter === 'all'
      ? 'Sua biblioteca começa aqui'
      : `Nenhum livro em “${TABS.find((tab) => tab.value === filter)?.label}”`;
  const emptyDescription =
    filter === 'all'
      ? 'Salve livros enquanto explora o catálogo. Eles ficam guardados neste navegador e podem ser organizados por status de leitura.'
      : 'Troque o status de um livro ou explore o catálogo para adicionar novas leituras a esta estante.';

  return (
    <>
      <div className="page-hero page-hero--compact">
        <div className="container">
          <PageHeader
            eyebrow="Sua estante pessoal"
            title="Minha biblioteca"
            description="Organize o que você quer ler, o que está lendo e o que já concluiu. Os favoritos ficam salvos localmente, sem conta e sem servidor."
          >
            <ButtonLink
              to="/explorar"
              variant="primary"
              icon={<BookOpen size={17} />}
            >
              Adicionar livros
            </ButtonLink>
          </PageHeader>
        </div>
      </div>

      <div className="container library-page">
        <div className="stats-grid stats-grid--4">
          <StatCard
            label="Livros salvos"
            value={counts.total}
            hint="Total na sua estante"
            icon={<LibraryBig size={18} />}
          />
          <StatCard
            label="Quero ler"
            value={counts.want}
            hint="Próximas leituras"
            icon={<Bookmark size={18} />}
            tone="navy"
          />
          <StatCard
            label="Lendo"
            value={counts.reading}
            hint="Em andamento"
            icon={<BookOpen size={18} />}
            tone="amber"
          />
          <StatCard
            label="Concluídos"
            value={counts.finished}
            hint="Histórias terminadas"
            icon={<CheckCircle2 size={18} />}
            tone="green"
          />
        </div>

        {storageError && (
          <p className="storage-alert" role="alert">
            <Info size={17} aria-hidden="true" />
            {storageError}
          </p>
        )}

        <div className="library-toolbar">
          <div
            className="library-tabs"
            role="group"
            aria-label="Filtrar biblioteca por status"
          >
            {TABS.map((tab) => {
              const count =
                tab.value === 'all' ? counts.total : counts[tab.value];
              return (
                <button
                  key={tab.value}
                  type="button"
                  className={`library-tab${filter === tab.value ? ' is-active' : ''}`}
                  aria-pressed={filter === tab.value}
                  onClick={() => setFilter(tab.value)}
                >
                  {tab.label}
                  <span className="library-tab__count">{count}</span>
                </button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={16} />}
            onClick={handleExport}
            disabled={entries.length === 0}
          >
            Exportar CSV
          </Button>
        </div>

        <section
          className="library-panel"
          aria-live="polite"
          aria-label="Livros da biblioteca"
        >
          {entries.length === 0 ? (
            <EmptyState
              icon={<LibraryBig size={30} />}
              eyebrow="Estante vazia"
              title={emptyTitle}
              description={emptyDescription}
            >
              <ButtonLink to="/explorar" variant="primary">
                Explorar livros
              </ButtonLink>
            </EmptyState>
          ) : filteredEntries.length === 0 ? (
            <EmptyState
              icon={<LibraryBig size={30} />}
              eyebrow="Nada por aqui"
              title={emptyTitle}
              description={emptyDescription}
            >
              <Button variant="secondary" onClick={() => setFilter('all')}>
                Ver todos os livros
              </Button>
            </EmptyState>
          ) : (
            <>
              <p className="library-count">
                {formatNumber(filteredEntries.length)}{' '}
                {pluralize(filteredEntries.length, 'livro', 'livros')} nesta
                visão
              </p>
              <div className="library-grid">
                {filteredEntries.map((entry) => (
                  <LibraryItem key={entry.book.id} entry={entry} />
                ))}
              </div>
            </>
          )}
        </section>

        <div className="library-note">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <strong>Privacidade por padrão.</strong>
            <p>
              Sua biblioteca é armazenada apenas no <code>localStorage</code>{" "}
              deste navegador. Não há conta, envio de dados pessoais ou
              sincronização entre dispositivos. Limpar os dados do navegador
              remove a estante.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
