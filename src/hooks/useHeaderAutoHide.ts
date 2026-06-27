import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'dash-panel-header-pinned';
const TOP_THRESHOLD = 40;

export function useHeaderAutoHide() {
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialHideDone = useRef(false);
  const isPinnedRef = useRef(isPinned);
  const isVisibleRef = useRef(isVisible);

  isPinnedRef.current = isPinned;
  isVisibleRef.current = isVisible;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isPinned));
    } catch { /* ignore */ }
  }, [isPinned]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearTimer();
    setIsVisible(true);
  }, [clearTimer]);

  const scheduleHide = useCallback((delay: number) => {
    clearTimer();
    if (isPinnedRef.current) return;
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delay);
  }, [clearTimer]);

  const togglePin = useCallback(() => {
    setIsPinned(prev => !prev);
  }, []);

  useEffect(() => {
    if (isPinned) {
      clearTimer();
      setIsVisible(true);
    }
  }, [isPinned, clearTimer]);

  useEffect(() => {
    if (isPinned) return;
    if (initialHideDone.current) return;
    initialHideDone.current = true;
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPinned]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isPinnedRef.current) return;
      if (e.clientY <= TOP_THRESHOLD && !isVisibleRef.current) {
        clearTimer();
        setIsVisible(true);
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return { isPinned, isVisible, show, scheduleHide, togglePin };
}
