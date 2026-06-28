import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './App.css';
import { ConfirmModal } from './components/ConfirmModal';
import { Grid } from './components/Grid';
import { Header } from './components/Header';
import { useGridPersist } from './hooks/useGridPersist';
import { useHeaderAutoHide } from './hooks/useHeaderAutoHide';
import { useMediaQuery } from './hooks/useMediaQuery';
import type { GridState } from './types';

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
    (count: number) => {
      setColumnCount(count);
    },
    [setColumnCount]
  );

  return (
    <div className='app-bg flex min-h-dvh flex-col dark:text-gray-100'>
      <Header
        title={title}
        onTitleChange={setTitle}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isPinned={isPinned}
        onTogglePin={togglePin}
        isVisible={isVisible}
        onShow={show}
        onScheduleHide={scheduleHide}
        isPhone={isPhone}
        columnCount={state.columnCount}
        availableCols={availableCols}
        onColumnCountChange={handleColumnCountChange}
        onImportClick={() => fileInputRef.current?.click()}
        onExport={handleExport}
        onReset={() => setIsResetModalOpen(true)}
      />

      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        onChange={handleImportFile}
        className='hidden'
      />

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
