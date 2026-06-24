# Dash Panel

## Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (utility-first, arbitrary values via `[]` syntax)
- oxlint (linter), `tsc -b` (type-check)

## Estrutura
```
src/
  types.ts              — CardData, CellData, GridState
  hooks/useGridPersist.ts  — estado + persistência localStorage
  components/
    Grid.tsx            — grid responsivo, resize logic, drag & drop
    Cell.tsx            — célula individual com handles de redimensionamento
    Card.tsx            — card interno, arrastável como um todo
  App.tsx               — layout, header com seletor de colunas
```

## Grid (Grid.tsx)
- Renderiza células em `display: grid` com `gap: 8px`
- `gridTemplateColumns`: `minmax(0, ${w}fr)` para evitar overflow horizontal
- `gridTemplateRows`: valores fixos em px, um por linha
- Container `<main>` tem `overflow-x-hidden`

### Responsividade
- `isPhone` via media query `(max-width: 640px)`: força 1 coluna
- Desktop: 1–6 colunas, configurável via `<select>` no header

### Redimensionamento
- **Coluna**: arraste no gap vertical → `columnWidths[i] += delta%`, `columnWidths[i+1] -= delta%`
- **Linha**: arraste no gap horizontal → `rowHeights[r] += deltaPx`, `rowHeights[r+1] -= deltaPx`
- **Última linha**: redimensiona sem compensação (`rowHeights[r] += deltaPx`)
- **Canto**: redimensiona coluna + linha simultaneamente, com compensação
- Mínimos: `MIN_COLUMN_PERCENT = 10`, `MIN_ROW_HEIGHT = 60`
- Cursor do body muda durante resize e volta ao normal no mouseup
- `userSelect: 'none'` no body durante resize

### Handles de redimensionamento (Cell.tsx)
- Handle de coluna (`cursor-col-resize`): `top-1/2 -translate-y-1/2`, `width: 8px`, `height: 80%`, `rounded`
- Handle de linha (`cursor-row-resize`): `left-1/2 -translate-x-1/2`, `width: 80%`, `height: 8px`, `rounded`
- Handles: `bg-gray-200`, `hover:bg-gray-300`, `active:bg-blue-200`, posicionados no gap (-8px)
- **Cantos** (4): 8×8px, sem bg padrão, `rounded`, `hover:bg-gray-300`:
  - Bottom-right: `se-resize`, `!isLastCol && !isLastRow`
  - Bottom-left: `sw-resize`, `!isFirstCol && !isLastRow`
  - Top-right: `ne-resize`, `!isLastCol && !isFirstRow`
  - Top-left: `nw-resize`, `!isFirstCol && !isFirstRow`
- Cantos na borda do container não são renderizados

### Drag & Drop de Cards
- Card inteiro é `draggable` (sem header específico)
- `dataTransfer.setData('text/plain', JSON.stringify({ sourceCellId }))`
- `effectAllowed: 'move'`
- Célula fonte recebe `opacity-50`, célula alvo recebe `ring-2 ring-blue-400 bg-blue-50`
- Drop faz swap de cards (troca) entre células de origem e destino
- Estado `dragOverCellId` e `dragSourceCellId` gerenciados no Grid

## Card (Card.tsx)
- Borda arredondada, shadow, bg-white
- `cursor-grab` / `active:cursor-grabbing`
- `select-none` no card inteiro
- Exibe `title` (label) e `content` (valor grande)

## Estado (useGridPersist.ts)
- Persistência automática em `localStorage` (chave `dash-panel-grid-state`)
- 12 células iniciais, 3 colunas, 3 rows
- `rowHeights` salvos no estado e restaurados
- Ações: `setColumnCount`, `setColumnWidths`, `setRowHeights`, `moveCard`, `resetGrid`
- Ao mudar número de colunas: `columnWidths` e `rowHeights` são recriados
- 12 cards de amostra com cores e métricas variadas

## Padrões de Código
- `useCallback` para handlers passados como props
- `useMemo` para valores derivados (widths, rowHeights, totalRows)
- Estados de arraste/resize via `useState` no Grid, não no hook global
- CSS grid: gap de 8px, handles posicionados com valores negativos no gap
- Tailwind arbitraries: `cursor-[se-resize]`, `w-[80%]`, etc.
- Sem comentários no código
