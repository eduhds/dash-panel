import { useCallback, useEffect, useState } from 'react';

import clsx from 'clsx';
import { ImageIcon, PaintbrushIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { COLOR_PRESETS, IMAGE_PRESETS, randomImageUrl } from '../model/presets';
import { useBackgroundPersist } from '../model/useBackgroundPersist';

const btnGhost =
  'rounded-md border border-transparent px-2 py-0.5 text-xs text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-600';

export function BackgroundFooter() {
  const { t } = useTranslation();
  const { background, setColor, setImage, clear } = useBackgroundPersist();
  const [urlDraft, setUrlDraft] = useState(background.imageUrl);

  useEffect(() => {
    setUrlDraft(background.imageUrl);
  }, [background.imageUrl]);

  const handleApplyUrl = useCallback(() => {
    const url = urlDraft.trim();
    if (url) setImage(url);
  }, [urlDraft, setImage]);

  const handleUrlKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApplyUrl();
      }
    },
    [handleApplyUrl]
  );

  const isColor = background.type === 'color' && background.color !== '';
  const isImage = background.type === 'image' && background.imageUrl !== '';
  const hasBackground = isColor || isImage;

  return (
    <div className='mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-gray-200/80 bg-white/70 px-4 py-2 text-xs text-gray-500 shadow-sm backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-800/70 dark:text-gray-400'>
      <div className='flex items-center gap-1.5'>
        <PaintbrushIcon className='h-3.5 w-3.5' />
        <input
          type='color'
          value={isColor ? background.color : '#f0f4f8'}
          onChange={e => setColor(e.target.value)}
          aria-label={t('background.color')}
          className='h-5 w-5 cursor-pointer rounded border border-transparent p-0 transition-colors hover:border-gray-300 dark:hover:border-gray-600'
        />
        <div className='flex items-center gap-1'>
          {COLOR_PRESETS.map(color => (
            <button
              key={color}
              type='button'
              onClick={() => setColor(color)}
              aria-label={color}
              className={clsx(
                'h-3.5 w-3.5 rounded-full border transition-transform hover:scale-110',
                isColor && background.color === color
                  ? 'border-gray-800 ring-1 ring-blue-400 dark:border-white'
                  : 'border-gray-300 dark:border-gray-600'
              )}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      <span className='h-4 w-px bg-gray-200 dark:bg-gray-700' />

      <div className='flex flex-wrap items-center gap-1.5'>
        <ImageIcon className='h-3.5 w-3.5' />
        <input
          type='text'
          value={urlDraft}
          onChange={e => setUrlDraft(e.target.value)}
          onKeyDown={handleUrlKeyDown}
          placeholder={t('background.imagePlaceholder')}
          className='w-40 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700 outline-none transition-colors focus:border-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
        />
        <button type='button' onClick={handleApplyUrl} className={btnGhost}>
          {t('background.apply')}
        </button>
        <button type='button' onClick={() => setImage(randomImageUrl())} className={btnGhost}>
          {t('background.random')}
        </button>
        <div className='flex items-center gap-1'>
          {IMAGE_PRESETS.map(preset => (
            <button
              key={preset.id}
              type='button'
              onClick={() => setImage(preset.url)}
              aria-label={preset.label}
              title={preset.label}
              className={clsx(
                'h-4 w-6 overflow-hidden rounded border transition-opacity hover:opacity-80',
                isImage && background.imageUrl === preset.url
                  ? 'ring-2 ring-blue-400'
                  : 'border-gray-300 dark:border-gray-600'
              )}
              style={{
                backgroundImage: `url(${preset.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          ))}
        </div>
      </div>

      {hasBackground && (
        <>
          <span className='h-4 w-px bg-gray-200 dark:bg-gray-700' />
          <button
            type='button'
            onClick={clear}
            aria-label={t('background.clear')}
            className={btnGhost}>
            <Trash2Icon className='h-3.5 w-3.5' />
          </button>
        </>
      )}
    </div>
  );
}
