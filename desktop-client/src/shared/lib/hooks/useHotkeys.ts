import { useEffect } from 'react';

export interface HotkeyOptions {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function useHotkey(options: HotkeyOptions, callback: () => void): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const isModifierActive = options.ctrlOrCmd ? (isMac ? event.metaKey : event.ctrlKey) : true;
      const isShiftActive = options.shift !== undefined ? event.shiftKey === options.shift : true;
      const isAltActive = options.alt !== undefined ? event.altKey === options.alt : true;
      const isKeyMatch = event.key.toLowerCase() === options.key.toLowerCase();

      if (isKeyMatch && isModifierActive && isShiftActive && isAltActive) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, callback]);
}
