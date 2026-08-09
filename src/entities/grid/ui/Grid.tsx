import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MIN_ROW_HEIGHT, distributeColumnDelta } from '../lib/gridMath';
import type { GridState } from '../model/types';
import { Cell } from './Cell';

interface GridProps {
  state: GridState;
  isPhone: boolean;
  onSetColumnWidths: (widths: number[]) => void;
  onSetRowHeights: (heights: number[]) => void;
  onMoveCard: (fromCellId: string, toCellId: string) => void;
  onAddCard: () => void;
  onRemoveCard: (cellId: string) => void;
  onUpdateContent: (cellId: string, content: string) => void;
}

type ResizeColumn = {
  kind: 'column';
  colIndex: number;
  startX: number;
  widths: number[];
};

type ResizeRow = {
  kind: 'row';
  rowIndex: number;
  startY: number;
  heights: number[];
};

type ResizeCorner = {
  kind: 'corner';
  colIndex: number;
  rowIndex: number;
  startX: number;
  startY: number;
  widths: number[];
  heights: number[];
};

export function Grid({
  state,
  isPhone,
  onSetColumnWidths,
  onSetRowHeights,
  onMoveCard,
  onAddCard,
  onRemoveCard,
  onUpdateContent
}: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resize, setResize] = useState<ResizeColumn | ResizeRow | ResizeCorner | null>(null);
  const [dragOverCellId, setDragOverCellId] = useState<string | null>(null);
  const [dragSourceCellId, setDragSourceCellId] = useState<string | null>(null);
  const dragSourceRef = useRef<string | null>(null);
  const pointerEventBlockerRef = useRef<HTMLDivElement | null>(null);

  const cols = useMemo(() => (isPhone ? 1 : state.columnCount), [isPhone, state.columnCount]);
  const widths = useMemo(
    () =>
      isPhone
        ? [100]
        : state.columnWidths.length === cols
          ? state.columnWidths
          : Array.from({ length: cols }, () => 100 / cols),
    [isPhone, state.columnWidths, cols]
  );

  const rowHeights = useMemo(
    () =>
      state.rowHeights.length > 0
        ? state.rowHeights
        : Array.from({ length: Math.ceil(state.cells.length / cols) }, () => 200),
    [state.rowHeights, state.cells.length, cols]
  );

  const totalRows = useMemo(() => Math.ceil(state.cells.length / cols), [state.cells.length, cols]);

  const gridTemplateRows = useMemo(() => {
    if (isPhone) {
      return Array.from({ length: totalRows }, () => '180px').join(' ');
    }
    return rowHeights
      .slice(0, totalRows)
      .map(h => `${h}px`)
      .join(' ');
  }, [rowHeights, totalRows, isPhone]);

  const handleColumnResizeStart = useCallback(
    (colIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      setResize({ kind: 'column', colIndex, startX: e.clientX, widths: [...widths] });
    },
    [widths]
  );

  const handleRowResizeStart = useCallback(
    (rowIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      setResize({ kind: 'row', rowIndex, startY: e.clientY, heights: [...rowHeights] });
    },
    [rowHeights]
  );

  const handleCornerResizeStart = useCallback(
    (colBoundary: number, rowBoundary: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (colBoundary < 0 || colBoundary >= widths.length - 1) return;
      if (rowBoundary < 0 || rowBoundary >= rowHeights.length) return;
      setResize({
        kind: 'corner',
        colIndex: colBoundary,
        rowIndex: rowBoundary,
        startX: e.clientX,
        startY: e.clientY,
        widths: [...widths],
        heights: [...rowHeights]
      });
    },
    [widths, rowHeights]
  );

  useEffect(() => {
    if (!resize) return;

    const handleMouseMove = (e: MouseEvent) => {
      try {
        if (resize.kind === 'column') {
          const containerWidth = containerRef.current?.offsetWidth ?? 1;
          const deltaPx = e.clientX - resize.startX;
          const deltaPercent = (deltaPx / containerWidth) * 100;
          const i = resize.colIndex;
          if (i + 1 >= resize.widths.length) return;
          const result = distributeColumnDelta(resize.widths, i, deltaPercent);
          if (result) onSetColumnWidths(result);
        } else if (resize.kind === 'row') {
          const deltaPx = e.clientY - resize.startY;
          const nextHeights = [...resize.heights];
          const r = resize.rowIndex;
          if (r >= nextHeights.length) return;
          const nr = nextHeights[r] + deltaPx;
          if (nr >= MIN_ROW_HEIGHT) {
            nextHeights[r] = nr;
            onSetRowHeights(nextHeights);
          }
        } else {
          const containerWidth = containerRef.current?.offsetWidth ?? 1;
          const deltaX = e.clientX - resize.startX;
          const deltaPercent = (deltaX / containerWidth) * 100;
          const deltaY = e.clientY - resize.startY;

          const ci = resize.colIndex;
          if (ci + 1 < resize.widths.length) {
            const result = distributeColumnDelta(resize.widths, ci, deltaPercent);
            if (result) onSetColumnWidths(result);
          }

          const nextHeights = [...resize.heights];
          const ri = resize.rowIndex;
          const nh1 = nextHeights[ri] + deltaY;
          if (nh1 >= MIN_ROW_HEIGHT) {
            nextHeights[ri] = nh1;
            onSetRowHeights(nextHeights);
          }
        }
      } catch (error) {
        console.error('Error during resize:', error);
        setResize(null);
      }
    };

    const handleMouseUp = () => setResize(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resize, onSetColumnWidths, onSetRowHeights]);

  useEffect(() => {
    if (resize) {
      const cursor =
        resize.kind === 'column'
          ? 'col-resize'
          : resize.kind === 'row'
            ? 'row-resize'
            : 'se-resize';
      document.body.style.cursor = cursor;
      document.body.style.userSelect = 'none';

      if (!pointerEventBlockerRef.current) {
        const blocker = document.createElement('div');
        blocker.style.position = 'fixed';
        blocker.style.top = '0';
        blocker.style.left = '0';
        blocker.style.width = '100%';
        blocker.style.height = '100%';
        blocker.style.zIndex = '9999';
        blocker.style.cursor = cursor;
        blocker.style.pointerEvents = 'auto';
        document.body.appendChild(blocker);
        pointerEventBlockerRef.current = blocker;
      }
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      if (pointerEventBlockerRef.current) {
        document.body.removeChild(pointerEventBlockerRef.current);
        pointerEventBlockerRef.current = null;
      }
    }
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      if (pointerEventBlockerRef.current) {
        try {
          document.body.removeChild(pointerEventBlockerRef.current);
        } catch {
          /* already removed */
        }
        pointerEventBlockerRef.current = null;
      }
    };
  }, [resize]);

  const handleDragLeave = useCallback(() => {
    setDragOverCellId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, cellId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCellId(cellId);
  }, []);

  const handleCardDragStart = useCallback((cellId: string) => {
    dragSourceRef.current = cellId;
    setDragSourceCellId(cellId);
  }, []);

  const handleCardDragEnd = useCallback(() => {
    dragSourceRef.current = null;
    setDragSourceCellId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetCellId: string) => {
      e.preventDefault();
      setDragOverCellId(null);
      const sourceCellId = dragSourceRef.current;
      if (sourceCellId && sourceCellId !== targetCellId) {
        onMoveCard(sourceCellId, targetCellId);
      }
    },
    [onMoveCard]
  );

  return (
    <div ref={containerRef} className='mx-auto w-full max-w-7xl'>
      <div
        className='grid'
        style={{
          gridTemplateColumns: widths.map(w => `minmax(0, ${w}fr)`).join(' '),
          gridTemplateRows: gridTemplateRows,
          gap: '8px'
        }}>
        {state.cells.map((cell, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const isLastCol = col === cols - 1;
          const isLastRow = row === totalRows - 1;
          const isFirstCol = col === 0;
          const isFirstRow = row === 0;

          return (
            <Cell
              key={cell.id}
              cell={cell}
              rowIndex={row}
              colIndex={col}
              isLastColumn={isLastCol}
              isLastRow={isLastRow}
              isFirstColumn={isFirstCol}
              isFirstRow={isFirstRow}
              isDragOver={dragOverCellId === cell.id}
              isDragSource={dragSourceCellId === cell.id}
              onColumnResizeStart={handleColumnResizeStart}
              onRowResizeStart={handleRowResizeStart}
              onCornerResizeStart={handleCornerResizeStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onCardDragStart={handleCardDragStart}
              onCardDragEnd={handleCardDragEnd}
              onAddCard={onAddCard}
              onRemoveCard={onRemoveCard}
              onUpdateContent={onUpdateContent}
            />
          );
        })}
      </div>
    </div>
  );
}
