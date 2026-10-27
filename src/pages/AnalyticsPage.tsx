import { useMemo, useState, type FormEvent } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarRange,
  Download,
  FileText,
  LibraryBig,
  Search,
  Tags,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BookSearchType } from '../types/book';
import { useBookSearch } from '../hooks/useBookSearch';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import { analyzeBooks, getUniqueBooks } from '../data/analysis';
import { booksToCsv, downloadCsv } from '../lib/csv';
import {
  ANALYSIS_SAMPLE_SIZE,
  ANALYTICS_PRESETS,
  SEARCH_TYPE_OPTIONS,
  SUBJECT_OPTIONS,
} from '../lib/constants';
import {
  formatNumber,
  formatPercent,
  formatSourceDetail,
} from '../lib/formatters';
import { Button } from '../components/Button';
import { ChartCard } from '../components/ChartCard';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { MethodologyCard } from '../components/MethodologyCard';
import { PageHeader } from '../components/PageHeader';
import { SampleBadge } from '../components/SampleBadge';
import { SourceNotice } from '../components/SourceNotice';
import { StatCard } from '../components/StatCard';

const CHART_HEIGHT = 300;
const PIE_HEIGHT = 330;
const AXIS_TICK = { fontSize: 11, fill: '#52677D' };
const CATEGORY_TICK = { fontSize: 11, fill: '#334E68' };
const CHART_COLORS = [
  '#2563EB',
  '#1D4ED8',
  '#3B82F6',
  '#60A5FA',
  '#102A43',
  '#93C5FD',
  '#DBEAFE',
];

interface AnalyticsForm {
  query: string;
  searchType: BookSearchType;
  subject: string;
}

const INITIAL_FORM: AnalyticsForm = {
  query: '',
  searchType: 'all',
  subject: 'fiction',
};

const TOOLTIP_STYLE = {
  border: '1px solid #D9E2EC',
  borderRadius: 12,
  boxShadow: '0 12px 32px rgba(16,42,67,.12)',
  fontSize: 12,
  color: '#102A43',
};

function countTooltip(value: unknown): [string, string] {
  return [formatNumber(Number(value)), 'Livros'];
}

