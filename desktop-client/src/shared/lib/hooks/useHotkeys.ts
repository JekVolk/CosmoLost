import { useEffect, useRef } from 'react';

export interface HotkeyOptions {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function useHotkey(options: HotkeyOptions, callback: () => void): void {
  const { key, ctrlOrCmd = false, shift = false, alt = false } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore global hotkeys when typing inside editable fields
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac =
        typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');

      const expectedCtrlOrCmd = ctrlOrCmd;
      const actualCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
      if (actualCtrlOrCmd !== expectedCtrlOrCmd) return;

      const expectedAlt = alt;
      if (event.altKey !== expectedAlt) return;

      const expectedShift = shift;
      if (event.shiftKey !== expectedShift) return;

      if (event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callbackRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrlOrCmd, shift, alt]);
}
