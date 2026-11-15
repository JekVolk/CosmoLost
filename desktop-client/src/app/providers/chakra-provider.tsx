import { useSettingsStore } from '@/entities/settings';
import { ChakraProvider, Theme, defaultSystem } from '@chakra-ui/react';
import type React from 'react';
import { useEffect, useState } from 'react';

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accentColor, themeMode } = useSettingsStore((state) => state.settings);

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const appearance: 'dark' | 'light' =
    themeMode === 'system' ? (systemIsDark ? 'dark' : 'light') : themeMode;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(appearance);
    document.documentElement.style.colorScheme = appearance;
  }, [appearance]);

  return (
    <ChakraProvider value={defaultSystem}>
      <Theme appearance={appearance} colorPalette={accentColor} width="100%" height="100%">
        {children}
      </Theme>
    </ChakraProvider>
  );
};
