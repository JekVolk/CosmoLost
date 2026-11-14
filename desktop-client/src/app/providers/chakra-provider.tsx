import { ChakraProvider, Theme, defaultSystem } from '@chakra-ui/react';
import type React from 'react';

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ChakraProvider value={defaultSystem}>
      <Theme appearance="dark" colorPalette="blue" width="100%" height="100%">
        {children}
      </Theme>
    </ChakraProvider>
  );
};
