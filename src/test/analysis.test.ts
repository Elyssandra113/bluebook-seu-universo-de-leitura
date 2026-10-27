import { describe, expect, it } from 'vitest';
import { analyzeBooks, getUniqueBooks, topWithOthers } from '../data/analysis';
import type { AnalysisMeta } from '../types/api';
import { makeBook } from './fixtures';

const meta: AnalysisMeta = {
  queryLabel: 'No assunto “Ficção”',
  apiQuery: 'subject:"fiction"',
  source: 'google',
  fetchedAt: '2026-10-27T12:00:00.000Z',
  totalItems: 120,
};

const books = [
  makeBook({
    id: 'google:1',
    title: 'Livro Um',
    authors: ['Autora A', 'Autor B'],
    categories: ['Fantasy', 'Adventure'],
    year: 2020,
    pageCount: 200,
    thumbnail: undefined,
    description: undefined,
  }),
  makeBook({
    id: 'google:2',
    title: 'Livro Dois',
    authors: ['Autora A'],
    categories: ['Fantasy'],
    year: 2021,
    pageCount: 400,
  }),
  makeBook({
    id: 'google:3',
    title: 'Livro Três',
    authors: [],
    categories: [],
    year: undefined,
    pageCount: undefined,
    thumbnail: undefined,
    description: undefined,
  }),
  makeBook({
    id: 'google:1',
    title: 'Livro Um',
    authors: ['Autora A', 'Autor B'],
    categories: ['Fantasy', 'Adventure'],
    year: 2020,
  }),
];

describe('analyzeBooks', () => {
  it('calcula contagens, deduplicação e KPIs', () => {
    const analysis = analyzeBooks(books, meta);

    expect(analysis.rawCount).toBe(4);
    expect(analysis.validCount).toBe(4);
    expect(analysis.uniqueCount).toBe(3);
    expect(analysis.duplicateCount).toBe(1);
    expect(analysis.categoryCount).toBe(2);
    expect(analysis.authorCount).toBe(2);
    expect(analysis.averagePages).toBe(300);
  });

  it('agrega categorias, autores e percentuais sobre a base única', () => {
    const analysis = analyzeBooks(books, meta);
    const fantasy = analysis.categories.find(
      (item) => item.label === 'Fantasy',
    );
    const autora = analysis.authors.find((item) => item.label === 'Autora A');

    expect(fantasy).toMatchObject({ value: 2, percent: 66.7 });
    expect(autora).toMatchObject({ value: 2, percent: 66.7 });
    expect(analysis.primaryCategories[0]?.label).toBe('Fantasy');
    expect(analysis.primaryCategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Sem categoria informada', value: 1 }),
      ]),
    );
  });

  it('calcula qualidade dos metadados e anos', () => {
    const analysis = analyzeBooks(books, meta);

    expect(analysis.quality.missingCover).toBe(2);
    expect(analysis.quality.missingYear).toBe(1);
    expect(analysis.quality.missingCategory).toBe(1);
    expect(analysis.quality.missingPages).toBe(1);
    expect(analysis.yearsRange).toEqual({ min: 2020, max: 2021 });
    expect(analysis.years).toEqual([
      expect.objectContaining({ label: '2020', value: 1 }),
      expect.objectContaining({ label: '2021', value: 1 }),
    ]);
  });

  it('agrupa por década quando a amplitude passa de 25 anos', () => {
    const analysis = analyzeBooks(
      [
        makeBook({ id: 'google:a', year: 1980, title: 'A' }),
        makeBook({ id: 'google:b', year: 2020, title: 'B' }),
      ],
      meta,
    );

    expect(analysis.yearPeriod).toBe('decade');
    expect(analysis.years.map((item) => item.label)).toEqual([
      '1980–1989',
      '2020–2029',
    ]);
  });

  it('lida com amostra vazia sem valores inventados', () => {
    const analysis = analyzeBooks([], meta);

    expect(analysis.uniqueCount).toBe(0);
    expect(analysis.averagePages).toBeUndefined();
    expect(analysis.yearsRange).toBeUndefined();
    expect(analysis.categories).toEqual([]);
  });
});

describe('helpers de agregação', () => {
  it('getUniqueBooks remove duplicatas', () => {
    expect(getUniqueBooks(books)).toHaveLength(3);
  });

  it('topWithOthers agrupa o excedente', () => {
    const result = topWithOthers(
      [
        { label: 'A', value: 4, percent: 40 },
        { label: 'B', value: 3, percent: 30 },
        { label: 'C', value: 2, percent: 20 },
        { label: 'D', value: 1, percent: 10 },
      ],
      2,
    );

    expect(result).toEqual([
      { label: 'A', value: 4, percent: 40 },
      { label: 'B', value: 3, percent: 30 },
      { label: 'Outros', value: 3, percent: 30 },
    ]);
  });
});
