---
name: BlueBook Design
description: Use ao construir, revisar ou publicar o projeto BlueBook — Seu Universo de Leitura. Define identidade visual azul, componentes, acessibilidade, responsividade, integração com Google Books, análise de dados, testes e padrões de qualidade.
---

# BlueBook — Design, Engenharia e Qualidade

Skill de projeto para o BlueBook, uma plataforma acadêmica de descoberta de livros, biblioteca pessoal e análise de dados literários. Aplique estas regras em **toda** alteração de interface, API, dados ou documentação.

## 1. Quando usar

Use esta Skill quando a tarefa envolver:

- criar ou alterar páginas, componentes ou estilos do BlueBook;
- integrar, tratar erros ou normalizar dados da Google Books API;
- calcular indicadores, agregações ou gráficos do painel literário;
- revisar acessibilidade, responsividade, testes, build ou publicação;
- escrever README, documentação acadêmica ou textos de limitações.

Não use para projetos que não sejam o BlueBook.

## 2. Identidade visual obrigatória

### 2.1 Paleta

Use tokens CSS; nunca escreva cores hexadecimais soltas em componentes.

| Token | Valor | Uso |
|---|---|---|
| `--navy-900` | `#102A43` | Títulos, cabeçalho escuro, texto forte |
| `--blue-600` | `#2563EB` | Ação primária, links, foco, dados |
| `--blue-100` | `#DBEAFE` | Fundos suaves, chips, estados selecionados |
| `--white` | `#FFFFFF` | Superfícies de cartões |
| `--gray-50` | `#F5F8FC` | Fundo geral da aplicação |
| `--ink-700` | `#334E68` | Texto corrido |
| `--ink-500` | `#627D98` | Ícones decorativos e detalhes |
| `--text-muted` | `#52677D` | Texto secundário pequeno (contraste ≥ 4.5:1) |
| `--line` | `#D9E2EC` | Bordas discretas |
| `--amber-500` | `#D97706` | Apenas avaliações/estrelas e avisos de contingência |
| `--success-600` | `#047857` | Estado “Concluído” |
| `--danger-600` | `#B42318` | Erros e remoção |

Derive tons adicionais de azul com `color-mix()` ou variáveis `--blue-050`, `--blue-200`, `--blue-700`. A paleta deve permanecer predominantemente azul. O âmbar é acento funcional, nunca decoração dominante.

Contraste mínimo: **4.5:1** para texto normal e **3:1** para texto grande, ícones e bordas de foco. Não use azul-claro como texto sobre branco.

### 2.2 Tipografia

- Display/títulos: **Fraunces** (serifada editorial), fallback `Georgia, serif`. Use pesos 500–700, `letter-spacing: -0.02em`.
- Interface/texto: **Manrope** (sans-serif), fallback `system-ui, sans-serif`. Pesos 400–800.
- Corpo: 16–18px, linha 1.65. Textos longos com no máximo ~68ch.
- Eyebrows: 11–12px, caixa alta, `letter-spacing: .14em`, peso 700.
- Não use mais de duas famílias tipográficas.

### 2.3 Espaçamento, forma e profundidade

- Escala de espaço em múltiplos de 4: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.
- Raio: 12px (controles), 18px (cartões), 28px (painéis), `999px` (pills).
- Sombra discreta: `0 1px 2px rgba(16,42,67,.05), 0 12px 32px rgba(16,42,67,.08)`.
- Borda padrão: `1px solid var(--line)`.
- Container: `min(1200px, calc(100% - 32px))`; gutter móvel de 16–20px.
- Grid de livros: `repeat(auto-fill, minmax(190px, 1fr))`, com 4–5 colunas no desktop, 2 no celular.
- Não use sombras pesadas, gradientes arco-íris, vidro exagerado ou cantos inconsistentes.

### 2.4 Logotipo e imagens

- O logotipo é textual: **BlueBook**, com um símbolo próprio de livro aberto + marcador de página em SVG inline. O símbolo deve funcionar em 24px e em 48px.
- Nunca use emoji como logotipo ou ícone estrutural. Use SVG inline minimalista, `currentColor`, `aria-hidden="true"` quando decorativo.
- Capas vêm da API. Use `alt="Capa do livro {título}"`, `loading="lazy"`, proporção 2:3 e fallback visual com iniciais, ícone e gradiente azul. Nunca deixe imagem quebrada.
- Toda capa deve ter `object-fit: cover` e fallback em caso de `onError`.
- Não invente capas, notas, descrições, editoras ou contagens de páginas.

### 2.5 Movimento

