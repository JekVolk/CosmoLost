import { usePublicationStore } from '@/entities/publication';
import { useSettingsStore } from '@/entities/settings';
import { ROUTES } from '@/shared/config';
import { Badge, Box, Button, HStack, Text, VStack } from '@/shared/ui';
import { Clapperboard, FolderKanban, Plus, Settings, Sparkles } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { accentColor, compactMode } = useSettingsStore((state) => state.settings);
  const projects = usePublicationStore((state) => state.projects);

  const isContentFactory =
    location.pathname === ROUTES.CONTENT_FACTORY || location.pathname === ROUTES.ROOT;
  const isProjects = location.pathname === ROUTES.OVERVIEW;
  const isSettings = location.pathname === ROUTES.SETTINGS;

  return (
    <Box
      as="aside"
      width={compactMode ? '64px' : '230px'}
      transition="width 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      bg="bg.panel"
      borderRightWidth="1px"
      borderColor="border.subtle"
      p="3"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      boxSizing="border-box"
    >
      <VStack align="stretch" gap="2">
        {!compactMode && (
          <Box px="2" pb="1">
            <Text
              fontSize="2xs"
              fontWeight="bold"
              color="fg.muted"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Студія Shorts
            </Text>
          </Box>
        )}

        {/* 1. Video Editor / Content Factory (Main Workspace) */}
        <Button
          variant={isContentFactory ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="md"
          h="40px"
          borderRadius="lg"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px="3"
          onClick={() => navigate(ROUTES.CONTENT_FACTORY)}
          title="Фабрика контенту та редактор Shorts"
        >
          <Clapperboard size={18} />
          {!compactMode && (
            <HStack justify="space-between" flex="1">
              <Text fontSize="sm" fontWeight={isContentFactory ? 'semibold' : 'normal'}>
                Відеоредактор
              </Text>
              <Badge
                size="xs"
                colorPalette="teal"
                variant="subtle"
                px="2"
                py="0.5"
                borderRadius="md"
              >
                1080p
              </Badge>
            </HStack>
          )}
        </Button>

        {/* 2. Projects & Drafts Workspace */}
        <Button
          variant={isProjects ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="md"
          h="40px"
          borderRadius="lg"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px="3"
          onClick={() => navigate(ROUTES.OVERVIEW)}
          title="Всі проєкти та чернетки"
        >
          <FolderKanban size={18} />
          {!compactMode && (
            <HStack justify="space-between" flex="1">
              <Text fontSize="sm" fontWeight={isProjects ? 'semibold' : 'normal'}>
                Проєкти
              </Text>
              <Badge
                size="xs"
                variant={isProjects ? 'solid' : 'subtle'}
                colorPalette={accentColor}
                px="2"
                py="0.5"
                borderRadius="md"
              >
                {projects.length}
              </Badge>
            </HStack>
          )}
        </Button>

        {/* Quick Action: New Project */}
        <Button
          variant="outline"
          colorPalette={accentColor}
          size="sm"
          h="34px"
          borderRadius="lg"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px="3"
          onClick={() => navigate(ROUTES.OVERVIEW)}
          title="Створити новий проєкт або обрати новий артефакт"
        >
          <Plus size={16} />
          {!compactMode && (
            <Text fontSize="xs" fontWeight="semibold">
              Створити ролик
            </Text>
          )}
        </Button>
      </VStack>

      <VStack align="stretch" gap="2">
        {!compactMode && (
          <Box
            p="3"
            borderRadius="lg"
            bg="bg.subtle"
            borderWidth="1px"
            borderColor="border.subtle"
            display="flex"
            flexDirection="column"
            gap="1"
          >
            <HStack gap="1.5">
              <Sparkles size={13} color="#f59e0b" />
              <Text fontSize="2xs" fontWeight="bold" color="fg">
                SMM Рекомендація
              </Text>
            </HStack>
            <Text fontSize="2xs" color="fg.muted" lineHeight="1.3">
              Хронометраж ~40с та перші 3с без привітань — запорука 70%+ ретеншну.
            </Text>
          </Box>
        )}

        {/* 3. Settings */}
        <Button
          variant={isSettings ? 'solid' : 'ghost'}
          colorPalette={accentColor}
          size="md"
          h="40px"
          borderRadius="lg"
          justifyContent={compactMode ? 'center' : 'flex-start'}
          px="3"
          onClick={() => navigate(ROUTES.SETTINGS)}
          title={t('nav.settings')}
        >
          <Settings size={18} />
          {!compactMode && (
            <Text fontSize="sm" fontWeight={isSettings ? 'semibold' : 'normal'}>
              {t('nav.settings')}
            </Text>
          )}
        </Button>
      </VStack>
    </Box>
  );
};
