const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  bull: '•',
  middot: '·',
  copy: '©',
  reg: '®',
  trade: '™',
  eacute: 'é',
  egrave: 'è',
  ecirc: 'ê',
  agrave: 'à',
  aacute: 'á',
  acirc: 'â',
  atilde: 'ã',
  ccedil: 'ç',
  iacute: 'í',
  oacute: 'ó',
  ocirc: 'ô',
  otilde: 'õ',
  uacute: 'ú',
  uuml: 'ü',
};

export function decodeEntities(value: string): string {
  if (!value) return '';

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      const parsed = Number.parseInt(code.slice(2), 16);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : match;
    }
    if (code.startsWith('#')) {
      const parsed = Number.parseInt(code.slice(1), 10);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

export function normalizeWhitespace(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

/**
 * Open Library descriptions are often written in simple Markdown. Strip the
 * most common markers so the text renders as plain prose instead of showing
 * raw `**` or `[]()` syntax.
 */
export function stripMarkdown(value: string): string {
  if (!value) return '';

  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*[-*+][ \t]+/gm, '• ')
    .replace(/^[ \t]*>[ \t]?/gm, '')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '$2')
    .replace(/(^|[\s(])([*_])(?=\S)([^*_\n]*?\S)\2(?=[\s).,;:!?]|$)/g, '$1$3')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '$1');
}

export function stripHtml(value: unknown): string {
  if (typeof value !== 'string') return '';

  const withBreaks = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|blockquote|h[1-6])>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ');

  const withoutTags = withBreaks.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  const withoutRemainingTags = withoutTags.replace(/<[^>]*>/g, '');
  const decoded = decodeEntities(withoutRemainingTags);
  const plain = stripMarkdown(decoded);

  return plain
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function cleanText(value: unknown): string {
  return typeof value === 'string' ? normalizeWhitespace(stripHtml(value)) : '';
}

export function cleanLongText(value: unknown): string {
  return typeof value === 'string' ? stripHtml(value) : '';
}

export function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function parseYear(value: unknown, maxYear = new Date().getFullYear() + 1): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value >= 1000 && value <= maxYear ? value : undefined;
  }
  if (typeof value !== 'string') return undefined;

  const match = value.match(/(?:^|\D)(\d{4})(?:\D|$)/);
  if (!match?.[1]) return undefined;
  const year = Number.parseInt(match[1], 10);
  return year >= 1000 && year <= maxYear ? year : undefined;
}

export function uniqueStrings(
  values: Array<unknown> | undefined,
  limit = Number.POSITIVE_INFINITY,
): string[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const clean = cleanText(value);
    if (!clean) continue;
    const key = normalizeKey(clean);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
    if (result.length >= limit) break;
  }

  return result;
}

export function splitCategories(
  values: Array<unknown> | undefined,
  limit = 3,
): string[] {
  if (!Array.isArray(values)) return [];

  const parts: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const clean = cleanText(value);
    if (!clean) continue;
    const segments = clean
      .split(/\s*(?:\/|>|--|—)\s*/)
      .map((segment) => segment.replace(/[\s.,;:]+$/, '').trim())
      .filter(Boolean);
    parts.push(...segments);
  }

  return uniqueStrings(parts, limit);
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const sliced = value.slice(0, maxLength + 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const cut = lastSpace > maxLength * 0.6 ? lastSpace : maxLength;
  return `${sliced.slice(0, cut).trimEnd()}…`;
}

export function getInitials(title: string): string {
  const words = cleanText(title)
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2);
  if (words.length === 0) return 'BB';
  return words.map((word) => word.charAt(0).toUpperCase()).join('');
}

export function toParagraphs(description: string): string[] {
  return cleanLongText(description)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