- Transições de 160–240ms, `ease-out`. Hover de cartão: elevação de 2–4px.
- Anime entrada de seções com `fade-up` discreto, sem atrasar a leitura.
- Respeite `@media (prefers-reduced-motion: reduce)`: desligue animações, parallax e transições não essenciais.
- Nunca anime alturas que causem layout shift; use `transform` e `opacity`.

## 3. Estrutura de páginas e rotas

Use React + TypeScript + Vite, com `HashRouter` para compatibilidade com GitHub Pages.

| Rota | Página | Conteúdo obrigatório |
|---|---|---|
| `/` | Início | hero “Descubra seu próximo universo”, busca, CTAs, destaques reais da API, como funciona |
| `/explorar` | Explorar | busca, filtros de categoria/ano, ordenação, grade, paginação, estados |
| `/livro/:id` | Detalhes | capa grande, metadados condicionais, descrição, favoritar/status, link de prévia |
| `/biblioteca` | Minha biblioteca | favoritos persistentes, status, contadores, remoção, estado vazio |
| `/dados` | Análise | KPIs, gráficos, metodologia, amostra, limitações |
| `*` | 404 | mensagem clara e retorno ao início |

Anatomia global:

1. Link “Pular para o conteúdo”.
2. Cabeçalho sticky com logotipo, navegação, contador da biblioteca e menu móvel.
3. `<main id="conteudo">` com um único `<h1>` por página.
4. Rodapé com atribuição da API, links de documentação e aviso acadêmico.

A home deve ter composição editorial própria: hero azul-marinho com brilhos radiais discretos, capas reais inclinadas, busca em cartão branco e uma faixa de confiança. Evite hero genérico de template com três cards iguais.

## 4. Catálogo de componentes reutilizáveis

Crie componentes pequenos, tipados e com estados explícitos:

- `Logo`, `Header`, `MobileNav`, `Footer`, `SkipLink`, `ScrollToTop`;
- `SearchBar`, `SearchTypeSelect`, `FilterPanel`, `ActiveFilters`, `SortSelect`;
- `BookCard`, `BookCover`, `BookGrid`, `BookMeta`, `StatusBadge`, `SourceBadge`;
- `Button`, `IconButton`, `Chip`, `Field`, `Select`, `EmptyState`, `ErrorState`, `Skeleton`, `Spinner`, `Toast`;
- `PageHeader`, `SectionHeader`, `StatCard`, `ChartCard`, `DataTable`, `MethodologyCard`, `SampleBadge`;
- `Pagination`, `LoadMore`, `ResultsSummary`.

Regras:

- Props explícitas; sem `any`; sem estados globais desnecessários.
- Cada componente interativo deve ter `hover`, `focus-visible`, `active`, `disabled` e, quando aplicável, `loading`.
- Botões de ícone exigem `aria-label`. Campos exigem `<label>` visível ou `sr-only`.
- Não duplique lógica de formatação: use `src/lib/formatters.ts`.
- Prefira composição a props booleanas excessivas.
- CSS organizado por tokens + seções; nomes de classe claros (`book-card`, `hero__title`). Sem CSS-in-JS e sem Tailwind.
- Ícones: SVG inline ou `lucide-react`; tamanho 16/20/24, `stroke-width` 1.8.

## 5. Organização de arquivos

```text
src/
  components/        # UI reutilizável, um componente por arquivo
  pages/             # páginas de rota
  services/          # clientes de API e adaptadores de fonte
  data/              # normalização, agregação e análise pura
  hooks/             # hooks reutilizáveis
  context/           # biblioteca pessoal, toasts
  lib/               # formatadores, storage, texto, constantes
  styles/            # tokens, base, componentes, páginas
  types/             # contratos TypeScript
  test/              # setup e fixtures
```

- Serviços não importam componentes. Componentes não chamam `fetch` diretamente.
- Análise é composta por funções puras, testáveis, sem dependência de React.
- `localStorage` fica isolado em `lib/libraryStorage.ts` e no contexto.
- Toda constante de API, limites e chaves de storage fica centralizada.
- Documentação em `README.md`; variáveis em `.env.example`; nenhum segredo versionado.

## 6. Integração com a API oficial

### 6.1 Fonte primária

Use a **Google Books API v1**:

```text
GET https://www.googleapis.com/books/v1/volumes?q={query}&startIndex={n}&maxResults={1..40}
GET https://www.googleapis.com/books/v1/volumes/{volumeId}
```

Documentação: <https://developers.google.com/books/docs/v1/using>

Campos: `volumeInfo.title`, `subtitle`, `authors`, `description`, `categories`, `publishedDate`, `pageCount`, `publisher`, `language`, `imageLinks.thumbnail`, `previewLink`, `averageRating`, `ratingsCount`, `industryIdentifiers`.

