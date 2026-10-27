import { describe, expect, it } from 'vitest';
import {
  buildGoogleQuery,
  buildOpenLibraryQuery,
  describeSearch,
  subjectLabel,
} from '../services/queries';

describe('buildGoogleQuery', () => {
  it('monta busca por título', () => {
    expect(
      buildGoogleQuery({ query: 'Dom Casmurro', searchType: 'title' }),
    ).toBe('intitle:"Dom Casmurro"');
  });

  it('monta busca por autor', () => {
    expect(
      buildGoogleQuery({ query: 'Clarice Lispector', searchType: 'author' }),
    ).toBe('inauthor:"Clarice Lispector"');
  });

  it('monta busca por assunto', () => {
    expect(
      buildGoogleQuery({ query: 'fantasy', searchType: 'subject' }),
    ).toBe('subject:"fantasy"');
  });

  it('combina termo livre e assunto', () => {
    expect(
      buildGoogleQuery({ query: 'dragões', subject: 'fantasy' }),
    ).toBe('dragões subject:"fantasy"');
  });

  it('remove aspas e barras que quebrariam a consulta', () => {
    expect(
      buildGoogleQuery({ query: '  "quem\\lê"  ', searchType: 'title' }),
    ).toBe('intitle:"quem lê"');
  });

  it('retorna vazio sem termo nem assunto', () => {
    expect(buildGoogleQuery({})).toBe('');
  });
});

describe('buildOpenLibraryQuery', () => {
  it('usa os prefixos aceitos pela Open Library', () => {
    expect(
      buildOpenLibraryQuery({ query: 'Frank Herbert', searchType: 'author' }),
    ).toBe('author:"Frank Herbert"');
    expect(
      buildOpenLibraryQuery({ query: 'Duna', searchType: 'title' }),
    ).toBe('title:"Duna"');
  });
});

describe('rótulos de busca', () => {
  it('traduz assuntos conhecidos', () => {
    expect(subjectLabel('fiction')).toBe('Ficção');
    expect(subjectLabel('juvenile fiction')).toBe('Infantojuvenil');
  });

  it('descreve a consulta para a metodologia', () => {
    expect(describeSearch({ subject: 'fiction' })).toBe(
      'No assunto “Ficção”',
    );
    expect(
      describeSearch({ query: 'Duna', searchType: 'title', subject: 'fiction' }),
    ).toBe('Busca por título “Duna” no assunto “Ficção”');
    expect(describeSearch({})).toBe('Acervo em destaque');
  });
});