export function AnalyticsPage() {
  useDocumentTitle('Dados e tendências literárias');
  const { showToast } = useToast();
  const [form, setForm] = useState<AnalyticsForm>(INITIAL_FORM);
  const [request, setRequest] = useState<AnalyticsForm>(INITIAL_FORM);
  const [formError, setFormError] = useState('');

  const search = useBookSearch({
    query: request.query,
    searchType: request.searchType,
    subject: request.subject,
    maxResults: ANALYSIS_SAMPLE_SIZE,
  });

  const analysis = useMemo(() => {
    if (!search.result) return null;
    const result = search.result;
    return analyzeBooks(result.books, {
      queryLabel: result.queryLabel,
      apiQuery: result.apiQuery,
      source: result.source,
      fetchedAt: result.fetchedAt,
      totalItems: result.totalItems,
      fallbackReason: result.fallbackReason,
    });
  }, [search.result]);

  const uniqueBooks = useMemo(
    () => (search.result ? getUniqueBooks(search.result.books) : []),
    [search.result],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = form.query.trim();
    if (!query && !form.subject) {
      setFormError('Digite um termo ou escolha um assunto para analisar.');
      return;
    }
    setFormError('');
    setRequest({ ...form, query });
  };

  const applyPreset = (preset: (typeof ANALYTICS_PRESETS)[number]) => {
    const next: AnalyticsForm = {
      query: preset.query,
      searchType: 'all',
      subject: preset.subject,
    };
    setForm(next);
    setRequest(next);
    setFormError('');
  };

  const handleExport = () => {
    if (uniqueBooks.length === 0) return;
    downloadCsv(booksToCsv(uniqueBooks), 'bluebook-amostra-analise.csv');
    showToast({
      message: 'Amostra analisada exportada em CSV.',
      tone: 'success',
    });
  };

  const yearColumn =
    analysis?.yearPeriod === 'decade' ? 'Década' : 'Ano';

  return (
    <>
      <div className="page-hero page-hero--compact">
        <div className="container">
          <PageHeader
            eyebrow="Observatório de leitura"
            title="Dados e tendências literárias"
            description="Indicadores, categorias, anos e autores calculados a partir dos livros realmente retornados pela API. Cada gráfico informa a base e as limitações da amostra."
            aside={
              <div className="analytics-hero-badge">
                <BarChart3 size={22} aria-hidden="true" />
                <span>
                  <strong>Dados reais</strong>
                  Consulta processada no navegador
                </span>
              </div>
            }
          />
        </div>
      </div>

      <div className="container analytics-page">
        <section className="analytics-controls" aria-labelledby="montar-amostra">
          <div className="analytics-controls__header">
            <p className="eyebrow">Consulta</p>
            <h2 id="montar-amostra">Monte a amostra</h2>
            <p>
              Escolha um assunto ou pesquise por título, autor ou termo livre.
              A análise usa até {ANALYSIS_SAMPLE_SIZE} registros por consulta.
            </p>
          </div>

          <form className="analytics-form" onSubmit={handleSubmit}>
            <div className="analytics-form__search">
              <label htmlFor="analise-termo">Termo de busca</label>
              <div className="analytics-form__input">
                <Search size={18} aria-hidden="true" />
                <input
                  id="analise-termo"
                  type="search"
                  value={form.query}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      query: event.target.value,
                    }));
                    if (formError) setFormError('');
                  }}
                  placeholder="Ex.: ficção científica, Machado de Assis…"
                  autoComplete="off"
                  aria-describedby={formError ? 'analise-erro' : undefined}
                  aria-invalid={formError ? true : undefined}
                />
              </div>
            </div>

            <div className="analytics-form__select">
              <label htmlFor="analise-tipo">Buscar por</label>
              <select
                id="analise-tipo"
                value={form.searchType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    searchType: event.target.value as BookSearchType,
                  }))
                }
              >
                {SEARCH_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="analytics-form__select">
              <label htmlFor="analise-assunto">Assunto</label>
              <select
                id="analise-assunto"
                value={form.subject}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
              >
                <option value="">Todos os assuntos</option>
                {SUBJECT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<BarChart3 size={17} />}
              className="analytics-form__submit"
            >
              Analisar
            </Button>
          </form>

          {formError && (
            <p id="analise-erro" className="filter-error" role="alert">
              {formError}
            </p>
          )}

          <div className="analytics-presets" aria-label="Consultas rápidas">
            <span>Atalhos:</span>
            {ANALYTICS_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="analytics-preset"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p className="analytics-controls__note">
            A consulta é enviada à Google Books API. Se ela estiver
            indisponível, a Open Library é usada como contingência e a fonte é
            identificada em toda a página.
          </p>
        </section>

        <div aria-busy={search.isLoading}>
          {search.isLoading && (
            <div className="analytics-loading" aria-label="Carregando análise">
              <div className="stats-grid stats-grid--3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="stat-card stat-card--skeleton">
                    <span className="skeleton-line skeleton-line--short" />
                    <span className="skeleton-line skeleton-line--title" />
                    <span className="skeleton-line skeleton-line--medium" />
                  </div>
                ))}
              </div>
              <div className="analytics-charts">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="chart-card chart-card--skeleton skeleton-block"
                  />
                ))}
              </div>
            </div>
          )}

          {search.status === 'error' && search.error && (
            <ErrorState
              error={search.error}
              onRetry={search.retry}
              title="A análise não pôde ser carregada"
            />
          )}

          {search.status === 'success' &&
            search.result &&
            search.result.books.length === 0 && (
              <EmptyState
                icon={<BarChart3 size={30} />}
                eyebrow="Amostra vazia"
                title="A API não retornou registros para esta consulta"
                description="Não há dados para analisar com os termos atuais. Tente outro assunto ou uma busca mais ampla."
              >
                <Button
                  variant="primary"
                  onClick={() => applyPreset(ANALYTICS_PRESETS[0])}
                >
                  Analisar ficção
                </Button>
              </EmptyState>
            )}

          {analysis && search.result && search.result.books.length > 0 && (
            <div className="analytics-results">
              <SourceNotice
                source={analysis.meta.source}
                fallbackReason={analysis.meta.fallbackReason}
              />

              <div className="analytics-toolbar">
                <div>
                  <SampleBadge
                    meta={analysis.meta}
                    count={analysis.uniqueCount}
                  />
                  <p className="analytics-context">
                    <strong>{analysis.meta.queryLabel}</strong>
                    <span>
                      Fonte: {formatSourceDetail(analysis.meta.source)} · consulta:{" "}
                      <code>{analysis.meta.apiQuery}</code>
                    </span>
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download size={16} />}
                  onClick={handleExport}
                  disabled={uniqueBooks.length === 0}
                >
                  Exportar amostra
                </Button>
              </div>

              <div className="stats-grid stats-grid--3">
                <StatCard
                  label="Registros recebidos"
                  value={analysis.rawCount}
                  hint="Antes da deduplicação"
                  icon={<FileText size={18} />}
                />
                <StatCard
                  label="Títulos únicos"
                  value={analysis.uniqueCount}
                  hint={`${formatNumber(analysis.duplicateCount)} duplicados removidos`}
                  icon={<BookOpen size={18} />}
                  tone="navy"
                />
                <StatCard
                  label="Categorias"
                  value={analysis.categoryCount}
                  hint="Distintas na amostra"
                  icon={<Tags size={18} />}
                />
                <StatCard
                  label="Autores"
                  value={analysis.authorCount}
                  hint="Contagem por livro"
                  icon={<Users size={18} />}
                  tone="green"
                />
                <StatCard
                  label="Anos cobertos"
                  value={
                    analysis.yearsRange
                      ? `${analysis.yearsRange.min}–${analysis.yearsRange.max}`
                      : '—'
                  }
                  hint={
                    analysis.yearsRange
                      ? `${analysis.years.length} faixas no gráfico`
                      : 'Ano não informado na amostra'
                  }
                  icon={<CalendarRange size={18} />}
                  tone="amber"
                />
                <StatCard
                  label="Média de páginas"
                  value={analysis.averagePages ?? '—'}
                  hint={`${formatNumber(analysis.quality.withPages)} livros com página`}
                  icon={<LibraryBig size={18} />}
                />
              </div>

              <div className="analytics-charts">
                <ChartCard
                  className="chart-card--wide"
                  title="Livros por categoria"
                  description="Quantidade de livros em cada categoria informada. Um mesmo livro pode aparecer em mais de uma barra."
                  height={CHART_HEIGHT}
                  note={`Base: ${formatNumber(analysis.uniqueCount)} livros únicos. As oito categorias mais frequentes são exibidas; percentuais usam essa base e podem somar mais de 100%.`}
                  table={
                    <DataTable
                      caption="Distribuição de livros por categoria"
                      columns={['Categoria', 'Livros', '% da amostra']}
                      rows={analysis.categories.map((item) => [
                        item.label,
                        formatNumber(item.value),
                        formatPercent(item.percent, 1),
                      ])}
                      firstColumnIsHeader
                      compact
                    />
                  }
                >
                  <div
                    className="chart-canvas"
                    style={{ height: CHART_HEIGHT }}
                    role="img"
                    aria-label="Gráfico de barras horizontais com a quantidade de livros por categoria"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analysis.categories}
                        layout="vertical"
                        margin={{ top: 4, right: 28, bottom: 4, left: 8 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#D9E2EC"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={AXIS_TICK}
                        />
                        <YAxis
                          type="category"
                          dataKey="label"
                          width={150}
                          tick={CATEGORY_TICK}
                        />
                        <Tooltip
                          formatter={countTooltip}
                          contentStyle={TOOLTIP_STYLE}
                        />
                        <Bar
                          dataKey="value"
                          name="Livros"
                          fill="#2563EB"
                          radius={[0, 6, 6, 0]}
                          maxBarSize={26}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard
                  title="Autores mais frequentes"
                  description="Autores que mais aparecem nos livros da amostra. Cada livro conta uma vez por autor."
                  height={CHART_HEIGHT}
                  note={`Base: ${formatNumber(analysis.uniqueCount)} livros únicos. Os oito autores mais frequentes são exibidos; um livro com vários autores contribui para cada autor.`}
                  table={
                    <DataTable
                      caption="Autores mais frequentes na amostra"
                      columns={['Autor', 'Livros', '% da amostra']}
                      rows={analysis.authors.map((item) => [
                        item.label,
                        formatNumber(item.value),
                        formatPercent(item.percent, 1),
                      ])}
                      firstColumnIsHeader
                      compact
                    />
                  }
                >
                  <div
                    className="chart-canvas"
                    style={{ height: CHART_HEIGHT }}
                    role="img"
                    aria-label="Gráfico de barras horizontais com os autores mais frequentes"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analysis.authors}
                        layout="vertical"
                        margin={{ top: 4, right: 28, bottom: 4, left: 8 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#D9E2EC"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={AXIS_TICK}
                        />
                        <YAxis
                          type="category"
                          dataKey="label"
                          width={150}
                          tick={CATEGORY_TICK}
                        />
                        <Tooltip
                          formatter={countTooltip}
                          contentStyle={TOOLTIP_STYLE}
                        />
                        <Bar
                          dataKey="value"
                          name="Livros"
                          fill="#1D4ED8"
                          radius={[0, 6, 6, 0]}
                          maxBarSize={26}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard
                  className="chart-card--wide"
                  title={`Publicações por ${analysis.yearPeriod === 'decade' ? 'década' : 'ano'}`}
                  description={
                    analysis.yearPeriod === 'decade'
                      ? 'A amplitude de anos é maior que 25, por isso os dados foram agrupados por década.'
                      : 'Quantidade de livros por ano de publicação informado pela API.'
                  }
                  height={CHART_HEIGHT + 40}
                  note={`Base: ${formatNumber(
                    analysis.uniqueCount - analysis.quality.missingYear,
                  )} livros com ano válido. Registros sem ano não entram neste gráfico.`}
                  table={
                    <DataTable
                      caption={`Publicações por ${analysis.yearPeriod === 'decade' ? 'década' : 'ano'}`}
                      columns={[yearColumn, 'Livros', '% dos livros com ano']}
                      rows={analysis.years.map((item) => [
                        item.label,
                        formatNumber(item.value),
                        formatPercent(item.percent, 1),
                      ])}
                      firstColumnIsHeader
                      compact
                    />
                  }
                >
                  <div
                    className="chart-canvas"
                    style={{ height: CHART_HEIGHT + 40 }}
                    role="img"
                    aria-label={`Gráfico de barras com publicações por ${analysis.yearPeriod === 'decade' ? 'década' : 'ano'}`}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analysis.years}
                        margin={{ top: 8, right: 20, bottom: 10, left: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#D9E2EC"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          interval={0}
                          angle={analysis.years.length > 10 ? -40 : 0}
                          textAnchor={
                            analysis.years.length > 10 ? 'end' : 'middle'
                          }
                          height={analysis.years.length > 10 ? 72 : 32}
                          tick={AXIS_TICK}
                        />
                        <YAxis
                          allowDecimals={false}
                          width={38}
                          tick={AXIS_TICK}
                        />
                        <Tooltip
                          formatter={countTooltip}
                          contentStyle={TOOLTIP_STYLE}
                        />
                        <Bar
                          dataKey="value"
                          name="Livros"
                          fill="#3B82F6"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={42}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard
                  title="Distribuição por categoria principal"
                  description="Participação da primeira categoria de cada livro. “Sem categoria informada” reúne registros sem esse dado."
                  height={PIE_HEIGHT}
                  note={`Base: ${formatNumber(analysis.uniqueCount)} livros únicos. As seis maiores categorias são exibidas; o restante forma “Outros”.`}
                  table={
                    <DataTable
                      caption="Distribuição por categoria principal"
                      columns={['Categoria principal', 'Livros', '% da amostra']}
                      rows={analysis.primaryCategories.map((item) => [
                        item.label,
                        formatNumber(item.value),
                        formatPercent(item.percent, 1),
                      ])}
                      firstColumnIsHeader
                      compact
                    />
                  }
                >
                  <div
                    className="chart-canvas chart-canvas--pie"
                    style={{ height: PIE_HEIGHT }}
                    role="img"
                    aria-label="Gráfico de rosca com a distribuição percentual por categoria principal"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analysis.primaryCategories}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="46%"
                          innerRadius={58}
                          outerRadius={96}
                          paddingAngle={2}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        >
                          {analysis.primaryCategories.map((item, index) => (
                            <Cell
                              key={item.label}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={countTooltip}
                          contentStyle={TOOLTIP_STYLE}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={54}
                          iconType="circle"
                          wrapperStyle={{ fontSize: 11, lineHeight: 1.5 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>

              <div className="analytics-quality">
                <h2>Qualidade dos metadados</h2>
                <p>
                  A ausência de dados é parte do resultado. Estes números
                  mostram quantos livros da amostra não trazem cada campo — e
                  explicam por que alguns gráficos usam bases menores.
                </p>
                <ul className="quality-list">
                  <li>
                    <span>Sem capa</span>
                    <strong>
                      {formatNumber(analysis.quality.missingCover)} de{' '}
                      {formatNumber(analysis.uniqueCount)}
                    </strong>
                  </li>
                  <li>
                    <span>Sem ano</span>
                    <strong>
                      {formatNumber(analysis.quality.missingYear)} de{' '}
                      {formatNumber(analysis.uniqueCount)}
                    </strong>
                  </li>
                  <li>
                    <span>Sem categoria</span>
                    <strong>
                      {formatNumber(analysis.quality.missingCategory)} de{' '}
                      {formatNumber(analysis.uniqueCount)}
                    </strong>
                  </li>
                  <li>
                    <span>Sem descrição</span>
                    <strong>
                      {formatNumber(analysis.quality.missingDescription)} de{' '}
                      {formatNumber(analysis.uniqueCount)}
                    </strong>
                  </li>
                  <li>
                    <span>Sem páginas</span>
                    <strong>
                      {formatNumber(analysis.quality.missingPages)} de{' '}
                      {formatNumber(analysis.uniqueCount)}
                    </strong>
                  </li>
                </ul>
              </div>

              <MethodologyCard meta={analysis.meta} analysis={analysis} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
