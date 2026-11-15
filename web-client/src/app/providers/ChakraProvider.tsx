import { ChakraProvider as BaseChakraProvider, defaultSystem } from '@chakra-ui/react';
import type React from 'react';

export interface ChakraProviderProps {
  children: React.ReactNode;
}

export const ChakraProvider: React.FC<ChakraProviderProps> = ({ children }) => {
  return (
    <BaseChakraProvider value={defaultSystem}>
      <div
        className="dark"
        data-theme="dark"
        style={{ minHeight: '100vh', backgroundColor: '#0B0F19', color: '#F1F5F9' }}
      >
        {children}
      </div>
    </BaseChakraProvider>
  );
};
