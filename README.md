# BlueBook — Seu Universo de Leitura

Aplicação web acadêmica para **descobrir livros, organizar uma biblioteca pessoal e analisar dados literários reais**. O BlueBook consulta APIs públicas de livros, normaliza os registros recebidos e apresenta indicadores e gráficos derivados exclusivamente desses dados — sem catálogo fictício e sem números simulados.

> Projeto acadêmico de desenvolvimento web · 2026

---

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como executar](#como-executar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Fontes de dados e resiliência](#fontes-de-dados-e-resiliência)
- [Análise de dados e gráficos](#análise-de-dados-e-gráficos)
- [Biblioteca pessoal](#biblioteca-pessoal)
- [Acessibilidade e responsividade](#acessibilidade-e-responsividade)
- [Testes e qualidade](#testes-e-qualidade)
- [Skill do OpenCode](#skill-do-opencode)
- [Publicação no GitHub Pages](#publicação-no-github-pages)
- [Limitações conhecidas](#limitações-conhecidas)
- [Uso acadêmico](#uso-acadêmico)

---

## Visão geral

O BlueBook foi construído como um artefato acadêmico completo: interface editorial em azul, busca real, biblioteca persistente no navegador e um painel analítico transparente. A aplicação funciona inteiramente no cliente (React + Vite), sem backend próprio, e pode ser publicada como site estático.

**Páginas disponíveis**

| Rota | Página | Destaques |
|---|---|---|
| `/` | Início | Hero editorial, busca, destaques reais, explicação do fluxo |
| `/explorar` | Explorar livros | Busca por título/autor/assunto, filtros, ordenação, paginação |
| `/livro/:source/:sourceId` | Detalhes do livro | Capa, metadados condicionais, descrição, favoritar e status |
| `/biblioteca` | Minha biblioteca | Favoritos persistentes, contadores, status, remoção com desfazer |
| `/dados` | Análise de dados | KPIs, gráficos, tabelas acessíveis, metodologia e limitações |
| `*` | 404 | Mensagem clara e atalhos de retorno |

A navegação usa `HashRouter` e o build usa caminhos relativos (`base: './'`), permitindo hospedagem em subdiretórios do GitHub Pages.

---

## Funcionalidades

- **Busca real** por termo livre, título, autor ou assunto, com consulta montada para a API.
- **Filtros** por categoria e intervalo de anos, com chips de filtros ativos e limpeza rápida.
- **Ordenação** por relevância, título, ano (ascendente/descendente) e número de páginas.
- **Paginação local** de 12 livros por página sobre uma amostra de até 40 registros.
- **Estados completos de interface**: carregando, vazio, erro, timeout, cota excedida e contingência.
- **Detalhes do livro** com metadados condicionais (editora, páginas, idioma, avaliação, ISBN) e link de prévia quando disponível.
- **Biblioteca pessoal** com três status (`Quero ler`, `Lendo`, `Concluído`), contadores, remoção reversível e sincronização entre abas.
- **Persistência em `localStorage`** com chave versionada `bluebook:library:v1`.
- **Análise de dados real** com KPIs, distribuição por categoria, autores frequentes, publicações por ano/década e qualidade dos dados.
- **Exportação CSV** da amostra analisada, em UTF-8 com BOM.
- **Acessibilidade**: skip link, foco visível, labels, `aria-live`, tabelas equivalentes aos gráficos e respeito a `prefers-reduced-motion`.
- **Design responsivo** com identidade azul, tipografia editorial e logotipo próprio de livro aberto em SVG.

---

## Tecnologias

- [React 19](https://react.dev/) + [TypeScript 7](https://www.typescriptlang.org/) (modo `strict`)
- [Vite 8](https://vite.dev/) com `HashRouter`
- [React Router 7](https://reactrouter.com/)
- [Recharts 3](https://recharts.org/) para gráficos
- [lucide-react](https://lucide.dev/) para ícones
- [Vitest 5](https://vitest.dev/) + Testing Library + jsdom
- [oxlint](https://oxc.rs/) para lint
- CSS puro organizado por tokens (`src/styles/`)

---

## Estrutura do projeto

```text
bluebook-seu-universo-de-leitura/
├── .github/workflows/deploy.yml     # CI + deploy no GitHub Pages
├── .opencode/skills/bluebook-design # Skill do projeto
├── public/favicon.svg
├── src/
│   ├── components/                  # UI reutilizável (um componente por arquivo)
│   ├── context/                     # Biblioteca pessoal e toasts
│   ├── data/                        # Normalização, deduplicação e análise pura
│   ├── hooks/                       # Busca, detalhe, documento, toast, etc.
│   ├── lib/                         # Constantes, texto, formatadores, CSV, storage
│   ├── pages/                       # Páginas de rota
│   ├── services/                    # HTTP, Google Books, Open Library, cache
│   ├── styles/                      # tokens, base, layout, componentes e páginas
│   ├── test/                        # Setup, fixtures e testes
│   ├── types/                       # Contratos TypeScript
│   ├── App.tsx                      # Rotas com lazy loading
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

Princípios adotados:

- Serviços não importam componentes; componentes não chamam `fetch` diretamente.
- A análise é composta por funções puras, sem dependência de React.
- O acesso ao `localStorage` fica isolado em `lib/libraryStorage.ts` e no contexto.
- Constantes de API, limites e chaves ficam centralizadas em `lib/constants.ts`.

---

## Como executar

Pré-requisito: **Node.js 20+** (o workflow usa Node 22) e npm.

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev
```

Abra o endereço exibido pelo Vite (por padrão `http://localhost:5173`).

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem TypeScript + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run test` | Vitest em modo watch |
| `npm run test:run` | Vitest uma única vez |
| `npm run coverage` | Testes com relatório de cobertura |
| `npm run lint` | Análise estática com oxlint |

### Build de produção

```bash
npm run build
npm run preview
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha se necessário:

```env
VITE_GOOGLE_BOOKS_API_KEY=
VITE_GOOGLE_BOOKS_COUNTRY=BR
```

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_GOOGLE_BOOKS_API_KEY` | Não | Chave da Google Books API. A cota anônima pode retornar HTTP 429. |
| `VITE_GOOGLE_BOOKS_COUNTRY` | Não | Código de país usado na consulta (padrão sugerido: `BR`). |

> **Segurança:** variáveis `VITE_*` são incorporadas ao bundle do navegador. Nunca comite `.env` ou `.env.local`; o `.gitignore` já os ignora. Restrinja a chave por referrer HTTP e por API no Google Cloud.

---

## Fontes de dados e resiliência

### Fonte primária: Google Books API v1

- Busca: `GET https://www.googleapis.com/books/v1/volumes?q=...`
- Detalhe: `GET https://www.googleapis.com/books/v1/volumes/{volumeId}`
- Documentação: <https://developers.google.com/books/docs/v1/using>
- Consultas: `intitle:"termo"`, `inauthor:"termo"`, `subject:"termo"` ou termo livre.
- `maxResults` limitado a 40 por requisição.

### Contingência: Open Library

Se a Google Books API estiver indisponível — em especial por **HTTP 429 (cota)** —, a aplicação tenta a API pública da [Open Library](https://openlibrary.org/developers/api). A interface exibe um aviso explícito de contingência, com o motivo técnico, e todos os dados continuam sendo reais. O fallback **nunca** é apresentado como Google Books.

### Tratamento de erros

- Timeout de 14 s com `AbortController`.
- Distinção entre erro de parâmetro (`400`), permissão/chave (`403`), cota (`429`), indisponibilidade (`5xx`), rede e JSON inválido.
- Uma tentativa adicional com backoff curto para `429/5xx`.
- Cache em memória por consulta durante a sessão.
- Nenhum dado mockado ou preenchido manualmente em produção.

> **Observação da validação local:** durante o desenvolvimento, a chamada anônima à Google Books API retornou HTTP 429 com `quota_limit_value: "0"`. A aplicação exibiu o motivo e utilizou a Open Library como contingência. Para usar a cota autenticada, configure `VITE_GOOGLE_BOOKS_API_KEY`.

### Normalização

Os registros das duas fontes são convertidos para um tipo canônico `Book`:

- `id` prefixado (`google:<volumeId>` ou `openlibrary:<workId>`).
- Título obrigatório; registros sem título são descartados.
- Autores e categorias limpos, sem duplicatas; categorias compostas são divididas.
- Ano derivado apenas quando há quatro dígitos plausíveis.
- Descrição sem HTML, entidades ou marcações simples de Markdown.
- Capas em HTTPS com fallback visual por iniciais.
- Deduplicação por `id` e por título + primeiro autor normalizados.

---

## Análise de dados e gráficos

A página **Análise de dados** trabalha com uma amostra de até **40 registros** retornados pela consulta escolhida. O usuário pode selecionar assunto, buscar por termo e usar presets (Ficção, Fantasia, Ciência, História, Romance).

### Indicadores (KPIs)

- registros recebidos e registros válidos;
- títulos únicos;
- categorias e autores distintos;
- anos cobertos e período (ano ou década);
- média de páginas (somente livros com página informada);
- registros sem capa, ano, categoria, descrição ou páginas.

### Gráficos

- **Livros por categoria** — barras horizontais, top 8 categorias.
- **Autores mais frequentes** — barras horizontais, top 8 autores.
- **Publicações por ano ou década** — barras verticais; agrupamento por década quando a amplitude supera 25 anos.
- **Distribuição por categoria principal** — rosca com as 6 maiores categorias e “Outros”.

Cada gráfico possui título, descrição, nota de base, `aria-label` e uma **tabela equivalente** acessível. Os percentuais sempre indicam a base utilizada.

### Metodologia e limitações

A página inclui um cartão de metodologia com:

- consulta exibida ao usuário e expressão enviada à API;
- fonte efetivamente utilizada;
- data/hora da coleta;
- tamanho da amostra e filtros aplicados;
- qualidade dos dados (campos ausentes);
- limitação explícita: **a amostra representa os resultados retornados pela consulta, não todo o mercado editorial**.

Também é possível exportar a amostra em CSV (UTF-8 com BOM) para auditoria.

---

## Biblioteca pessoal

- Favoritos persistidos em `localStorage` na chave `bluebook:library:v1`.
- Status: `Quero ler`, `Lendo`, `Concluído`.
- Contadores por status e total.
- Remoção com feedback via toast e opção de **desfazer**.
- Sincronização entre abas pelo evento `storage`.
- Tratamento de JSON inválido, storage indisponível e cota excedida sem quebrar a interface.
- A biblioteca é **local**: não há conta, servidor ou sincronização entre dispositivos.

---

## Acessibilidade e responsividade

- HTML semântico (`header`, `nav`, `main`, `section`, `footer`, listas, botões e links).
- Um `<h1>` por página e hierarquia de títulos sem saltos.
- Skip link “Pular para o conteúdo”.
- Foco `:focus-visible` com anel azul.
- Menu móvel com `aria-expanded`, fechamento por `Escape` e gerenciamento de foco.
- Labels visíveis ou `sr-only`; erros com `role="alert"`; resultados com `aria-live`.
- Alvos de toque com pelo menos 44 px.
- Contraste de texto secundário ajustado para ≥ 4.5:1 (token `--text-muted`).
- Gráficos com tabelas equivalentes e descrição textual.
- `prefers-reduced-motion` respeitado.
- Layout mobile-first, testado sem rolagem horizontal.

---

## Testes e qualidade

```bash
npm run test:run
npm run lint
npm run build
```

**Situação atual deste repositório:**

- `39` testes passando em `5` arquivos.
- Cobertura de normalização (Google Books e Open Library), análise, queries, storage da biblioteca e componentes com Testing Library.
- Lint sem erros ou avisos.
- Build de produção concluído com code splitting por rota.
- Validação no build de produção (`vite preview`) nas seis páginas: Início, Explorar, Detalhes, Biblioteca, Dados e 404.
- Lighthouse **100** em acessibilidade, boas práticas e SEO nas seis páginas auditadas.
- Sem rolagem horizontal em viewport de 390 px nas páginas Explorar e Dados, e no desktop.

Os testes cobrem, entre outros pontos:

- parsing de ano e limpeza de HTML/entidades/Markdown;
- deduplicação e agregações (categorias, autores, anos, KPIs);
- montagem de consultas `intitle`, `inauthor` e `subject`;
- biblioteca: adicionar, atualizar status, remover, contar e JSON inválido;
- renderização do formulário de busca e persistência a partir do card de livro.

---

## Skill do OpenCode

O projeto inclui uma Skill própria em:

```text
.opencode/skills/bluebook-design/SKILL.md
```

Ela define paleta, tipografia, componentes, organização de arquivos, regras de API, análise de dados, acessibilidade, responsividade, testes e checklist de aceitação.

**Como usar no OpenCode:** carregue a Skill `bluebook-design` antes de alterar o projeto (pelo comando de Skills da interface ou pela ferramenta `skill`). A Skill também está disponível no workspace canônico em `.opencode/skills/bluebook-design/SKILL.md`.

---

## Publicação no GitHub Pages

O workflow `.github/workflows/deploy.yml` executa testes, lint e build a cada push na branch `main` e publica o conteúdo de `dist/` no GitHub Pages.

### Passos manuais (repositório ainda não publicado por este ambiente)

Não há, nesta entrega, URL pública confirmada. Para publicar:

```bash
# 1. Crie o repositório no GitHub (interface web ou gh CLI)
#    Nome sugerido: bluebook-seu-universo-de-leitura

# 2. No diretório do projeto, conecte o remoto
git remote add origin https://github.com/<SEU_USUARIO>/bluebook-seu-universo-de-leitura.git

# 3. Envie a branch principal
git push -u origin main
```

Depois, no GitHub:

1. Abra **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Aguarde o workflow **Deploy para GitHub Pages** concluir.
4. A URL será exibida no ambiente `github-pages` e em **Settings → Pages**.

> Opcional: cadastre `VITE_GOOGLE_BOOKS_API_KEY` em **Settings → Secrets and variables → Actions** para usar a cota autenticada da Google Books API no deploy. Sem o secret, a aplicação tenta a chamada anônima e pode usar a Open Library como contingência.

### Build manual para hospedagem estática

```bash
npm ci
npm run build
# publique o conteúdo de dist/
```

---

## Limitações conhecidas

- A cota anônima da Google Books API pode retornar HTTP 429; nesse caso a Open Library é usada como contingência e isso é informado na interface.
- A análise representa apenas a amostra retornada pela consulta (até 40 registros), não o mercado editorial completo.
- Campos ausentes na API não são inventados; os gráficos e KPIs mostram a base efetiva.
- A biblioteca é local ao navegador e não sincroniza entre dispositivos.
- A qualidade dos metadados depende das fontes públicas consultadas.
- Não há backend, autenticação ou banco de dados.

---

## Uso acadêmico

Projeto desenvolvido para fins acadêmicos e demonstrativos. Os dados literários pertencem às respectivas fontes: **Google Books API** e **Open Library**. As capas e metadados são exibidos conforme retornados pelas APIs públicas.
