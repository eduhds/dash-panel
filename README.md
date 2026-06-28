# Dash Panel

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Bun](https://img.shields.io/badge/bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Playwright](https://img.shields.io/badge/playwright-%232EAD33.svg?style=for-the-badge&logo=playwright&logoColor=white)
![Vitest](https://img.shields.io/badge/vitest-%236E4F13.svg?style=for-the-badge&logo=vitest&logoColor=white)

Dashboard personalizável com grid responsivo, cards com suporte a HTML/iframe, temas dark/light, i18n com 5 idiomas, e persistência local.

## Funcionalidades

- **Grid responsivo** — layout em CSS grid com redimensionamento de colunas e linhas via drag
- **Cards** — conteúdo HTML/iframe, edição inline, drag & drop para reorganizar
- **Temas dark/light** — alternância com persistência em `localStorage` e fallback para `prefers-color-scheme`
- **Auto-hide do header** — oculta automaticamente, reaparece ao mover o mouse para o topo da tela, com opção de fixar
- **Importar/Exportar** — salva e restaura o estado completo do grid via arquivo JSON
- **Reset destrutivo** — redefine o grid ao estado inicial (com confirmação)
- **Reset de dimensões** — equaliza larguras e alturas sem perder os cards
- **i18n / 5 idiomas** — Esperanto, Português, English, Español, 中文 (detecção automática do navegador)
- **Persistência local** — todo o estado (grid, título, tema, pin do header, idioma) salvo automaticamente no `localStorage`

## Stack

- React 19 + TypeScript + Vite + Bun
- React Compiler (via babel-plugin-react-compiler)
- Tailwind CSS v4
- oxlint + `tsc -b` (type-check)
- Prettier + lefthook (formatação e lint no pre-commit)
- i18next + react-i18next + i18next-browser-languagedetector
- lucide-react (ícones), clsx (classes condicionais)
- Vitest + Testing Library (testes unitários)
- Playwright (testes E2E)

## Começando

```sh
bun install
bun run dev
```

### Scripts

| Comando                | Descrição                          |
| ---------------------- | ---------------------------------- |
| `bun run dev`          | Inicia servidor de desenvolvimento |
| `bun run build`        | Type-check + build de produção     |
| `bun run preview`      | Preview do build de produção       |
| `bun run lint`         | Executa oxlint                     |
| `bun run format`       | Formata código com Prettier        |
| `bun run format:check` | Verifica formatação sem alterar    |
| `bun run test`         | Executa testes unitários (Vitest)  |
| `bun run test:watch`   | Testes unitários em modo watch     |
| `bun run test:e2e`     | Executa testes E2E (Playwright)    |

## Uso

### Grid

- Arraste as bordas entre colunas/linhas para redimensionar
- Arraste cards para trocá-los de posição
- Use o seletor de colunas no header para alterar a quantidade de colunas
- Em dispositivos móveis (≤639px) o grid é fixo em 1 coluna
- Handles de redimensionamento disponíveis também na última linha

### Cards

- Passe o mouse sobre um card para ver os botões de editar e excluir
- No modo edição, o conteúdo aceita HTML (incluindo iframes)
- A exclusão de um card requer confirmação
- Card vazio exibe botão para adicionar novo card

### Tema

- Clique no ícone de sol/lua no header para alternar entre claro e escuro
- A preferência é salva e restaurada automaticamente

### Idiomas

- O header exibe um seletor de idioma com bandeiras
- 5 idiomas disponíveis: Esperanto (🌐), Português (🇧🇷), English (🇺🇸), Español (🇪🇸), 中文 (🇨🇳)
- A detecção automática usa `localStorage` → navegador → fallback para Esperanto

## Testes

### Unitários (Vitest)

```sh
bun run test        # executa uma vez
bun run test:watch  # modo watch
```

- Ambiente jsdom com `@testing-library/react`
- Testes em `src/components/__tests__/` e `src/i18n/__tests__/`
- Wrapper i18n isolado para testes (idioma `pt-BR`)

### E2E (Playwright)

```sh
bun run test:e2e
```

- Chromium, com captura de screenshot e vídeo em cada teste
- O servidor Vite é iniciado automaticamente
- 12 testes cobrindo grid, temas, cards, idioma, reset, responsividade
- Trace disponível em caso de falha

## Estrutura

```
src/
  types.ts                   — CardData, CellData, GridState
  hooks/
    useGridPersist.ts        — estado do grid + persistência localStorage
    useHeaderAutoHide.ts     — auto-hide do header com pin
    useMediaQuery.ts         — hook genérico de media query
  components/
    Grid.tsx                 — grid responsivo, resize, drag & drop
    Cell.tsx                 — célula com handles de redimensionamento
    Card.tsx                 — card com modos edição/visualização
    Header.tsx               — ghost title + header fixo com auto-hide
    ColumnSelector.tsx       — seletor customizado de colunas
    ConfirmModal.tsx         — modal de confirmação reutilizável
    LanguageSelector.tsx     — seletor de idioma com bandeiras e dropdown
  i18n/
    index.ts                 — config i18next com LanguageDetector
    languages.ts             — definição das 5 línguas + matchLanguage()
    locales/                 — traduções (eo, pt-BR, en, es, zh)
  test/
    setup.ts                 — setup vitest (jest-dom, cleanup, crypto)
    utils.tsx                — TestWrapper com i18n isolada
  App.tsx                    — layout, header, tema, modais, import/export
  App.css                    — background gradiente
  index.css                  — @import 'tailwindcss', @custom-variant dark

e2e/
  tests/
    app.spec.ts              — 12 testes E2E (Playwright)
```
