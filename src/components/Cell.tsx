import { memo, useCallback } from 'react';

import clsx from 'clsx';
import { MoveIcon, PlusIcon } from 'lucide-react';

import type { CellData } from '../types';
import { Card } from './Card';

interface CellProps {
  cell: CellData;
  rowIndex: number;
  colIndex: number;
  isLastColumn: boolean;
  isLastRow: boolean;
  isFirstColumn: boolean;
  isFirstRow: boolean;
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
  onUpdateContent: (cellId: string, content: string) => void;
}

export const Cell = memo(function Cell({
  cell,
  rowIndex,
  colIndex,
  isLastColumn,
  isFirstColumn,
  isFirstRow,
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
  onRemoveCard,
  onUpdateContent
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
        className={clsx(
          'h-full w-full rounded-lg p-0.5 transition-colors',
          isDragOver && 'ring-2 ring-blue-400 bg-blue-50',
          !isDragOver && isDragSource && 'opacity-50'
        )}>
        {cell.card ? (
          <Card
            card={cell.card}
            cellId={cell.id}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
            onRemoveCard={onRemoveCard}
            onUpdateContent={onUpdateContent}
          />
        ) : (
          <button
            type='button'
            onClick={onAddCard}
            className='flex h-full w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-2xl text-gray-400 transition-colors hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-500 dark:hover:border-gray-500'>
            <PlusIcon className='h-8 w-8' />
          </button>
        )}
      </div>

      {hasCard && !isLastColumn && (
        <div
          className='absolute top-1/2 z-20 -translate-y-1/2 cursor-col-resize rounded transition-colors duration-150 hover:bg-gray-300 active:bg-blue-200 dark:hover:bg-gray-600 dark:active:bg-blue-800'
          style={{ right: '-8px', width: '8px', height: '80%' }}
          onMouseDown={e => onColumnResizeStart(colIndex, e)}
        />
      )}

      {hasCard && (
        <div
          className='absolute left-1/2 z-20 -translate-x-1/2 cursor-row-resize rounded transition-colors duration-150 hover:bg-gray-300 active:bg-blue-200 dark:hover:bg-gray-600 dark:active:bg-blue-800'
          style={{ bottom: '-8px', width: '80%', height: '8px' }}
          onMouseDown={e => onRowResizeStart(rowIndex, e)}
        />
      )}

      {hasCard && !isLastColumn && (
        <div
          className='group absolute z-30 flex items-center justify-center rounded text-gray-400 transition-colors duration-150 hover:bg-gray-300 hover:text-gray-600 active:bg-blue-200 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-gray-300 dark:active:bg-blue-800 cursor-[se-resize]'
          style={{ right: '-12px', bottom: '-12px', width: '16px', height: '16px' }}
          onMouseDown={e => onCornerResizeStart(colIndex, rowIndex, e)}>
          <MoveIcon className='h-3 w-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100' />
        </div>
      )}

      {hasCard && !isFirstColumn && (
        <div
          className='group absolute z-30 flex items-center justify-center rounded text-gray-400 transition-colors duration-150 hover:bg-gray-300 hover:text-gray-600 active:bg-blue-200 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-gray-300 dark:active:bg-blue-800 cursor-[sw-resize]'
          style={{ left: '-12px', bottom: '-12px', width: '16px', height: '16px' }}
          onMouseDown={e => onCornerResizeStart(colIndex - 1, rowIndex, e)}>
          <MoveIcon className='h-3 w-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100' />
        </div>
      )}

      {hasCard && !isLastColumn && !isFirstRow && (
        <div
          className='group absolute z-30 flex items-center justify-center rounded text-gray-400 transition-colors duration-150 hover:bg-gray-300 hover:text-gray-600 active:bg-blue-200 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-gray-300 dark:active:bg-blue-800 cursor-[ne-resize]'
          style={{ right: '-12px', top: '-12px', width: '16px', height: '16px' }}
          onMouseDown={e => onCornerResizeStart(colIndex, rowIndex - 1, e)}>
          <MoveIcon className='h-3 w-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100' />
        </div>
      )}

      {hasCard && !isFirstColumn && !isFirstRow && (
        <div
          className='group absolute z-30 flex items-center justify-center rounded text-gray-400 transition-colors duration-150 hover:bg-gray-300 hover:text-gray-600 active:bg-blue-200 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-gray-300 dark:active:bg-blue-800 cursor-[nw-resize]'
          style={{ left: '-12px', top: '-12px', width: '16px', height: '16px' }}
          onMouseDown={e => onCornerResizeStart(colIndex - 1, rowIndex - 1, e)}>
          <MoveIcon className='h-3 w-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100' />
        </div>
      )}
    </div>
  );
});
