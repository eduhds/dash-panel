import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import {
  FileDownIcon,
  FileUpIcon,
  Grid2X2Icon,
  MoonIcon,
  PinIcon,
  SunIcon,
  TrashIcon
} from 'lucide-react';

import './App.css';
import { ConfirmModal } from './components/ConfirmModal';
import { Grid } from './components/Grid';
import { useGridPersist } from './hooks/useGridPersist';
import { useHeaderAutoHide } from './hooks/useHeaderAutoHide';
import type { GridState } from './types';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function App() {
  const {
    state,
    setColumnCount,
    setColumnWidths,
    setRowHeights,
    moveCard,
    addCard,
    removeCard,
    updateCardContent,
    replaceState,
    resetGrid
  } = useGridPersist();
  const isPhone = useMediaQuery('(max-width: 639px)');
  const isSmall = useMediaQuery('(min-width: 640px) and (max-width: 767px)');
  const isMedium = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const { isPinned, isVisible, show, scheduleHide, togglePin } = useHeaderAutoHide();

  const [title, setTitle] = useState<string>(() => {
    try {
      return localStorage.getItem('dash-panel-title') ?? 'Dash Panel';
    } catch {
      return 'Dash Panel';
    }
  });

  useEffect(() => {
    document.title = title;
    try {
      localStorage.setItem('dash-panel-title', title);
    } catch {
      /* ignore */
    }
  }, [title]);

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('dash-panel-theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
    } catch {
      /* ignore */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('dash-panel-theme', isDark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const handleTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLHeadingElement>) => {
      const text = e.currentTarget.textContent ?? '';
      if (text.trim()) setTitle(text.trim());
      else e.currentTarget.textContent = title;
    },
    [title]
  );

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<GridState | null>(null);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dash-panel-state.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.columnCount || !parsed.cells || !parsed.columnWidths) {
          alert('Arquivo inválido: propriedades obrigatórias ausentes.');
          return;
        }
        setImportData(parsed as GridState);
      } catch {
        alert('Arquivo inválido: não foi possível fazer o parse do JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleImportConfirm = useCallback(() => {
    if (importData) {
      replaceState(importData);
      setImportData(null);
    }
  }, [importData, replaceState]);

  const handleImportCancel = useCallback(() => {
    setImportData(null);
  }, []);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleResetConfirm = useCallback(() => {
    resetGrid();
    setIsResetModalOpen(false);
  }, [resetGrid]);

  const handleResetCancel = useCallback(() => {
    setIsResetModalOpen(false);
  }, []);

  const maxCols = useMemo(() => {
    if (isPhone) return 1;
    if (isSmall) return 2;
    if (isMedium) return 4;
    return 6;
  }, [isPhone, isSmall, isMedium]);

  const availableCols = useMemo(() => {
    return Array.from({ length: maxCols }, (_, i) => i + 1);
  }, [maxCols]);

  useEffect(() => {
    if (state.columnCount > maxCols) {
      setColumnCount(maxCols);
    }
  }, [maxCols, state.columnCount, setColumnCount]);

  const handleColumnCountChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setColumnCount(Number(e.target.value));
    },
    [setColumnCount]
  );

  return (
    <div className='app-bg flex min-h-dvh flex-col dark:text-gray-100'>
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
          className='app-header border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 h-14'
          onMouseEnter={show}
          onMouseLeave={() => scheduleHide(1500)}>
          <div className='mx-auto flex h-full max-w-7xl items-center justify-between px-4'>
            <div className='flex min-w-0 flex-1 items-center gap-2'>
              <button
                type='button'
                onClick={togglePin}
                className={clsx(
                  'shrink-0 rounded-md border p-1 text-sm shadow-sm transition-colors',
                  isPinned
                    ? 'border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                )}>
                <PinIcon className='h-5 w-5' />
              </button>

              <button
                type='button'
                onClick={toggleTheme}
                className='shrink-0 rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'>
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
              {!isPhone && (
                <div className='relative flex cursor-pointer items-center overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'>
                  <span className='pointer-events-none flex items-center justify-center px-1.5 py-1 text-gray-500 dark:text-gray-400'>
                    <Grid2X2Icon className='h-5 w-5' />
                  </span>
                  <span className='pointer-events-none border-l border-gray-200 px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:text-gray-100'>
                    {state.columnCount}
                  </span>
                  <select
                    value={state.columnCount}
                    onChange={handleColumnCountChange}
                    className='absolute inset-0 cursor-pointer opacity-0 dark:text-gray-100 dark:bg-gray-800'>
                    {availableCols.map(n => (
                      <option key={n} value={n} className='dark:bg-gray-800 dark:text-gray-100'>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'>
                <FileUpIcon className='h-5 w-5' />
              </button>

              <input
                ref={fileInputRef}
                type='file'
                accept='.json'
                onChange={handleImportFile}
                className='hidden'
              />

              <button
                type='button'
                onClick={handleExport}
                className='rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'>
                <FileDownIcon className='h-5 w-5' />
              </button>

              <button
                type='button'
                onClick={() => setIsResetModalOpen(true)}
                className='rounded-md border border-red-300 bg-white p-1 text-sm text-red-600 shadow-sm transition-colors hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20'>
                <TrashIcon className='h-5 w-5' />
              </button>
            </div>
          </div>
        </header>
      </div>

      <main className='flex-1 overflow-x-hidden p-2'>
        <Grid
          state={state}
          isPhone={isPhone}
          onSetColumnWidths={setColumnWidths}
          onSetRowHeights={setRowHeights}
          onMoveCard={moveCard}
          onAddCard={addCard}
          onRemoveCard={removeCard}
          onUpdateContent={updateCardContent}
        />
      </main>

      <ConfirmModal
        isOpen={importData !== null}
        title='Importar estado'
        message='Tem certeza que deseja importar este arquivo? O estado atual será substituído permanentemente.'
        onConfirm={handleImportConfirm}
        onCancel={handleImportCancel}
      />

      <ConfirmModal
        isOpen={isResetModalOpen}
        title='Resetar grid'
        message='Tem certeza que deseja resetar o grid? Todo o estado será perdido.'
        onConfirm={handleResetConfirm}
        onCancel={handleResetCancel}
        confirmVariant='danger'
      />
    </div>
  );
}

export default App;
