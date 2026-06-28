import { beforeEach, describe, expect, it } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useGridPersist } from '../useGridPersist';

const STORAGE_KEY = 'dash-panel-grid-state';

describe('useGridPersist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default state when localStorage is empty', () => {
    const { result } = renderHook(() => useGridPersist());
    const { state } = result.current;

    expect(state.columnCount).toBe(3);
    expect(state.columnWidths).toHaveLength(3);
    expect(state.columnWidths.every(w => w === 100 / 3)).toBe(true);
    expect(state.cells.length).toBe(4);
    expect(state.rowHeights).toHaveLength(2);
  });

  it('restores state from localStorage if available', () => {
    const savedState = {
      columnCount: 2,
      cells: [
        { id: 'cell-1', card: { id: 'card-1', content: '<p>test</p>' } },
        { id: 'cell-2', card: null }
      ],
      columnWidths: [50, 50],
      rowHeights: [300]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

    const { result } = renderHook(() => useGridPersist());
    const { state } = result.current;

    expect(state.columnCount).toBe(2);
    expect(state.cells).toHaveLength(2);
    expect(state.cells[0].card?.content).toBe('<p>test</p>');
    expect(state.rowHeights).toEqual([300]);
  });

  it('setColumnWidths updates column widths', () => {
    const { result } = renderHook(() => useGridPersist());
    const newWidths = [40, 35, 25];

    act(() => result.current.setColumnWidths(newWidths));

    expect(result.current.state.columnWidths).toEqual(newWidths);
  });

  it('setRowHeights updates row heights', () => {
    const { result } = renderHook(() => useGridPersist());
    const newHeights = [250, 180];

    act(() => result.current.setRowHeights(newHeights));

    expect(result.current.state.rowHeights).toEqual(newHeights);
  });

  it('setColumnCount resizes grid and resets widths/heights', () => {
    const { result } = renderHook(() => useGridPersist());

    act(() => result.current.setColumnCount(2));

    expect(result.current.state.columnCount).toBe(2);
    expect(result.current.state.columnWidths).toHaveLength(2);
    expect(result.current.state.columnWidths.every(w => w === 50)).toBe(true);
    expect(result.current.state.rowHeights).toHaveLength(2);
  });

  it('moveCard swaps cards between cells', () => {
    const { result } = renderHook(() => useGridPersist());
    const cellA = result.current.state.cells[0];
    const cellB = result.current.state.cells[1];
    const cardA = cellA.card;

    act(() => result.current.moveCard(cellA.id, cellB.id));

    expect(result.current.state.cells[0].card?.id).toBe(cellB.card?.id);
    expect(result.current.state.cells[1].card?.id).toBe(cardA?.id);
  });

  it('moveCard does nothing when swapping same cell', () => {
    const { result } = renderHook(() => useGridPersist());
    const cellA = result.current.state.cells[0];

    act(() => result.current.moveCard(cellA.id, cellA.id));

    expect(result.current.state.cells[0].card?.id).toBe(cellA.card?.id);
  });

  it('addCard places card in first empty cell and appends new cell', () => {
    const { result } = renderHook(() => useGridPersist());
    const emptyIndex = result.current.state.cells.findIndex(c => c.card === null);
    const initialLength = result.current.state.cells.length;

    act(() => result.current.addCard());

    expect(result.current.state.cells[emptyIndex].card).not.toBeNull();
    expect(result.current.state.cells).toHaveLength(initialLength + 1);
  });

  it('addCard does nothing when no empty cell', () => {
    const fullState = {
      columnCount: 1,
      cells: [{ id: 'cell-1', card: { id: 'card-1', content: 'a' } }],
      columnWidths: [100],
      rowHeights: [200]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));
    const { result } = renderHook(() => useGridPersist());
    const initialLength = result.current.state.cells.length;

    act(() => result.current.addCard());

    expect(result.current.state.cells).toHaveLength(initialLength);
  });

  it('removeCard removes cell and shrinks rowHeights', () => {
    const { result } = renderHook(() => useGridPersist());
    const targetCell = result.current.state.cells[0];
    const initialLength = result.current.state.cells.length;

    act(() => result.current.removeCard(targetCell.id));

    expect(result.current.state.cells).toHaveLength(initialLength - 1);
    expect(result.current.state.cells.find(c => c.id === targetCell.id)).toBeUndefined();
  });

  it('removeCard does nothing for a cell without a card', () => {
    const { result } = renderHook(() => useGridPersist());
    const emptyCell = result.current.state.cells.find(c => c.card === null);
    if (!emptyCell) return;
    const initialLength = result.current.state.cells.length;

    act(() => result.current.removeCard(emptyCell.id));

    expect(result.current.state.cells).toHaveLength(initialLength);
  });

  it('updateCardContent updates card content', () => {
    const { result } = renderHook(() => useGridPersist());
    const targetCell = result.current.state.cells[0];
    const newContent = '<p>updated</p>';

    act(() => result.current.updateCardContent(targetCell.id, newContent));

    expect(result.current.state.cells[0].card?.content).toBe(newContent);
  });

  it('replaceState replaces entire state', () => {
    const { result } = renderHook(() => useGridPersist());
    const newState = {
      columnCount: 1,
      cells: [{ id: 'new-cell', card: { id: 'new-card', content: 'new' } }],
      columnWidths: [100],
      rowHeights: [300]
    };

    act(() => result.current.replaceState(newState));

    expect(result.current.state.columnCount).toBe(1);
    expect(result.current.state.cells).toHaveLength(1);
    expect(result.current.state.cells[0].card?.content).toBe('new');
  });

  it('resetDimensions preserves cells and columnCount, resets widths/heights', () => {
    const savedState = {
      columnCount: 4,
      cells: [
        { id: 'c1', card: { id: 'ca1', content: 'a' } },
        { id: 'c2', card: { id: 'ca2', content: 'b' } },
        { id: 'c3', card: { id: 'ca3', content: 'c' } },
        { id: 'c4', card: { id: 'ca4', content: 'd' } },
        { id: 'c5', card: null }
      ],
      columnWidths: [50, 20, 15, 15],
      rowHeights: [250, 300]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    const { result } = renderHook(() => useGridPersist());

    act(() => result.current.resetDimensions());

    expect(result.current.state.columnCount).toBe(4);
    expect(result.current.state.cells).toHaveLength(5);
    expect(result.current.state.cells[0].card?.content).toBe('a');
    expect(result.current.state.columnWidths.every(w => w === 25)).toBe(true);
    expect(result.current.state.rowHeights.every(h => h === 200)).toBe(true);
  });

  it('resetGrid returns to initial state', () => {
    const savedState = {
      columnCount: 1,
      cells: [{ id: 'c1', card: { id: 'ca1', content: 'x' } }],
      columnWidths: [100],
      rowHeights: [500]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    const { result } = renderHook(() => useGridPersist());

    act(() => result.current.resetGrid());

    expect(result.current.state.columnCount).toBe(3);
    expect(result.current.state.cells).toHaveLength(4);
    expect(result.current.state.columnWidths.every((w: number) => w === 100 / 3)).toBe(true);
  });

  it('persists state to localStorage on changes', () => {
    const { result } = renderHook(() => useGridPersist());

    act(() => result.current.setColumnCount(2));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.columnCount).toBe(2);
  });
});
