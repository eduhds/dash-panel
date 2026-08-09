import { memo, useCallback } from 'react';

import clsx from 'clsx';
import { MoveHorizontalIcon, MoveIcon, MoveVerticalIcon, PlusIcon } from 'lucide-react';

import type { CellData } from '../model/types';
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
          className='group/col absolute top-0 z-20 flex h-full w-[8px] cursor-col-resize items-center justify-center'
          style={{ right: '-8px' }}
          onMouseDown={e => onColumnResizeStart(colIndex, e)}>
          <span className='h-[80%] w-0 border-l-2 border-dashed border-gray-300 opacity-0 transition-opacity duration-150 group-hover/col:border-blue-400 group-hover/col:opacity-100 dark:border-gray-600 dark:group-hover/col:border-blue-500' />
          <span className='pointer-events-none absolute flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 opacity-0 shadow-sm transition-opacity duration-150 group-hover/col:opacity-100 group-active/col:border-blue-400 group-active/col:bg-blue-100 group-active/col:text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:group-active/col:border-blue-500 dark:group-active/col:bg-blue-900/30 dark:group-active/col:text-blue-400'>
            <MoveHorizontalIcon className='h-3 w-3' />
          </span>
        </div>
      )}

      {hasCard && (
        <div
          className='group/row absolute bottom-0 z-20 flex h-[8px] w-full cursor-row-resize items-center justify-center'
          style={{ bottom: '-8px' }}
          onMouseDown={e => onRowResizeStart(rowIndex, e)}>
          <span className='h-0 w-[80%] border-b-2 border-dashed border-gray-300 opacity-0 transition-opacity duration-150 group-hover/row:border-blue-400 group-hover/row:opacity-100 dark:border-gray-600 dark:group-hover/row:border-blue-500' />
          <span className='pointer-events-none absolute flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 opacity-0 shadow-sm transition-opacity duration-150 group-hover/row:opacity-100 group-active/row:border-blue-400 group-active/row:bg-blue-100 group-active/row:text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:group-active/row:border-blue-500 dark:group-active/row:bg-blue-900/30 dark:group-active/row:text-blue-400'>
            <MoveVerticalIcon className='h-3 w-3' />
          </span>
        </div>
      )}

      {hasCard && !isLastColumn && (
        <div
          className='group/corner absolute z-30 flex items-center justify-center rounded text-gray-400 transition-colors duration-150 hover:bg-gray-300 hover:text-gray-600 active:bg-blue-200 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-gray-300 dark:active:bg-blue-800 cursor-[se-resize]'
          style={{ right: '-12px', bottom: '-12px', width: '16px', height: '16px' }}
          onMouseDown={e => onCornerResizeStart(colIndex, rowIndex, e)}>
          <MoveIcon className='h-3 w-3 opacity-0 transition-opacity duration-150 group-hover/corner:opacity-100' />
        </div>
      )}

      {hasCard && !isFirstColumn && (
        <div
          className='group/corner absolute z-30 flex items-center justify-center rounded text-gray-400 transition-colors duration-150 hover:bg-gray-300 hover:text-gray-600 active:bg-blue-200 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-gray-300 dark:active:bg-blue-800 cursor-[sw-resize]'
          style={{ left: '-12px', bottom: '-12px', width: '16px', height: '16px' }}
          onMouseDown={e => onCornerResizeStart(colIndex - 1, rowIndex, e)}>
          <MoveIcon className='h-3 w-3 opacity-0 transition-opacity duration-150 group-hover/corner:opacity-100' />
        </div>
      )}

      {hasCard && !isLastColumn && !isFirstRow && (
        <div
          className='group/corner absolute z-30 flex items-center justify-center rounded text-gray-400 transition-colors duration-150 hover:bg-gray-300 hover:text-gray-600 active:bg-blue-200 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-gray-300 dark:active:bg-blue-800 cursor-[ne-resize]'
          style={{ right: '-12px', top: '-12px', width: '16px', height: '16px' }}
          onMouseDown={e => onCornerResizeStart(colIndex, rowIndex - 1, e)}>
          <MoveIcon className='h-3 w-3 opacity-0 transition-opacity duration-150 group-hover/corner:opacity-100' />
        </div>
      )}

      {hasCard && !isFirstColumn && !isFirstRow && (
        <div
          className='group/corner absolute z-30 flex items-center justify-center rounded text-gray-400 transition-colors duration-150 hover:bg-gray-300 hover:text-gray-600 active:bg-blue-200 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-gray-300 dark:active:bg-blue-800 cursor-[nw-resize]'
          style={{ left: '-12px', top: '-12px', width: '16px', height: '16px' }}
          onMouseDown={e => onCornerResizeStart(colIndex - 1, rowIndex - 1, e)}>
          <MoveIcon className='h-3 w-3 opacity-0 transition-opacity duration-150 group-hover/corner:opacity-100' />
        </div>
      )}
    </div>
  );
});
