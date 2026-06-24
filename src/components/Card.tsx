import type { CardData } from '../types';

interface CardProps {
  card: CardData;
  cellId: string;
  onDragStart: (cellId: string) => void;
  onDragEnd: () => void;
  onRemoveCard: (cellId: string) => void;
}

export function Card({ card, cellId, onDragStart, onDragEnd, onRemoveCard }: CardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ sourceCellId: cellId }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(cellId);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className='group relative h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm cursor-grab active:cursor-grabbing select-none'>
      <div className='h-full w-full' dangerouslySetInnerHTML={{ __html: card.content }} />

      <button
        type='button'
        onClick={() => onRemoveCard(cellId)}
        className='absolute left-1 top-1 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100'>
        x
      </button>
    </div>
  );
}
