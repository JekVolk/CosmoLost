import '@/shared/lib/i18n';
import type React from 'react';
import { AppInitializer } from './app-initializer';
import { AppThemeProvider } from './chakra-provider';
import { AppQueryProvider } from './query-provider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <AppInitializer>{children}</AppInitializer>
      </AppThemeProvider>
    </AppQueryProvider>
  );
};
