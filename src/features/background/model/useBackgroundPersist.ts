import { useCallback, useLayoutEffect, useState } from 'react';

import type { BackgroundState } from './types';

const STORAGE_KEY = 'dash-panel-bg-state';

const EMPTY_BACKGROUND: BackgroundState = { type: 'color', color: '', imageUrl: '' };

function loadBackground(): BackgroundState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_BACKGROUND;
    const parsed = JSON.parse(raw) as Partial<BackgroundState>;
    if (parsed.type === 'color' && typeof parsed.color === 'string' && parsed.color) {
      return { type: 'color', color: parsed.color, imageUrl: '' };
    }
    if (parsed.type === 'image' && typeof parsed.imageUrl === 'string' && parsed.imageUrl) {
      return { type: 'image', imageUrl: parsed.imageUrl, color: '' };
    }
  } catch {
    /* ignore */
  }
  return EMPTY_BACKGROUND;
}

function applyBackground(state: BackgroundState) {
  const root = document.documentElement;
  root.classList.remove('app-bg-color', 'app-bg-image');
  root.style.removeProperty('--app-bg-color');
  root.style.removeProperty('--app-bg-image');

  if (state.type === 'color' && state.color) {
    root.classList.add('app-bg-color');
    root.style.setProperty('--app-bg-color', state.color);
  } else if (state.type === 'image' && state.imageUrl) {
    root.classList.add('app-bg-image');
    root.style.setProperty('--app-bg-image', `url("${state.imageUrl}")`);
  }
}

export function useBackgroundPersist() {
  const [state, setState] = useState<BackgroundState>(loadBackground);

  useLayoutEffect(() => {
    applyBackground(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const setColor = useCallback((color: string) => {
    setState({ type: 'color', color, imageUrl: '' });
  }, []);

  const setImage = useCallback((imageUrl: string) => {
    setState({ type: 'image', imageUrl, color: '' });
  }, []);

  const clear = useCallback(() => {
    setState(EMPTY_BACKGROUND);
  }, []);

  return { background: state, setColor, setImage, clear };
}
