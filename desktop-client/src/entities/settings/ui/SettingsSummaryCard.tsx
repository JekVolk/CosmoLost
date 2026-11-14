import { Badge, Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
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
  return (
    <Box p="5" borderRadius="xl" bg="bg.panel" borderWidth="1px" borderColor="border.subtle">
      <Flex justify="space-between" align="center" mb="4">
        <HStack gap="2">
          <Text fontWeight="semibold" fontSize="md" color="fg">
            Tauri Store Engine Status
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
          <Text color="fg.muted">Storage target file</Text>
          <Text fontFamily="mono" color="fg">
            cosmolost-settings.json
          </Text>
        </Flex>

        <Flex justify="space-between" borderBottomWidth="1px" borderColor="border.subtle" pb="2">
          <Text color="fg.muted">Active Accent Palette</Text>
          <Badge colorPalette={settings.accentColor} variant="surface">
            {settings.accentColor}
          </Badge>
        </Flex>

        <Flex justify="space-between" borderBottomWidth="1px" borderColor="border.subtle" pb="2">
          <Text color="fg.muted">Metrics Auto-Refresh</Text>
          <Text color="fg">
            {settings.autoRefreshMetrics ? `Every ${settings.refreshIntervalSec}s` : 'Disabled'}
          </Text>
        </Flex>

        <Flex justify="space-between">
          <Text color="fg.muted">Last Exported</Text>
          <Text color="fg" fontSize="xs">
            {settings.lastExportedAt
              ? new Date(settings.lastExportedAt).toLocaleString()
              : 'Never exported'}
          </Text>
        </Flex>
      </VStack>
    </Box>
  );
}
