import { useNavigationStore } from '@/entities/navigation';
import { useSettingsStore } from '@/entities/settings';
import { Badge, Box, Flex, HStack, Text } from '@/shared/ui';
import { Activity, CheckCircle2, Database, Shield } from 'lucide-react';
import type React from 'react';

export const Statusbar: React.FC = () => {
  const { activeTab } = useNavigationStore();
  const { settings, isHydrated } = useSettingsStore();

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
            Tauri v2 Core: Connected
          </Text>
        </HStack>
        <Box width="1px" height="12px" bg="border.subtle" />
        <HStack gap="1.5">
          <Database size={12} color={isHydrated ? '#22c55e' : '#f59e0b'} />
          <Text fontSize="2xs">Store: {isHydrated ? 'Synced' : 'Loading'}</Text>
        </HStack>
        <Box width="1px" height="12px" bg="border.subtle" />
        <HStack gap="1.5">
          <Activity size={12} color="#38bdf8" />
          <Text fontSize="2xs">Active: {activeTab.toUpperCase()}</Text>
        </HStack>
      </HStack>

      <HStack gap="3">
        <HStack gap="1.5">
          <Shield size={12} color="#a855f7" />
          <Text fontSize="2xs">FSD Strict: Enforced</Text>
        </HStack>
        <Badge size="xs" variant="surface" colorPalette={settings.accentColor}>
          Theme: {settings.accentColor}
        </Badge>
      </HStack>
    </Flex>
  );
};
