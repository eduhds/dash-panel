# Dash Panel

## Stack

- React 19 + TypeScript + Vite + Bun
- React Compiler (via babel-plugin-react-compiler)
- Tailwind CSS v4 (`@import 'tailwindcss'`, sem config file)
- oxlint (linter), `tsc -b` (type-check)
- Prettier + lefthook (format/lint no pre-commit)
- clsx (classes condicionais)
- lucide-react (ícones)

## Estrutura

```
src/
  types.ts                         — CardData, CellData, GridState
  hooks/
    useGridPersist.ts              — estado do grid + persistência localStorage
    useHeaderAutoHide.ts           — auto-hide do header com pin
    useMediaQuery.ts               — hook genérico de media query
  components/
    Grid.tsx                       — grid responsivo, resize, drag & drop
    Cell.tsx                       — célula com handles de redimensionamento
    Card.tsx                       — card com modos edição/visualização
    Header.tsx                     — ghost title + header fixo com auto-hide
    ColumnSelector.tsx             — seletor customizado de colunas
    ConfirmModal.tsx               — modal de confirmação reutilizável
    LanguageSelector.tsx           — seletor de idioma com bandeiras e dropdown
  i18n/
    index.ts                       — config i18next com LanguageDetector
    languages.ts                   — definição das 5 línguas + matchLanguage()
    locales/
      eo.json                      — Esperanto (fallback)
      pt-BR.json                   — Português (Brasil)
      en.json                      — English
      es.json                      — Español
      zh.json                      — 中文
  test/
    setup.ts                       — setup vitest (jest-dom, cleanup, crypto polyfill)
    utils.tsx                      — TestWrapper com instância i18n isolada (pt-BR)
  App.tsx                          — layout, tema, modais, import/export, compose
  App.css                          — background gradiente
  index.css                        — @import 'tailwindcss', @custom-variant dark

e2e/
  tests/
    app.spec.ts                    — 12 testes E2E (Playwright)
```

## Temas (Dark/Light)

- Dark mode via classe `.dark` no `<html>`, alternada por `isDark` state
- Persistido em `localStorage` (`dash-panel-theme`), fallback para `prefers-color-scheme`
- `@custom-variant dark (&:where(.dark, .dark *))` no `index.css`
- Botão de toggle (`SunIcon`/`MoonIcon`) sempre visível no header
- Background do app: gradiente suave no light, `#111827` no dark (`App.css`)
- Header: `backdrop-blur-sm bg-white/95` no light, `dark:bg-gray-800/95` no dark

## Responsividade

Breakpoints (via `useMediaQuery` em `hooks/useMediaQuery.ts`):

| Tela   | Largura    | Colunas máx. | Select     |
| ------ | ---------- | ------------ | ---------- |
| Phone  | ≤639px     | 1            | oculto     |
| Small  | 640-767px  | 2            | opções 1-2 |
| Medium | 768-1023px | 4            | opções 1-4 |
| Large  | ≥1024px    | 6            | opções 1-6 |

- `maxCols` calculado via `useMemo`, `columnCount` é automaticamente clampado via `useEffect`
- Grid em phone: `gridTemplateColumns` fixa 1fr, `gridTemplateRows` fixa 180px
- Container `<main>`: `overflow-x-hidden`

## Grid (Grid.tsx)

- CSS grid com `gap: 8px`
- `gridTemplateColumns`: `minmax(0, ${w}fr)` para evitar overflow horizontal
- `gridTemplateRows`: valores fixos em px, um por linha
- `columnWidths` são percentuais (soma ≈ 100), `rowHeights` são pixels

### Redimensionamento

- **Coluna**: arraste no gap vertical → `columnWidths[i] += delta%`, `columnWidths[i+1] -= delta%`
- **Linha**: arraste no gap horizontal → `rowHeights[r] += deltaPx` (sem compensação)
- **Canto**: coluna + linha simultaneamente
- Mínimos: `MIN_COLUMN_PERCENT = 10`, `MIN_ROW_HEIGHT = 60`
- `distributeColumnDelta()`: distribui delta proporcionalmente, respeita mínimo por coluna
- Cursor do body muda durante resize (`col-resize`/`row-resize`/`se-resize`)
- `userSelect: 'none'` no body durante resize
- Overlay `<div>` full-viewport (`z-9999`) captura eventos durante resize

### Drag & Drop

- Card inteiro é `draggable`
- `dataTransfer.setData('text/plain', JSON.stringify({ sourceCellId }))`
- `effectAllowed: 'move'`
- Célula fonte: `opacity-50`, célula alvo: `ring-2 ring-blue-400 bg-blue-50`
- Drop faz **swap** de cards (troca) entre células

