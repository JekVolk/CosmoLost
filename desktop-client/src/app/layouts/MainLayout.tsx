import { ROUTES } from '@/shared/config';
import { useHotkey } from '@/shared/lib';
import { Box, Flex } from '@/shared/ui';
import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';
import { Statusbar } from '@/widgets/statusbar';
import type React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  // Desktop keyboard shortcuts to quickly navigate routes
  useHotkey({ key: '1', alt: true }, () => navigate(ROUTES.OVERVIEW));
  useHotkey({ key: '2', alt: true }, () => navigate(ROUTES.FSD));
  useHotkey({ key: '3', alt: true }, () => navigate(ROUTES.IPC));
  useHotkey({ key: '4', alt: true }, () => navigate(ROUTES.SCHEDULER));
  useHotkey({ key: '5', alt: true }, () => navigate(ROUTES.MCP));
  useHotkey({ key: '6', alt: true }, () => navigate(ROUTES.SETTINGS));

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
          <Outlet />
        </Box>
      </Flex>
      <Statusbar />
    </Flex>
  );
};
