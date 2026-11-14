import { type TabId, useNavigationStore } from '@/entities/navigation';
import { useSettingsStore } from '@/entities/settings';
import { Box, Button, Text, VStack } from '@/shared/ui';
import { Home, Layers, Settings, Terminal } from 'lucide-react';
import type React from 'react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigationStore();
  const { accentColor, compactMode } = useSettingsStore((state) => state.settings);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
  };

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
          variant={activeTab === 'overview' ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => handleTabChange('overview')}
          title="Overview"
        >
          <Home size={16} />
          {!compactMode && 'Overview'}
        </Button>
        <Button
          variant={activeTab === 'fsd' ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => handleTabChange('fsd')}
          title="FSD Architecture"
        >
          <Layers size={16} />
          {!compactMode && 'FSD Architecture'}
        </Button>
        <Button
          variant={activeTab === 'ipc' ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => handleTabChange('ipc')}
          title="IPC Bridge"
        >
          <Terminal size={16} />
          {!compactMode && 'IPC Bridge'}
        </Button>
      </VStack>

      <VStack align="stretch" gap="1">
        <Button
          variant={activeTab === 'settings' ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => handleTabChange('settings')}
          title="Settings"
        >
          <Settings size={16} />
          {!compactMode && 'Settings'}
        </Button>
      </VStack>
    </Box>
  );
};