Consultas:

- título: `intitle:"termo"`;
- autor: `inauthor:"termo"`;
- assunto: `subject:"termo"`;
- tudo: termo livre; combine com `subject:` quando houver filtro de assunto.
- `maxResults` máximo 40. Nunca invente `totalItems`; use o valor retornado.
- `startIndex` para paginação real quando aplicável.

### 6.2 Chave de API

- A chave é **opcional no código**, mas pode ser exigida pela cota pública do Google.
- Leia de `import.meta.env.VITE_GOOGLE_BOOKS_API_KEY`; nunca hardcode.
- `.env` e `.env.local` são ignorados pelo Git. Documente em `.env.example`.
- Chaves do Vite são públicas no bundle; oriente restringir por referrer HTTP e por API no Google Cloud.
- Se a chave não existir, faça a chamada anônima e trate 429 com a mensagem correta. Não bloqueie a interface antes de tentar.

### 6.3 Resiliência e fontes

- `fetch` com `AbortController`, timeout de 10–15s e mensagem de timeout.
- Trate: `400` parâmetro inválido, `403` chave/permissão, `429` cota, `5xx` indisponibilidade, falha de rede e JSON inválido.
- Implemente no máximo uma tentativa extra com backoff curto para `429/5xx`; não entre em loop.
- **Fallback permitido:** se a Google Books API estiver indisponível (especialmente 429), use a API pública **Open Library** como contingência, sempre com aviso visível “Fonte: Open Library (contingência)” e registro da causa. O fallback não pode ser apresentado como Google Books.
- Nunca crie API fictícia, dados mockados silenciosos ou números de exemplo em produção.
- Cache em memória por consulta para evitar chamadas repetidas na mesma sessão; não use cache permanente de dados dinâmicos sem rótulo de data.
- Não exponha `key` em logs, URLs exibidas, README ou mensagens de erro.
- A API deve funcionar em GitHub Pages: valide CORS, use `HashRouter`, caminhos relativos e nenhum proxy proprietário.

### 6.4 Normalização

Crie um tipo `Book` canônico e adaptadores para cada fonte. Regras:

- `id` estável e prefixado pela fonte (`google:...`, `openlibrary:...`).
- `title` obrigatório; descarte registros sem título.
- Autores: array limpo, sem duplicatas, sem strings vazias. Ausente = `[]`, nunca “Autor desconhecido” inventado.
- Categorias: array limpo; para Google, divida `Fiction / Fantasy` em segmentos; limite a 2–3 por livro para evitar inflação.
- Data: preservar string original quando útil; derivar `year` apenas se houver 4 dígitos plausíveis (1000–ano atual + 1).
- `pageCount`: inteiro > 0 ou `undefined`.
- Descrição: remover HTML/entities no render; nunca usar `dangerouslySetInnerHTML` com dados da API.
- Capa: HTTPS, trocar `http://` por `https://`, `zoom=1` quando aplicável; fallback local.
- Deduplicação: por `id` e por `title + primeiro autor` normalizados.
- Registre contagens de dados ausentes para o painel de qualidade.

## 7. Análise de dados e gráficos

- Toda métrica deriva dos registros efetivamente recebidos na sessão. Nunca preencha lacunas com valores inventados.
- Funções puras em `src/data/analysis.ts`: `analyzeBooks(books, meta)` retorna KPIs, agregações e qualidade.
- KPIs mínimos: registros retornados, registros válidos, títulos únicos, categorias distintas, autores distintos, anos cobertos, média de páginas (apenas com página), registros sem capa/ano/categoria/descrição.
- Agrupe categorias pelo primeiro segmento normalizado; mostre top 8 e “Outros”.
- Agrupe anos; se a amplitude for > 25 anos, agrupe por década e rotule “por década”. Nunca misture ano e década no mesmo eixo.
- Autores: conte cada autor uma vez por livro; top 8; empate ordenado alfabeticamente.
- Gráficos: barras horizontais para autores, barras para categorias/anos, rosca para distribuição. Use Recharts.
- Todo gráfico deve ter título, subtítulo, unidade, legenda/tooltip, fonte, `aria-label` e uma tabela equivalente acessível (visível ou em `<details>`).
- Cores dos gráficos: variações de azul; destaque consistente; não dependa só de cor para transmitir informação.
- Inclua: consulta utilizada, fonte, data/hora da coleta, tamanho da amostra, filtros aplicados e limitações (“representa os resultados retornados, não todo o mercado editorial”).
- Exportação CSV, se houver, deve refletir exatamente a amostra e usar UTF-8 com BOM para Excel.
- Nunca arredonde de forma que altere a conclusão; mostre a base de cada percentual.

