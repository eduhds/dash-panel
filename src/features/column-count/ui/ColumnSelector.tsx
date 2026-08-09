import { useCallback } from 'react';

import { Grid2X2Icon } from 'lucide-react';

interface ColumnSelectorProps {
  columnCount: number;
  availableCols: number[];
  onChange: (count: number) => void;
}

export function ColumnSelector({ columnCount, availableCols, onChange }: ColumnSelectorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <div className='relative flex cursor-pointer items-center overflow-hidden rounded-md border border-transparent transition-colors hover:border-gray-300 hover:bg-gray-100 dark:hover:border-gray-600 dark:hover:bg-gray-600'>
      <span className='pointer-events-none flex items-center justify-center px-1.5 py-1 text-gray-500 dark:text-gray-400'>
        <Grid2X2Icon className='h-5 w-5' />
      </span>
      <span className='pointer-events-none border-l border-gray-200 px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:text-gray-100'>
        {columnCount}
      </span>
      <select
        value={columnCount}
        onChange={handleChange}
        className='absolute inset-0 cursor-pointer opacity-0 dark:text-gray-100 dark:bg-gray-800'>
        {availableCols.map(n => (
          <option key={n} value={n} className='dark:bg-gray-800 dark:text-gray-100'>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}
