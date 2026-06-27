# Dash Panel

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Bun](https://img.shields.io/badge/bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

Dashboard personalizável com grid responsivo, cards com suporte a HTML/iframe, temas dark/light, e persistência local.

## Funcionalidades

- **Grid responsivo** — layout em CSS grid com redimensionamento de colunas e linhas via drag
- **Cards** — conteúdo HTML/iframe, edição inline, drag & drop para reorganizar
- **Temas dark/light** — alternância com persistência em `localStorage` e fallback para `prefers-color-scheme`
- **Auto-hide do header** — oculta automaticamente, reaparece ao mover o mouse para o topo da tela, com opção de fixar
- **Importar/Exportar** — salva e restaura o estado completo do grid via arquivo JSON
- **Persistência local** — todo o estado (grid, título, tema, pin do header) salvo automaticamente no `localStorage`

## Stack

- React 19 + TypeScript + Vite + Bun
- React Compiler (via babel-plugin-react-compiler)
- Tailwind CSS v4
- oxlint com regras type-aware
- Prettier + lefthook (formatação e lint no pre-commit)
- lucide-react (ícones), clsx (classes condicionais)

## Começando

```sh
bun install
bun run dev
```

### Scripts

| Comando           | Descrição                          |
| ----------------- | ---------------------------------- |
| `bun run dev` | Inicia servidor de desenvolvimento |
| `bun run build` | Type-check + build de produção |
| `bun run lint` | Executa oxlint |
| `bun run format` | Formata código com Prettier |
| `bun run preview` | Preview do build de produção |

## Uso

### Grid

- Arraste as bordas entre colunas/linhas para redimensionar
- Arraste cards para trocá-los de posição
- Use o seletor de colunas no header para alterar a quantidade de colunas
- Em dispositivos móveis (≤639px) o grid é fixo em 1 coluna

### Cards

- Passe o mouse sobre um card para ver os botões de editar e excluir
- No modo edição, o conteúdo aceita HTML (incluindo iframes)
- Card vazio exibe botão para adicionar novo card

### Tema

- Clique no ícone de sol/lua no header para alternar entre claro e escuro
- A preferência é salva e restaurada automaticamente

## Estrutura

```
src/
  types.ts                   — CardData, CellData, GridState
  hooks/
    useGridPersist.ts        — estado do grid + persistência localStorage
    useHeaderAutoHide.ts     — auto-hide do header com pin
  components/
    Grid.tsx                 — grid responsivo, resize, drag & drop
    Cell.tsx                 — célula com handles de redimensionamento
    Card.tsx                 — card com modos edição/visualização
    ConfirmModal.tsx         — modal de confirmação reutilizável
  App.tsx                    — layout, header, tema, modais, import/export
  App.css                    — background gradiente, sombra do header
  index.css                  — @import 'tailwindcss', @custom-variant dark
```