## Handles de redimensionamento (Cell.tsx)

- Handle de coluna: `cursor-col-resize`, 8px largura, 80% altura, posicionado no gap direito
- Handle de linha: `cursor-row-resize`, 80% largura, 8px altura, posicionado no gap inferior
- Handles com `hover:bg-gray-300` / `dark:hover:bg-gray-600`, `active:bg-blue-200` / `dark:active:bg-blue-800`
- **Cantos** (4): 16×16px, com ícone `MoveIcon` (opaco no hover via `group-hover:opacity-100`):
  - Bottom-right: `cursor-[se-resize]`, `!isLastCol` (renderizado mesmo na última linha)
  - Bottom-left: `cursor-[sw-resize]`, `!isFirstCol` (renderizado mesmo na última linha)
  - Top-right: `cursor-[ne-resize]`, `!isLastCol && !isFirstRow`
  - Top-left: `cursor-[nw-resize]`, `!isFirstCol && !isFirstRow`
- Cantos na borda esquerda ou superior do container não são renderizados

## Card (Card.tsx)

- Borda arredondada, shadow, `bg-white` / `dark:bg-gray-800`
- `cursor-grab` / `active:cursor-grabbing`, `select-none`
- Conteúdo renderizado via `dangerouslySetInnerHTML` (suporta HTML/iframes)
- Botões de ação (edit/delete): `rounded-full`, `h-7 w-7`, estilo de borda e hover seguem header, `opacity-0 group-hover:opacity-100`
- Modo edição: textarea contentEditable com `bg-amber-50` / `dark:bg-gray-700`, salva/cancela com botões no canto inferior direito

## Estado (useGridPersist.ts)

- Persistência automática em `localStorage` (chave `dash-panel-grid-state`)
- 3 cards de amostra com iframe de `randomcolour.com`, 1 célula vazia
- `columnCount` inicial: 3, `columnWidths` iguais, `rowHeights`: 200px
- Ações: `setColumnCount`, `setColumnWidths`, `setRowHeights`, `moveCard`, `addCard`, `removeCard`, `updateCardContent`, `replaceState`, `resetDimensions`, `resetGrid`
- Ao mudar `columnCount`: `columnWidths` e `rowHeights` recriados igualmente
- `generateId()`: `crypto.randomUUID()`

## Header Auto-Hide (useHeaderAutoHide.ts)

- **Pin**: persistido em `localStorage` (`dash-panel-header-pinned`)
- **Comportamento**:
  1. Início: header visível, oculta após 2s (se não fixado)
  2. Mouse sobre o header: mantém visível
  3. Mouse sai do header: oculta após 1.5s
  4. Mouse no topo da tela (y ≤ 40): exibe header, oculta após 3s se mouse não entrar
  5. Fixado: header sempre visível
- Usa refs (`isPinnedRef`, `isVisibleRef`) para evitar stale closures no listener `mousemove` global

## Importação/Exportação (App.tsx)

- **Export**: `JSON.stringify(state, null, 2)` → Blob → download como `dash-panel-state.json`
- **Import**: `<input type="file" accept=".json">` → FileReader → valida `columnCount`, `cells`, `columnWidths` → `ConfirmModal` → `replaceState()`
- **Reset**: `ConfirmModal` com `confirmVariant='danger'` → `resetGrid()`
- **Reset Dimensions** (não-destrutivo): `resetDimensions()` → equaliza larguras e alturas, mantém cards

## Modais (ConfirmModal.tsx)

- Props: `isOpen`, `title`, `message`, `onConfirm`, `onCancel`, `confirmVariant` (`'primary'` | `'danger'`)
- Overlay fullscreen com `bg-black/40`, fecha ao clicar fora
- Botão confirmar: azul (primary) ou vermelho (danger)

## Header (Header.tsx)

- Ghost title spacer (`relative h-14`) no fluxo normal — o título centralizado rola junto com o conteúdo
- Header fixo (`fixed inset-x-0 top-0 z-30`) que aparece/desaparece via `translate-y` e `opacity`
- Recebe callbacks de `App.tsx`: `onTitleChange`, `onToggleTheme`, `onTogglePin`, `onImportClick`, `onExport`, `onResetDimensions`, `onReset`
- Botão padrão extraído em constante `btnBase` para reuso
- Sombra inline com `shadow-[...]` em vez de classe `.app-header`
- Título `contentEditable`, salva no blur ou Enter, reverte se vazio
- Pin ativo: `border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-400`
- Reset (erro): `border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20`

## ColumnSelector (ColumnSelector.tsx)

