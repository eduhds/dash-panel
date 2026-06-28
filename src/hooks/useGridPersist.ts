import { useCallback, useEffect, useState } from 'react';

import type { CardData, CellData, GridState } from '../types';

const STORAGE_KEY = 'dash-panel-grid-state';
const INITIAL_HEIGHT = 200;

const SAMPLE_CARDS: CardData[] = Array.from({ length: 3 }, (_, i) => ({
  id: `card-${i + 1}`,
  content: '<iframe src="https://randomcolour.com" style="width:100%;height:100%;border:none" />'
}));

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
        content: ''
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
      if (idx === -1 || prev.cells[idx].card === null) return prev;

      // Remove a célula do índice e desloca as posteriores
      const newCells = prev.cells.filter((_, i) => i !== idx);

      const newRowCount = Math.ceil(newCells.length / prev.columnCount);

      return {
        ...prev,
        cells: newCells,
        rowHeights: prev.rowHeights.slice(0, newRowCount)
      };
    });
  }, []);

  const updateCardContent = useCallback((cellId: string, content: string) => {
    setState(prev => ({
      ...prev,
      cells: prev.cells.map(cell =>
        cell.id === cellId && cell.card ? { ...cell, card: { ...cell.card, content } } : cell
      )
    }));
  }, []);

  const replaceState = useCallback((newState: GridState) => {
    setState(newState);
  }, []);

  const resetDimensions = useCallback(() => {
    setState(prev => {
      const rowCount = Math.ceil(prev.cells.length / prev.columnCount);
      return {
        ...prev,
        columnWidths: Array.from({ length: prev.columnCount }, () => 100 / prev.columnCount),
        rowHeights: Array.from({ length: rowCount }, () => INITIAL_HEIGHT)
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
    updateCardContent,
    replaceState,
    resetDimensions,
    resetGrid
  };
}
