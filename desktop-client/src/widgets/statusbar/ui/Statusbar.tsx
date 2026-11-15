import { useSettingsStore } from '@/entities/settings';
import { Badge, Box, Flex, HStack, Text } from '@/shared/ui';
import { Activity, CheckCircle2, Database, Sparkles } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export const Statusbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { settings, isHydrated } = useSettingsStore();

  const currentRouteName =
    location.pathname === '/' ? '/OVERVIEW' : location.pathname.toUpperCase();

  return (
    <Flex
      as="footer"
      align="center"
      justify="space-between"
      height="26px"
      bg="bg.panel"
      borderTopWidth="1px"
      borderColor="border.subtle"
      px="3"
      fontSize="xs"
      color="fg.muted"
      userSelect="none"
    >
      <HStack gap="3">
        <HStack gap="1.5">
          <CheckCircle2 size={12} color="var(--chakra-colors-green-500)" />
          <Text fontSize="2xs" fontWeight="medium">
            {t('statusbar.tauriConnected')}
          </Text>
        </HStack>
        <Box width="1px" height="12px" bg="border.subtle" />
        <HStack gap="1.5">
          <Database
            size={12}
            color={
              isHydrated ? 'var(--chakra-colors-green-500)' : 'var(--chakra-colors-yellow-500)'
            }
          />
          <Text fontSize="2xs">
            {isHydrated ? t('statusbar.storeSynced') : t('statusbar.storeLoading')}
          </Text>
        </HStack>
        <Box width="1px" height="12px" bg="border.subtle" />
        <HStack gap="1.5">
          <Activity size={12} color="var(--chakra-colors-cyan-400)" />
          <Text fontSize="2xs">
            {t('common.route')}: {currentRouteName}
          </Text>
        </HStack>
      </HStack>

      <HStack gap="3">
        <HStack gap="1.5">
          <Sparkles size={12} color="var(--chakra-colors-cyan-400)" />
          <Text fontSize="2xs">Shorts Studio • 1080p 60FPS</Text>
        </HStack>
        <Badge
          size="xs"
          variant="surface"
          colorPalette={settings.accentColor}
          px="2"
          py="0.5"
          borderRadius="md"
        >
          {t('statusbar.theme')}: {settings.themeMode.toUpperCase()} / {settings.accentColor}
        </Badge>
      </HStack>
    </Flex>
  );
};
