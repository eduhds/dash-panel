import { useCallback } from 'react';

import type { CellData } from '../types';
import { Card } from './Card';

interface CellProps {
  cell: CellData;
  rowIndex: number;
  colIndex: number;
  isLastColumn: boolean;
  isDragOver: boolean;
  isDragSource: boolean;
  onColumnResizeStart: (colIndex: number, e: React.MouseEvent) => void;
  onRowResizeStart: (rowIndex: number, e: React.MouseEvent) => void;
  onCornerResizeStart: (colBoundary: number, rowBoundary: number, e: React.MouseEvent) => void;
  onDragOver: (e: React.DragEvent, cellId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, cellId: string) => void;
  onCardDragStart: (cellId: string) => void;
  onCardDragEnd: () => void;
  onAddCard: () => void;
  onRemoveCard: (cellId: string) => void;
}

export function Cell({
  cell,
  rowIndex,
  colIndex,
  isLastColumn,
  isDragOver,
  isDragSource,
  onColumnResizeStart,
  onRowResizeStart,
  onCornerResizeStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
  onAddCard,
  onRemoveCard
}: CellProps) {
  const hasCard = cell.card !== null;

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!hasCard) return;
      onDragOver(e, cell.id);
    },
    [onDragOver, cell.id, hasCard]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!hasCard) return;
      onDrop(e, cell.id);
    },
    [onDrop, cell.id, hasCard]
  );

  const handleDragLeave = useCallback(() => {
    if (!hasCard) return;
    onDragLeave();
  }, [onDragLeave, hasCard]);

  return (
    <div
      className='group relative'
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>
      <div
        className={`h-full w-full rounded-lg p-0.5 transition-colors ${
          isDragOver ? 'ring-2 ring-blue-400 bg-blue-50' : isDragSource ? 'opacity-50' : ''
        }`}>
        {cell.card ? (
          <Card
            card={cell.card}
            cellId={cell.id}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
            onRemoveCard={onRemoveCard}
          />
        ) : (
          <button
            type='button'
            onClick={onAddCard}
            className='flex h-full w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-2xl text-gray-400 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500'>
            +
          </button>
        )}
      </div>

      {hasCard && !isLastColumn && (
        <div
          className='absolute top-1/2 z-20 -translate-y-1/2 cursor-col-resize rounded transition-colors duration-150 hover:bg-gray-300 active:bg-blue-200'
          style={{ right: '-8px', width: '8px', height: '80%' }}
          onMouseDown={e => onColumnResizeStart(colIndex, e)}
        />
      )}

      {hasCard && (
        <div
          className='absolute left-1/2 z-20 -translate-x-1/2 cursor-row-resize rounded transition-colors duration-150 hover:bg-gray-300 active:bg-blue-200'
          style={{ bottom: '-8px', width: '80%', height: '8px' }}
          onMouseDown={e => onRowResizeStart(rowIndex, e)}
        />
      )}

      {hasCard && !isLastColumn && (
        <div
          className='absolute z-30 rounded-full border border-gray-300 bg-gray-200 transition-colors duration-150 hover:bg-gray-300 active:bg-blue-200 cursor-move'
          style={{ right: '-7px', bottom: '-7px', width: '14px', height: '14px' }}
          onMouseDown={e => onCornerResizeStart(colIndex, rowIndex, e)}
        />
      )}
    </div>
  );
}
