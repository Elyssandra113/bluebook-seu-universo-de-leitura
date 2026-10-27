import { ExternalLink, Info } from 'lucide-react';
import type { AnalysisMeta, BookAnalysis } from '../types/api';
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  formatSourceDetail,
} from '../lib/formatters';

interface MethodologyCardProps {
  meta: AnalysisMeta;
  analysis: BookAnalysis;
}

export function MethodologyCard({ meta, analysis }: MethodologyCardProps) {
  return (
    <section className="methodology-card" id="metodologia">
      <div className="methodology-card__header">
        <p className="eyebrow">Transparência</p>
        <h2>Como esta análise foi feita</h2>
        <p>
          Todos os indicadores e gráficos desta página derivam dos registros
          efetivamente retornados pela consulta abaixo. Nenhum valor foi
          preenchido manualmente.
        </p>
      </div>

      <div className="methodology-card__grid">
        <div>
          <h3>Universo analisado</h3>
          <dl className="methodology-list">
            <div>
              <dt>Consulta</dt>
              <dd>{meta.queryLabel}</dd>
            </div>
            <div>
              <dt>Expressão enviada à API</dt>
              <dd>
                <code>{meta.apiQuery}</code>
              </dd>
            </div>
            <div>
              <dt>Fonte</dt>
              <dd>{formatSourceDetail(meta.source)}</dd>
            </div>
            <div>
              <dt>Amostra</dt>
              <dd>
                {formatNumber(analysis.uniqueCount)} registros únicos de{' '}
                {formatNumber(analysis.rawCount)} recebidos
              </dd>
            </div>
            <div>
              <dt>Coleta</dt>
              <dd>{formatDateTime(meta.fetchedAt)}</dd>
            </div>
            <div>
              <dt>Resultados informados pela API</dt>
              <dd>{formatNumber(meta.totalItems)}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3>Tratamento dos dados</h3>
          <ul className="methodology-bullets">
            <li>
              Títulos, autores e categorias passam por limpeza de espaços,
              HTML e entidades.
            </li>
            <li>
              Registros duplicados são removidos por identificador e por
              combinação de título + primeiro autor.
            </li>
            <li>
              Categorias são agrupadas pelo primeiro segmento informado; um
              livro pode aparecer em mais de uma categoria no gráfico de
              barras.
            </li>
            <li>
              Anos são extraídos apenas quando há quatro dígitos plausíveis.
              Acima de 25 anos de amplitude, o agrupamento passa a ser por
              década.
            </li>
            <li>
              Autores são contados uma vez por livro. A média de páginas
              considera somente registros com essa informação.
            </li>
            <li>
              Percentuais usam a base indicada em cada gráfico; dados ausentes
              não são estimados.
            </li>
          </ul>
        </div>

        <div>
          <h3>Limitações da amostra</h3>
          <ul className="methodology-bullets">
            <li>
              Os resultados representam os livros retornados pelas consultas
              realizadas, não todo o mercado editorial.
            </li>
            <li>
              A API pode retornar edições diferentes da mesma obra; a
              deduplicação é conservadora e pode manter variantes.
            </li>
            <li>
              Categorias, ano, páginas e descrição podem estar ausentes ou não
              padronizados entre registros.
            </li>
            <li>
              A data de publicação pode se referir a uma edição específica, e
              não à primeira publicação da obra.
            </li>
            <li>
              A amostra é limitada pelo tamanho máximo aceito por requisição
              (até 40 registros na Google Books).
            </li>
            <li>
              Quando a Google Books está indisponível, a contingência usa a
              Open Library; o conjunto de campos e a cobertura mudam.
            </li>
          </ul>
          <p className="methodology-card__quality">
            Qualidade da amostra: {formatPercent(
              (analysis.uniqueCount - analysis.quality.missingCategory) /
                Math.max(1, analysis.uniqueCount) *
                100,
              1,
            )}{' '}
            dos livros têm categoria; {formatNumber(analysis.quality.withPages)}{' '}
            têm contagem de páginas.
          </p>
        </div>
      </div>

      {meta.fallbackReason && (
        <p className="methodology-card__warning">
          <Info size={17} aria-hidden="true" />
          <span>
            A consulta primária à Google Books falhou. Motivo registrado:{' '}
            {meta.fallbackReason}
          </span>
        </p>
      )}

      <div className="methodology-card__links">
        <a
          href="https://developers.google.com/books/docs/v1/using"
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentação da Google Books API
          <ExternalLink size={14} aria-hidden="true" />
        </a>
        <a
          href="https://openlibrary.org/developers/api"
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentação da Open Library
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
