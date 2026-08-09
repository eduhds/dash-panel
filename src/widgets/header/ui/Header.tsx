import { useCallback } from 'react';

import clsx from 'clsx';
import {
  FileDownIcon,
  FileUpIcon,
  MoonIcon,
  PinIcon,
  RotateCcwIcon,
  SunIcon,
  TrashIcon
} from 'lucide-react';

import { ColumnSelector } from '@/features/column-count';
import { LanguageSelector } from '@/features/language';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  isVisible: boolean;
  onShow: () => void;
  onScheduleHide: (delay: number) => void;
  isPhone: boolean;
  columnCount: number;
  availableCols: number[];
  onColumnCountChange: (count: number) => void;
  onImportClick: () => void;
  onExport: () => void;
  onResetDimensions: () => void;
  onReset: () => void;
}

const btnBase =
  'rounded-md border border-transparent p-1 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-600';

export function Header({
  title,
  onTitleChange,
  isDark,
  onToggleTheme,
  isPinned,
  onTogglePin,
  isVisible,
  onShow,
  onScheduleHide,
  isPhone,
  columnCount,
  availableCols,
  onColumnCountChange,
  onImportClick,
  onExport,
  onResetDimensions,
  onReset
}: HeaderProps) {
  const handleTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLHeadingElement>) => {
      const text = e.currentTarget.textContent ?? '';
      if (text.trim()) onTitleChange(text.trim());
      else e.currentTarget.textContent = title;
    },
    [title, onTitleChange]
  );

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  }, []);

  return (
    <>
      {/* Spacer no fluxo: ghost title sempre acompanha o scroll */}
      <div className='relative h-14 pointer-events-none select-none'>
        <div
          className={clsx(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
            isVisible ? 'opacity-0' : 'opacity-100'
          )}>
          <span className='text-sm font-medium tracking-wide text-gray-400/60 dark:text-gray-600/60'>
            {title}
          </span>
        </div>
      </div>

      {/* Header fixo, aparece/desaparece sem afetar o fluxo */}
      <div
        className={clsx(
          'fixed inset-x-0 top-0 z-30 transition-all duration-300 ease-in-out',
          isVisible
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        )}>
        <header
          className='border-b border-gray-200 bg-white/95 backdrop-blur-sm h-14 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] dark:border-gray-700 dark:bg-gray-800/95 dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
          onMouseEnter={onShow}
          onMouseLeave={() => onScheduleHide(1500)}>
          <div className='mx-auto flex h-full max-w-7xl items-center justify-between px-4'>
            <div className='flex min-w-0 flex-1 items-center gap-2'>
              <button
                type='button'
                onClick={onTogglePin}
                className={clsx(
                  'shrink-0 rounded-md border p-1 text-sm transition-colors',
                  isPinned
                    ? 'border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-600'
                )}>
                <PinIcon className='h-5 w-5' />
              </button>

              <button type='button' onClick={onToggleTheme} className={btnBase}>
                {isDark ? <SunIcon className='h-5 w-5' /> : <MoonIcon className='h-5 w-5' />}
              </button>

              <h1
                contentEditable
                suppressContentEditableWarning
                className='min-w-0 truncate cursor-text rounded-md px-2 py-0.5 text-lg font-bold text-gray-900 outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-blue-400/40 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:focus:ring-blue-500/40'
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}>
                {title}
              </h1>
            </div>

            <div className='flex shrink-0 items-center gap-2'>
              <LanguageSelector />
              {!isPhone && (
                <ColumnSelector
                  columnCount={columnCount}
                  availableCols={availableCols}
                  onChange={onColumnCountChange}
                />
              )}

              <button type='button' onClick={onImportClick} className={btnBase}>
                <FileUpIcon className='h-5 w-5' />
              </button>

              <button type='button' onClick={onExport} className={btnBase}>
                <FileDownIcon className='h-5 w-5' />
              </button>

              <button type='button' onClick={onResetDimensions} className={btnBase}>
                <RotateCcwIcon className='h-5 w-5' />
              </button>

              <button
                type='button'
                onClick={onReset}
                className='rounded-md border border-transparent p-1 text-sm text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-900/20'>
                <TrashIcon className='h-5 w-5' />
              </button>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
