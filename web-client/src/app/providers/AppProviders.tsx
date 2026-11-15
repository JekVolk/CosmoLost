import type React from 'react';
import { ChakraProvider } from './ChakraProvider';
import { QueryClientProvider } from './QueryClientProvider';

export interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ChakraProvider>
      <QueryClientProvider>{children}</QueryClientProvider>
    </ChakraProvider>
  );
};
