import { useCallback, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { PencilLineIcon, SaveIcon, Trash2Icon, XIcon } from 'lucide-react';

import type { CardData } from '../types';

interface CardProps {
  card: CardData;
  cellId: string;
  onDragStart: (cellId: string) => void;
  onDragEnd: () => void;
  onRemoveCard: (cellId: string) => void;
  onUpdateContent: (cellId: string, content: string) => void;
}

export function Card({
  card,
  cellId,
  onDragStart,
  onDragEnd,
  onRemoveCard,
  onUpdateContent
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.innerText = card.content;
      contentRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    if (contentRef.current) {
      onUpdateContent(cellId, contentRef.current.innerText);
    }
    setIsEditing(false);
  }, [cellId, onUpdateContent]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isEditing) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({ sourceCellId: cellId }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(cellId);
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={clsx(
        'group relative h-full w-full overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800',
        isEditing
          ? 'border-2 border-blue-400'
          : 'cursor-grab active:cursor-grabbing select-none border border-gray-200 dark:border-gray-600'
      )}>
      {isEditing ? (
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          className='h-full w-full overflow-auto whitespace-pre-wrap bg-amber-50 p-4 font-mono text-sm leading-relaxed text-gray-900 outline-none ring-2 ring-blue-500 shadow-inner dark:bg-gray-700 dark:text-gray-100'
        />
      ) : (
        <div
          className='h-full w-full p-3 overflow-hidden'
          dangerouslySetInnerHTML={{ __html: card.content }}
        />
      )}

      {!isEditing && (
        <>
          <button
            type='button'
            onClick={handleEditClick}
            className='absolute right-1.5 top-1.5 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white p-1 text-gray-600 shadow-sm opacity-0 transition-all hover:bg-gray-100 group-hover:opacity-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'>
            <PencilLineIcon className='h-4 w-4' />
          </button>

          <button
            type='button'
            onClick={() => onRemoveCard(cellId)}
            className='absolute left-1.5 top-1.5 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-red-300 bg-white p-1 text-red-600 shadow-sm opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20'>
            <Trash2Icon className='h-4 w-4' />
          </button>
        </>
      )}

      {isEditing && (
        <div className='absolute bottom-2 right-2 z-10 flex gap-1.5'>
          <button
            type='button'
            onClick={handleSave}
            className='flex h-7 cursor-pointer items-center rounded bg-green-500 px-2.5 text-xs font-medium text-white shadow-sm hover:bg-green-600'>
            <SaveIcon className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={handleCancel}
            className='flex h-7 cursor-pointer items-center rounded bg-gray-400 px-2.5 text-xs font-medium text-white shadow-sm hover:bg-gray-500'>
            <XIcon className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}
