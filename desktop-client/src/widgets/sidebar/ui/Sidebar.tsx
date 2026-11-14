import { type TabId, useNavigationStore } from '@/entities/navigation';
import { Box, Button, Text, VStack } from '@/shared/ui';
import { Home, Layers, Settings, Terminal } from 'lucide-react';
import type React from 'react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigationStore();

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
  };

  return (
    <Box
      as="aside"
      width="220px"
      bg="bg.panel"
      borderRightWidth="1px"
      borderColor="border.subtle"
      p="3"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <VStack align="stretch" gap="1">
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
        <Button
          variant={activeTab === 'overview' ? 'solid' : 'ghost'}
          colorPalette="blue"
          size="sm"
          justifyContent="flex-start"
          onClick={() => handleTabChange('overview')}
        >
          <Home size={16} />
          Overview
        </Button>
        <Button
          variant={activeTab === 'fsd' ? 'solid' : 'ghost'}
          colorPalette="purple"
          size="sm"
          justifyContent="flex-start"
          onClick={() => handleTabChange('fsd')}
        >
          <Layers size={16} />
          FSD Architecture
        </Button>
        <Button
          variant={activeTab === 'ipc' ? 'solid' : 'ghost'}
          colorPalette="teal"
          size="sm"
          justifyContent="flex-start"
          onClick={() => handleTabChange('ipc')}
        >
          <Terminal size={16} />
          IPC Bridge
        </Button>
      </VStack>

      <VStack align="stretch" gap="1">
        <Button
          variant={activeTab === 'settings' ? 'solid' : 'ghost'}
          colorPalette="gray"
          size="sm"
          justifyContent="flex-start"
          onClick={() => handleTabChange('settings')}
        >
          <Settings size={16} />
          Settings
        </Button>
      </VStack>
    </Box>
  );
};
