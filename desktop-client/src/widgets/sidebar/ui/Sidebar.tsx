import { useSettingsStore } from '@/entities/settings';
import { ROUTES } from '@/shared/config';
import { Box, Button, Text, VStack } from '@/shared/ui';
import { Home, Layers, Settings, Terminal } from 'lucide-react';
import type React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accentColor, compactMode } = useSettingsStore((state) => state.settings);

  const isOverview = location.pathname === ROUTES.OVERVIEW || location.pathname === ROUTES.ROOT;
  const isFsd = location.pathname === ROUTES.FSD;
  const isIpc = location.pathname === ROUTES.IPC;
  const isSettings = location.pathname === ROUTES.SETTINGS;

  return (
    <Box
      as="aside"
      width={compactMode ? '64px' : '220px'}
      transition="width 0.2s ease"
      bg="bg.panel"
      borderRightWidth="1px"
      borderColor="border.subtle"
      p="3"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <VStack align="stretch" gap="1">
        {!compactMode && (
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color="fg.muted"
            px="2"
            py="1"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Navigation
          </Text>
        )}
        <Button
          variant={isOverview ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => navigate(ROUTES.OVERVIEW)}
          title="Overview"
        >
          <Home size={16} />
          {!compactMode && 'Overview'}
        </Button>
        <Button
          variant={isFsd ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => navigate(ROUTES.FSD)}
          title="FSD Architecture"
        >
          <Layers size={16} />
          {!compactMode && 'FSD Architecture'}
        </Button>
        <Button
          variant={isIpc ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => navigate(ROUTES.IPC)}
          title="IPC Bridge"
        >
          <Terminal size={16} />
          {!compactMode && 'IPC Bridge'}
        </Button>
      </VStack>

      <VStack align="stretch" gap="1">
        <Button
          variant={isSettings ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => navigate(ROUTES.SETTINGS)}
          title="Settings"
        >
          <Settings size={16} />
          {!compactMode && 'Settings'}
        </Button>
      </VStack>
    </Box>
  );
};
