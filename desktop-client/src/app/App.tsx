import { useNavigationStore } from '@/entities/navigation';
import { FsdArchitecturePage } from '@/pages/fsd';
import { HomePage } from '@/pages/home';
import { IpcBridgePage } from '@/pages/ipc';
import { SettingsPage } from '@/pages/settings';
import { useHotkey } from '@/shared/lib';
import { Box, Flex } from '@/shared/ui';
import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';
import { Statusbar } from '@/widgets/statusbar';
import type React from 'react';

export const App: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigationStore();

  // Desktop keyboard shortcuts to quickly navigate
  useHotkey({ key: '1', alt: true }, () => setActiveTab('overview'));
  useHotkey({ key: '2', alt: true }, () => setActiveTab('fsd'));
  useHotkey({ key: '3', alt: true }, () => setActiveTab('ipc'));
  useHotkey({ key: '4', alt: true }, () => setActiveTab('settings'));

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'overview':
        return <HomePage />;
      case 'fsd':
        return <FsdArchitecturePage />;
      case 'ipc':
        return <IpcBridgePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Flex
      direction="column"
      width="100vw"
      height="100vh"
      overflow="hidden"
      bg="bg.canvas"
      color="fg"
    >
      <Header />
      <Flex flex="1" overflow="hidden">
        <Sidebar />
        <Box as="main" flex="1" overflowY="auto" bg="bg.canvas">
          {renderActiveScreen()}
        </Box>
      </Flex>
      <Statusbar />
    </Flex>
  );
};