- Join visual com ícone `Grid2X2Icon`, `<select>` invisível sobreposto (`opacity-0 absolute inset-0`), `pointer-events-none` nos elementos visuais
- Props: `columnCount`, `availableCols`, `onChange`

## LanguageSelector (LanguageSelector.tsx)

- Dropdown customizado com bandeiras (emoji) e nome do idioma
- Abre/fecha ao clicar, fecha ao clicar fora (`mousedown` listener no `document`)
- Opção ativa destacada com `bg-blue-50 text-blue-700` / `dark:bg-blue-900/30 dark:text-blue-400`
- 5 idiomas: Esperanto (🌐), Português (🇧🇷), English (🇺🇸), Español (🇪🇸), 中文 (🇨🇳)
- Ao selecionar: `i18n.changeLanguage(code)`, detectado via `i18next-browser-languagedetector`
- Ordem de detecção: `localStorage` → `navigator` → `htmlTag`; cache em `localStorage` (chave `dash-panel-lng`)

## useMediaQuery (useMediaQuery.ts) — hook genérico de media query

## i18n / Idiomas

- `react-i18next` + `i18next-browser-languagedetector`
- Config em `src/i18n/index.ts`: fallback `'eo'`, detecção `localStorage → navigator → htmlTag`
- 5 traduções em `src/i18n/locales/`: `eo.json` (fallback), `pt-BR.json`, `en.json`, `es.json`, `zh.json`
- `src/i18n/languages.ts`: `LanguageOption[]` com `code`, `label`, `flag` + `matchLanguage()` que normaliza `en-US` → `en`, `pt` → `pt-BR`
- `LanguageSelector.tsx` no header: dropdown com bandeiras, `i18n.changeLanguage(code)` ao selecionar
- Testes unitários em `src/i18n/__tests__/languages.test.ts`

## Testes

### Unitários (Vitest)

- **Runner**: Vitest (`vitest run` / `vitest`)
- **Ambiente**: `jsdom`, config em `vite.config.ts` (`test.environment`, `test.setupFiles`)
- **Setup**: `src/test/setup.ts` — `@testing-library/jest-dom/vitest`, `cleanup()`, polyfill `crypto.randomUUID()`
- **Wrapper**: `src/test/utils.tsx` — `TestWrapper` com instância i18n isolada (idioma `pt-BR`)
- **Arquivos**:
  - `src/i18n/__tests__/languages.test.ts` — `matchLanguage()` com todas as combinações de locale
  - `src/components/__tests__/ConfirmModal.test.tsx` — renderização, botões, clique no overlay, variantes
  - `src/components/__tests__/Card.test.tsx` — renderização, edição, save/cancel, delete com confirmação

### E2E (Playwright)

- **Runner**: `@playwright/test` (`playwright test`)
- **Config**: `playwright.config.ts` — Chromium, `screenshot: 'on'`, `video: 'on'`, `trace: 'retain-on-failure'`, `retries: 1`
- **Servidor**: Vite iniciado via `webServer` (`bun run dev`) na porta 5173
- **Script**: `bun run test:e2e`
- **Arquivo**: `e2e/tests/app.spec.ts` — 12 testes: grid inicial, theme toggle, editar/salvar/cancelar card, deletar com cancelamento, deletar com confirmação, adicionar card, mudar colunas, trocar idioma, reset dimensions, viewport phone, reset destrutivo

## Persistência (localStorage)

| Chave                      | Conteúdo              | Local               |
| -------------------------- | --------------------- | ------------------- |
| `dash-panel-grid-state`    | `GridState` JSON      | `useGridPersist`    |
| `dash-panel-title`         | string                | App.tsx             |
| `dash-panel-theme`         | `'dark'` ou `'light'` | App.tsx             |
| `dash-panel-header-pinned` | `'true'` ou `'false'` | `useHeaderAutoHide` |
| `dash-panel-lng`           | código do idioma      | i18next             |

## Padrões de Código

- `useCallback` para handlers passados como props
- `useMemo` para valores derivados (widths, rowHeights, maxCols, gridTemplateRows)
- `clsx` para classes condicionais (template literals com ternário foram refatorados)
- Refs mutáveis para event listeners no `window` (evitar stale closures)
- CSS grid: gap de 8px, handles posicionados com valores negativos no gap
- Tailwind arbitraries: `cursor-[se-resize]`, `w-[80%]`, etc.
- Sem comentários no código
- `dangerouslySetInnerHTML` para conteúdo de cards (HTML/iframe)
- `contentEditable` para edição inline de título e conteúdo de card
- Ícones importados individualmente de `lucide-react` (tree-shaking nativo)
