import { useSettingsStore } from '@/entities/settings';
import { Badge, Box, Flex, HStack, Text } from '@/shared/ui';
import { Activity, CheckCircle2, Database, Shield } from 'lucide-react';
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
          <CheckCircle2 size={12} color="#22c55e" />
          <Text fontSize="2xs" fontWeight="medium">
            {t('statusbar.tauriConnected')}
          </Text>
        </HStack>
        <Box width="1px" height="12px" bg="border.subtle" />
        <HStack gap="1.5">
          <Database size={12} color={isHydrated ? '#22c55e' : '#f59e0b'} />
          <Text fontSize="2xs">
            {isHydrated ? t('statusbar.storeSynced') : t('statusbar.storeLoading')}
          </Text>
        </HStack>
        <Box width="1px" height="12px" bg="border.subtle" />
        <HStack gap="1.5">
          <Activity size={12} color="#38bdf8" />
          <Text fontSize="2xs">
            {t('common.route')}: {currentRouteName}
          </Text>
        </HStack>
      </HStack>

      <HStack gap="3">
        <HStack gap="1.5">
          <Shield size={12} color="#a855f7" />
          <Text fontSize="2xs">{t('statusbar.fsdEnforced')}</Text>
        </HStack>
        <Badge size="xs" variant="surface" colorPalette={settings.accentColor}>
          {t('statusbar.theme')}: {settings.themeMode.toUpperCase()} / {settings.accentColor}
        </Badge>
      </HStack>
    </Flex>
  );
};
