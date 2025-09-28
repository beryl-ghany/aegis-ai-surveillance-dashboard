import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onSpace?: () => void;
  onTab?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onSpace,
  onTab,
  enabled = true
}: KeyboardNavigationOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'Escape':
        onEscape?.();
        event.preventDefault();
        break;
      case 'Enter':
        onEnter?.();
        event.preventDefault();
        break;
      case 'ArrowUp':
        onArrowUp?.();
        event.preventDefault();
        break;
      case 'ArrowDown':
        onArrowDown?.();
        event.preventDefault();
        break;
      case 'ArrowLeft':
        onArrowLeft?.();
        event.preventDefault();
        break;
      case 'ArrowRight':
        onArrowRight?.();
        event.preventDefault();
        break;
      case ' ':
        onSpace?.();
        event.preventDefault();
        break;
      case 'Tab':
        onTab?.();
        // Don't prevent default for Tab
        break;
    }
  }, [enabled, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onSpace, onTab]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}
