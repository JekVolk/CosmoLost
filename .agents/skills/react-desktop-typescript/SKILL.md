---
name: react-desktop-typescript
description: >-
  Use this skill when developing React components and TypeScript models for desktop applications,
  implementing keyboard shortcuts, desktop lifecycle, state persistence, and performance optimizations.
---

# React + TypeScript Desktop Best Practices

Desktop web applications require distinct design patterns compared to traditional browser pages: instant response, native hotkeys, window awareness, offline persistence, and strict type safety.

## 1. Strict TypeScript Standards

- Always enable `strict: true` and `noUncheckedIndexedAccess: true` in `tsconfig.json`.
- Avoid `any` at all costs. Use `unknown` with type guards or Zod schemas for external/IPC data.
- Colocate domain types within slice `model/types.ts` and re-export via slice `index.ts`.
- Prefer Discriminated Unions for modeling asynchronous desktop states:

```typescript
export type AsyncDataState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

## 2. Desktop Keyboard Shortcuts & Hotkeys Hook

Desktop applications rely heavily on keyboard navigation. Implement a reusable hook in `shared/lib/hooks/useHotkeys.ts`:

```typescript
import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export const useHotkey = (combo: KeyCombo, callback: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      const matchesKey = event.key.toLowerCase() === combo.key.toLowerCase();
      const matchesModifier = combo.ctrlOrCmd ? isCtrlOrCmd : true;
      const matchesShift = combo.shift ? event.shiftKey : !event.shiftKey;
      const matchesAlt = combo.alt ? event.altKey : !event.altKey;

      if (matchesKey && matchesModifier && matchesShift && matchesAlt) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combo, callback]);
};
```

## 3. Desktop Window State & Focus Awareness

Track window focus to pause background polling or conserve system resources:

```typescript
// shared/lib/hooks/useWindowFocus.ts
import { useState, useEffect } from 'react';

export const useWindowFocus = (): boolean => {
  const [isFocused, setIsFocused] = useState<boolean>(document.hasFocus());

  useEffect(() => {
    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return isFocused;
};
```

## 4. Context Menu Prevention & Custom Native Context Menu

By default, desktop webviews display the standard browser inspect context menu on right click. In production:
- Prevent default context menu in root container except inside editable inputs:
  ```typescript
  window.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });
  ```

## 5. Desktop Performance & Memory Management

- Utilize `React.memo` and `useCallback` for items in large lists.
- Virtualize large datasets (e.g. logs, item collections) using TanStack Virtual or similar virtual scroll.
- Clean up event listeners and IPC subscriptions in `useEffect` cleanup returns to prevent memory leaks during long-running desktop sessions.
