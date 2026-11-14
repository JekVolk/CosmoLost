import type React from 'react';
import { AppThemeProvider } from './chakra-provider';
import { AppQueryProvider } from './query-provider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppQueryProvider>
      <AppThemeProvider>{children}</AppThemeProvider>
    </AppQueryProvider>
  );
};
