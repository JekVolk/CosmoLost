import { Badge, Card, HStack, Heading, Text, VStack } from '@/shared/ui';
import { Clock, Cpu, Terminal } from 'lucide-react';
import type React from 'react';
import type { SystemInfoModel } from '../model/types';

export interface SystemInfoCardViewProps {
  metrics: SystemInfoModel | null;
  isLoading: boolean;
  error: Error | null;
}

export const SystemInfoCardView: React.FC<SystemInfoCardViewProps> = ({
  metrics,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <Card.Root
        p="5"
        bg="bg.panel"
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="xl"
        maxW="420px"
        flex="1"
      >
        <Text fontSize="sm" color="fg.muted">
          Loading system metrics via React Query...
        </Text>
      </Card.Root>
    );
  }

  if (error) {
    return (
      <Card.Root
        p="5"
        bg="bg.panel"
        borderWidth="1px"
        borderColor="red.500"
        borderRadius="xl"
        maxW="420px"
        flex="1"
      >
        <Text fontSize="sm" color="red.400">
          Error: {error.message}
        </Text>
      </Card.Root>
    );
  }

  return (
    <Card.Root
      p="5"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="xl"
      maxW="420px"
      flex="1"
      boxShadow="sm"
    >
      <Card.Header p="0" mb="4">
        <HStack justify="space-between" align="center">
          <Heading size="sm" color="fg">
            Tauri Native Metrics
          </Heading>
          <Badge colorPalette="teal" variant="subtle" size="sm">
            {metrics?.status ?? 'online'}
          </Badge>
        </HStack>
      </Card.Header>
      <Card.Body p="0">
        <VStack align="stretch" gap="3">
          <HStack justify="space-between" align="center">
            <HStack gap="2" color="fg.muted">
              <Cpu size={16} />
              <Text fontSize="sm">OS & Architecture:</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="semibold" color="fg">
              {metrics?.osName} ({metrics?.arch})
            </Text>
          </HStack>

          <HStack justify="space-between" align="center">
            <HStack gap="2" color="fg.muted">
              <Terminal size={16} />
              <Text fontSize="sm">Client Version:</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="semibold" color="fg">
              v{metrics?.appVersion}
            </Text>
          </HStack>

          <HStack justify="space-between" align="center">
            <HStack gap="2" color="fg.muted">
              <Clock size={16} />
              <Text fontSize="xs">Loaded at:</Text>
            </HStack>
            <Text fontSize="xs" color="fg.muted">
              {metrics?.loadedAt}
            </Text>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
