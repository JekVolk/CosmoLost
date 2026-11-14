import { useSettingsStore } from '@/entities/settings';
import { ROUTES } from '@/shared/config';
import { Box, Button, Text, VStack } from '@/shared/ui';
import { Bot, CalendarClock, Clapperboard, Home, Layers, Settings, Terminal } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { accentColor, compactMode } = useSettingsStore((state) => state.settings);

  const isOverview = location.pathname === ROUTES.OVERVIEW || location.pathname === ROUTES.ROOT;
  const isContentFactory = location.pathname === ROUTES.CONTENT_FACTORY;
  const isFsd = location.pathname === ROUTES.FSD;
  const isIpc = location.pathname === ROUTES.IPC;
  const isScheduler = location.pathname === ROUTES.SCHEDULER;
  const isMcp = location.pathname === ROUTES.MCP;
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
            {t('nav.title')}
          </Text>
        )}
        <Button
          variant={isOverview ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => navigate(ROUTES.OVERVIEW)}
          title={t('nav.overview')}
        >
          <Home size={16} />
          {!compactMode && t('nav.overview')}
        </Button>
        <Button
          variant={isContentFactory ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => navigate(ROUTES.CONTENT_FACTORY)}
          title="Фабрика контенту"
        >
          <Clapperboard size={16} />
          {!compactMode && 'Фабрика контенту'}
        </Button>
        <Button
          variant={isFsd ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => navigate(ROUTES.FSD)}
          title={t('nav.fsd')}
        >
          <Layers size={16} />
          {!compactMode && t('nav.fsd')}
        </Button>
        <Button
          variant={isIpc ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => navigate(ROUTES.IPC)}
          title={t('nav.ipc')}
        >
          <Terminal size={16} />
          {!compactMode && t('nav.ipc')}
        </Button>
        <Button
          variant={isScheduler ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => navigate(ROUTES.SCHEDULER)}
          title={t('nav.scheduler')}
        >
          <CalendarClock size={16} />
          {!compactMode && t('nav.scheduler')}
        </Button>
        <Button
          variant={isMcp ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="sm"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px={compactMode ? '2' : '3'}
          onClick={() => navigate(ROUTES.MCP)}
          title="MCP Hub"
        >
          <Bot size={16} />
          {!compactMode && 'MCP Hub'}
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
          title={t('nav.settings')}
        >
          <Settings size={16} />
          {!compactMode && t('nav.settings')}
        </Button>
      </VStack>
    </Box>
  );
};
