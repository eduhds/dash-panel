import clsx from 'clsx';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: 'primary' | 'danger';
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmVariant = 'primary' }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'
      onClick={onCancel}
    >
      <div
        className='w-80 rounded-lg bg-white p-5 shadow-xl dark:bg-gray-800'
        onClick={e => e.stopPropagation()}
      >
        <h2 className='mb-2 text-base font-semibold text-gray-900 dark:text-gray-100'>{title}</h2>
        <p className='mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400'>{message}</p>
        <div className='flex justify-end gap-2'>
          <button
            type='button'
            onClick={onCancel}
            className='rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={onConfirm}
            className={clsx(
              'rounded-md px-3 py-1.5 text-sm text-white shadow-sm transition-colors',
              confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700',
            )}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
