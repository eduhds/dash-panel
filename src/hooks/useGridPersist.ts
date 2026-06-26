import { useCallback, useEffect, useState } from 'react';

import type { CardData, CellData, GridState } from '../types';

const STORAGE_KEY = 'dash-panel-grid-state';
const INITIAL_HEIGHT = 200;

function sampleWidget(title: string, value: string, subtitle: string, color: string): string {
  return '<iframe src="https://randomcolour.com" style="width:100%;height:100%;border:none" />';
  return `<div style="display:flex;flex-direction:column;height:100%;padding:16px;box-sizing:border-box">
    <div style="flex-shrink:0;width:100%;height:3px;border-radius:2px;background:${color};margin-bottom:12px"></div>
    <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">${title}</span>
    <span style="font-size:28px;font-weight:700;color:#111827;margin-top:4px">${value}</span>
    <span style="font-size:12px;color:#9ca3af;margin-top:auto">${subtitle}</span>
  </div>`;
}

const SAMPLE_CARDS: CardData[] = [
  {
    id: 'card-1',
    title: 'Receita Total',
    content: sampleWidget('Receita Total', 'R$ 128.450', '+12% vs mês anterior', '#10b981'),
    color: '#10b981'
  },
  {
    id: 'card-2',
    title: 'Usuários Ativos',
    content: sampleWidget('Usuários Ativos', '24.380', '+8% vs mês anterior', '#3b82f6'),
    color: '#3b82f6'
  },
  {
    id: 'card-3',
    title: 'Taxa de Conversão',
    content: sampleWidget('Taxa de Conversão', '3,42%', '+0,8pp vs mês anterior', '#f59e0b'),
    color: '#f59e0b'
  },
  {
    id: 'card-4',
    title: 'Ticket Médio',
    content: sampleWidget('Ticket Médio', 'R$ 847', '+5% vs mês anterior', '#8b5cf6'),
    color: '#8b5cf6'
  },
  {
    id: 'card-5',
    title: 'Novos Cadastros',
    content: sampleWidget('Novos Cadastros', '3.215', '+22% vs mês anterior', '#06b6d4'),
    color: '#06b6d4'
  },
  {
    id: 'card-6',
    title: 'Churn Rate',
    content: sampleWidget('Churn Rate', '1,8%', '-0,3pp vs mês anterior', '#ef4444'),
    color: '#ef4444'
  },
  {
    id: 'card-7',
    title: 'Net Promoter Score',
    content: sampleWidget('Net Promoter Score', '72', '+5 vs trimestre anterior', '#14b8a6'),
    color: '#14b8a6'
  },
  {
    id: 'card-8',
    title: 'Meta Mensal',
    content: sampleWidget('Meta Mensal', '87%', 'Faltam R$ 18.200', '#f97316'),
    color: '#f97316'
  },
  {
    id: 'card-9',
    title: 'Tarefas Pendentes',
    content: sampleWidget('Tarefas Pendentes', '143', '34 com prioridade alta', '#6366f1'),
    color: '#6366f1'
  },
  {
    id: 'card-10',
    title: 'Tempo Médio Sessão',
    content: sampleWidget('Tempo Médio Sessão', '4min 32s', '+18s vs mês anterior', '#ec4899'),
    color: '#ec4899'
  },
  {
    id: 'card-11',
    title: 'Bounce Rate',
    content: sampleWidget('Bounce Rate', '32,5%', '-2,1pp vs mês anterior', '#a855f7'),
    color: '#a855f7'
  },
  {
    id: 'card-12',
    title: 'ROI',
    content: sampleWidget('ROI', '3,8x', '+0,4x vs trimestre anterior', '#22c55e'),
    color: '#22c55e'
  }
];

function generateId(): string {
  return crypto.randomUUID();
}

function createInitialCells(count: number): CellData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `cell-${generateId()}`,
    card: i < SAMPLE_CARDS.length ? { ...SAMPLE_CARDS[i] } : null
  }));
}

