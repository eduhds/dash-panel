import { useCallback, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { languages, matchLanguage } from '../model/languages';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = matchLanguage(i18n.language);

  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);

  const handleSelect = useCallback(
    (code: string) => {
      void i18n.changeLanguage(code);
      setIsOpen(false);
    },
    [i18n]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className='relative'>
      <button
        type='button'
        onClick={handleToggle}
        className='flex items-center gap-1 rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'>
        <span className='text-base leading-none'>{currentLang.flag}</span>
        <span className='hidden sm:inline'>{currentLang.label}</span>
      </button>

      {isOpen && (
        <div className='absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800'>
          {languages.map(lang => {
            const isActive = lang.code === currentLang.code;
            return (
              <button
                key={lang.code}
                type='button'
                onClick={() => handleSelect(lang.code)}
                className={clsx(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}>
                <span className='text-base leading-none'>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
