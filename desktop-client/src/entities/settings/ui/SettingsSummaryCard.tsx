import { Badge, Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { DesktopSettings } from '../model/types';

interface SettingsSummaryCardProps {
  settings: DesktopSettings;
  isHydrated: boolean;
  isTauriNative: boolean;
}

export function SettingsSummaryCard({
  settings,
  isHydrated,
  isTauriNative,
}: SettingsSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <Box p="5" borderRadius="xl" bg="bg.panel" borderWidth="1px" borderColor="border.subtle">
      <Flex justify="space-between" align="center" mb="4">
        <HStack gap="2">
          <Text fontWeight="semibold" fontSize="md" color="fg">
            {t('settings.storeEngineStatus')}
          </Text>
          <Badge colorPalette={isHydrated ? 'green' : 'yellow'} variant="subtle" size="sm">
            {isHydrated ? 'hydrated' : 'syncing'}
          </Badge>
        </HStack>
        <Badge colorPalette={isTauriNative ? 'teal' : 'orange'} variant="solid" size="sm">
          {isTauriNative ? 'native tauri-plugin-store' : 'browser fallback'}
        </Badge>
      </Flex>

      <VStack align="stretch" gap="3" fontSize="sm">
        <Flex justify="space-between" borderBottomWidth="1px" borderColor="border.subtle" pb="2">
          <Text color="fg.muted">{t('settings.storageTarget')}</Text>
          <Text fontFamily="mono" color="fg">
            cosmolost-settings.json
          </Text>
        </Flex>

        <Flex justify="space-between" borderBottomWidth="1px" borderColor="border.subtle" pb="2">
          <Text color="fg.muted">{t('settings.themeMode')}</Text>
          <Badge colorPalette={settings.accentColor} variant="outline">
            {settings.themeMode.toUpperCase()}
          </Badge>
        </Flex>

        <Flex justify="space-between" borderBottomWidth="1px" borderColor="border.subtle" pb="2">
          <Text color="fg.muted">{t('settings.language')}</Text>
          <Badge variant="surface">
            {settings.language === 'uk' ? 'Українська (UK)' : 'English (EN)'}
          </Badge>
        </Flex>

        <Flex justify="space-between" borderBottomWidth="1px" borderColor="border.subtle" pb="2">
          <Text color="fg.muted">{t('settings.activeAccent')}</Text>
          <Badge colorPalette={settings.accentColor} variant="surface">
            {settings.accentColor}
          </Badge>
        </Flex>

        <Flex justify="space-between" borderBottomWidth="1px" borderColor="border.subtle" pb="2">
          <Text color="fg.muted">{t('settings.autoRefresh')}</Text>
          <Text color="fg">
            {settings.autoRefreshMetrics
              ? `${t('common.enabled')} (${settings.refreshIntervalSec}s)`
              : t('common.disabled')}
          </Text>
        </Flex>

        <Flex justify="space-between">
          <Text color="fg.muted">{t('settings.lastExported')}</Text>
          <Text color="fg" fontSize="xs">
            {settings.lastExportedAt
              ? new Date(settings.lastExportedAt).toLocaleString()
              : t('settings.neverExported')}
          </Text>
        </Flex>
      </VStack>
    </Box>
  );
}