## 8. Biblioteca pessoal

- Persistência em `localStorage` com chave versionada (`bluebook:library:v1`).
- Guarde snapshot do livro (título, autores, capa, categorias, ano, páginas, fonte, id) para a biblioteca funcionar offline.
- Status: `want` (“Quero ler”), `reading` (“Lendo”), `finished` (“Concluído”).
- Contadores: salvos, querem ler, lendo, concluídos.
- Adicionar/remover idempotente; trocar status atualiza `updatedAt`.
- Trate JSON inválido, storage indisponível e cota excedida sem quebrar a UI.
- Sincronize entre abas com evento `storage`.
- Toda remoção deve ser reversível ou confirmada; feedback via toast e `aria-live`.
- A biblioteca é local: deixe claro que não há conta, servidor ou sincronização.

## 9. Acessibilidade e responsividade

### Acessibilidade (WCAG 2.2 AA)

- HTML semântico: `header`, `nav`, `main`, `section`, `footer`, `ul/li`, `button`, `a`.
- Um `<h1>` por página; hierarquia sem saltos.
- Skip link visível no foco; foco `:focus-visible` com anel azul de 3px e offset 2px.
- Navegação completa por teclado; menu móvel com foco gerenciado, `Escape` fecha, `aria-expanded`.
- `aria-current="page"` na navegação ativa.
- Formulários com label, `aria-describedby` para ajuda/erro, `role="alert"` para erros e `aria-live="polite"` para resultados.
- Imagens com alt descritivo; imagens decorativas com `alt=""`/`aria-hidden`.
- Não use apenas cor para status; inclua texto/ícone.
- Alvos de toque ≥ 44px.
- `prefers-reduced-motion` respeitado.
- Tabelas com `<caption>`, cabeçalhos `<th scope="col">` e legenda.
- Teste com zoom 200% e leitor de tela básico (NVDA/VoiceOver quando possível).

### Responsividade

- Breakpoints: 480, 768, 1024, 1280.
- Mobile-first; sem scroll horizontal.
- Header: navegação desktop a partir de 900px; abaixo, drawer acessível.
- Hero: 1 coluna no mobile; composição de capas reduzida ou oculta se prejudicar leitura.
- Filtros: sidebar no desktop, painel colapsável no mobile.
- Gráficos: altura mínima 260px, sem cortar rótulos; rosca com legenda abaixo no mobile.
- Teste em 360×800, 390×844, 768×1024, 1280×800 e 1440×900.

## 10. Qualidade de código e testes

- TypeScript `strict`; evite `any`, `@ts-ignore` e casts inseguros.
- ESLint sem erros; sem imports não usados; sem `console.log` em produção.
- Funções pequenas, nomes em inglês no código e textos de UI em português-BR.
- Estados de UI: `idle`, `loading`, `success`, `empty`, `error`.
- Testes obrigatórios:
  - normalização de Google Books e Open Library;
  - parsing de ano e limpeza de texto;
  - deduplicação e agregações (categorias, autores, anos, KPIs);
  - montagem de query (`intitle`, `inauthor`, `subject`);
  - biblioteca (adicionar, atualizar status, remover, contar, JSON inválido);
  - pelo menos um componente renderizado com Testing Library.
- Execute `npm run test`, `npm run lint` e `npm run build` antes de concluir.
- Verifique o console do navegador: zero erros e zero warnings de chave/lista.
- Valide a versão de produção servida localmente, não apenas o dev server.

## 11. Checklist de aceitação

Antes de declarar a entrega concluída:

- [ ] Skill criada em `.opencode/skills/bluebook-design/SKILL.md` e efetivamente carregada.
- [ ] Paleta, tipografia, logo e componentes seguem os tokens.
- [ ] Home, Explorar, Detalhes, Biblioteca, Dados e 404 funcionam.
- [ ] Busca real na API, filtros e ordenação funcionam.
- [ ] Favoritos e status persistem após recarregar e em outra aba.
- [ ] Gráficos usam somente dados recebidos; fonte, consulta e limitações visíveis.
- [ ] Estados de loading, vazio, erro, timeout e 429 tratados.
- [ ] Capas ausentes/quebradas têm fallback.
- [ ] Navegação por teclado, foco, labels, alt e contraste verificados.
- [ ] Layout testado em mobile e desktop, sem overflow.
- [ ] Testes, lint e build passam; console limpo.
- [ ] README em português com todas as seções exigidas.
- [ ] `.gitignore` cobre `node_modules`, `dist`, `.env*`, coverage e arquivos locais.
- [ ] Nenhuma chave, token ou senha no repositório.
- [ ] Repositório e deploy só são declarados publicados após confirmação real.
