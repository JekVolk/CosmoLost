import { useSettingsStore } from '@/entities/settings';
import { ChakraProvider, Theme, defaultSystem } from '@chakra-ui/react';
import type React from 'react';

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const accentColor = useSettingsStore((state) => state.settings.accentColor);

  return (
    <ChakraProvider value={defaultSystem}>
      <Theme appearance="dark" colorPalette={accentColor} width="100%" height="100%">
        {children}
      </Theme>
    </ChakraProvider>
  );
};
