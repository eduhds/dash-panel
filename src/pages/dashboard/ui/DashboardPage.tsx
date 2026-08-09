import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Grid, useGridPersist } from '@/entities/grid';
import type { GridState } from '@/entities/grid';
import { BackgroundFooter } from '@/features/background';
import { useMediaQuery, useTheme } from '@/shared/lib';
import { ConfirmModal } from '@/shared/ui';
import { Header, useHeaderAutoHide } from '@/widgets/header';

function DashboardPage() {
  const { t } = useTranslation();
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
    resetDimensions,
    resetGrid
  } = useGridPersist();
  const isPhone = useMediaQuery('(max-width: 639px)');
  const isSmall = useMediaQuery('(min-width: 640px) and (max-width: 767px)');
  const isMedium = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const { isPinned, isVisible, show, scheduleHide, togglePin } = useHeaderAutoHide();

  const [title, setTitle] = useState<string>(() => {
    try {
      return localStorage.getItem('dash-panel-title') ?? t('app.title');
    } catch {
      return t('app.title');
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

  const { isDark, toggleTheme } = useTheme();

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

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (!parsed.columnCount || !parsed.cells || !parsed.columnWidths) {
            alert(t('app.importError.missingProps'));
            return;
          }
          setImportData(parsed as GridState);
        } catch {
          alert(t('app.importError.parseError'));
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [t]
  );

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

  const handleResetDimensions = useCallback(() => {
    resetDimensions();
  }, [resetDimensions]);

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
        onResetDimensions={handleResetDimensions}
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

      <footer className='px-4 pb-6 pt-2'>
        <BackgroundFooter />
      </footer>

      <ConfirmModal
        isOpen={importData !== null}
        title={t('app.importModal.title')}
        message={t('app.importModal.message')}
        onConfirm={handleImportConfirm}
        onCancel={handleImportCancel}
      />

      <ConfirmModal
        isOpen={isResetModalOpen}
        title={t('app.resetModal.title')}
        message={t('app.resetModal.message')}
        onConfirm={handleResetConfirm}
        onCancel={handleResetCancel}
        confirmVariant='danger'
      />
    </div>
  );
}

export { DashboardPage };