function createInitialGrid(): GridState {
  const columnCount = 3;
  const cellCount = SAMPLE_CARDS.length + 1;
  const rowCount = Math.ceil(cellCount / columnCount);
  return {
    columnCount,
    cells: createInitialCells(cellCount),
    columnWidths: Array.from({ length: columnCount }, () => 100 / columnCount),
    rowHeights: Array.from({ length: rowCount }, () => INITIAL_HEIGHT)
  };
}

function loadState(): GridState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.columnCount || !parsed.cells || !parsed.columnWidths) return null;
    if (!Array.isArray(parsed.rowHeights)) {
      parsed.rowHeights = Array.from(
        { length: Math.ceil(parsed.cells.length / parsed.columnCount) },
        () => INITIAL_HEIGHT
      );
    }
    return parsed as GridState;
  } catch {
    return null;
  }
}

export function useGridPersist() {
  const [state, setState] = useState<GridState>(() => loadState() ?? createInitialGrid());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const setColumnCount = useCallback((count: number) => {
    setState(prev => {
      const clampedCount = Math.max(1, Math.min(6, count));
      const rowCount = Math.ceil(prev.cells.length / clampedCount);
      return {
        ...prev,
        columnCount: clampedCount,
        columnWidths: Array.from({ length: clampedCount }, () => 100 / clampedCount),
        rowHeights: Array.from({ length: rowCount }, () => INITIAL_HEIGHT)
      };
    });
  }, []);

  const setColumnWidths = useCallback((widths: number[]) => {
    setState(prev => ({ ...prev, columnWidths: widths }));
  }, []);

  const setRowHeights = useCallback((heights: number[]) => {
    setState(prev => ({ ...prev, rowHeights: heights }));
  }, []);

  const moveCard = useCallback((fromCellId: string, toCellId: string) => {
    setState(prev => {
      if (fromCellId === toCellId) return prev;
      const fromCell = prev.cells.find(c => c.id === fromCellId);
      const toCell = prev.cells.find(c => c.id === toCellId);
      if (!fromCell || !toCell) return prev;
      return {
        ...prev,
        cells: prev.cells.map(cell => {
          if (cell.id === fromCellId) return { ...cell, card: toCell.card };
          if (cell.id === toCellId) return { ...cell, card: fromCell.card };
          return cell;
        })
      };
    });
  }, []);

  const addCard = useCallback(() => {
    setState(prev => {
      const emptyIndex = prev.cells.findIndex(c => c.card === null);
      if (emptyIndex === -1) return prev;

      const newCard: CardData = {
        id: `card-${generateId()}`,
        title: 'Novo Card',
        content:
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:14px;color:#9ca3af">Vazio</div>',
        color: '#9ca3af'
      };

      const newCells = prev.cells.map((c, i) => (i === emptyIndex ? { ...c, card: newCard } : c));
      newCells.push({ id: `cell-${generateId()}`, card: null });

      const newRowCount = Math.ceil(newCells.length / prev.columnCount);
      const newRowHeights = [...prev.rowHeights];
      while (newRowHeights.length < newRowCount) {
        newRowHeights.push(INITIAL_HEIGHT);
      }

      return { ...prev, cells: newCells, rowHeights: newRowHeights };
    });
  }, []);

  const removeCard = useCallback((cellId: string) => {
    setState(prev => {
      const idx = prev.cells.findIndex(c => c.id === cellId);
      if (idx === -1) return prev;

      const newCells = prev.cells
        .map((c, i) => {
          if (i < idx) return c;
          if (i < prev.cells.length - 1) return { ...c, card: prev.cells[i + 1].card };
          return { ...c, card: null };
        })
        .slice(0, -1);

      const newRowCount = Math.ceil(newCells.length / prev.columnCount);

      return {
        ...prev,
        cells: newCells,
        rowHeights: prev.rowHeights.slice(0, newRowCount)
      };
    });
  }, []);

  const resetGrid = useCallback(() => {
    setState(createInitialGrid());
  }, []);

  return {
    state,
    setColumnCount,
    setColumnWidths,
    setRowHeights,
    moveCard,
    addCard,
    removeCard,
    resetGrid
  };
}
