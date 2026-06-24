import { useCallback, useEffect, useState } from 'react';

import './App.css';
import { Grid } from './components/Grid';
import { useGridPersist } from './hooks/useGridPersist';

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
    resetGrid
  } = useGridPersist();
  const isPhone = useMediaQuery('(max-width: 640px)');

  const handleColumnCountChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setColumnCount(Number(e.target.value));
    },
    [setColumnCount]
  );

  return (
    <div className='flex min-h-dvh flex-col bg-gray-100'>
      <header className='sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm'>
        <div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-4'>
          <h1 className='text-lg font-bold text-gray-900'>Dash Panel</h1>

          {!isPhone && (
            <div className='flex items-center gap-4'>
              <label className='flex items-center gap-2 text-sm text-gray-600'>
                Colunas
                <select
                  value={state.columnCount}
                  onChange={handleColumnCountChange}
                  className='rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30'>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type='button'
                onClick={resetGrid}
                className='rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-50'>
                Resetar
              </button>
            </div>
          )}
        </div>
      </header>

      <main className='flex-1 overflow-x-hidden p-2'>
        <Grid
          state={state}
          isPhone={isPhone}
          onSetColumnWidths={setColumnWidths}
          onSetRowHeights={setRowHeights}
          onMoveCard={moveCard}
          onAddCard={addCard}
          onRemoveCard={removeCard}
        />
      </main>
    </div>
  );
}

export default App;
