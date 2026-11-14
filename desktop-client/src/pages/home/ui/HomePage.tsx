import { SystemInfoWidget } from '@/features/system-info';
import { Badge, Box, Card, HStack, Heading, Stack, Text, VStack } from '@/shared/ui';
import { Layers, ShieldCheck } from 'lucide-react';
import type React from 'react';

export const HomePage: React.FC = () => {
  return (
    <Box p="6">
      <VStack align="stretch" gap="5">
        <Box>
          <HStack gap="3" mb="2" align="center">
            <Heading size="2xl" color="fg">
              CosmoLost Desktop Client
            </Heading>
            <Badge colorPalette="purple" size="md" variant="subtle">
              FSD v2.1
            </Badge>
            <Badge colorPalette="teal" size="md" variant="subtle">
              Tauri v2
            </Badge>
          </HStack>
          <Text color="fg.muted" fontSize="md">
            Production-ready desktop architecture configured with Feature-Sliced Design, Chakra UI,
            and strict TypeScript.
          </Text>
        </Box>

        <Stack direction={{ base: 'column', lg: 'row' }} gap="5" align="stretch">
          <SystemInfoWidget />

          <Card.Root
            p="5"
            borderRadius="xl"
            flex="1"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.subtle"
            boxShadow="sm"
          >
            <Card.Header p="0" mb="4">
              <HStack gap="2" align="center">
                <Layers size={18} color="#a855f7" />
                <Heading size="sm" color="fg">
                  FSD Hierarchy Enforced
                </Heading>
              </HStack>
            </Card.Header>
            <Card.Body p="0">
              <VStack align="stretch" gap="2.5" fontSize="sm">
                <HStack justify="space-between">
                  <Text color="purple.400" fontWeight="medium">
                    1. app
                  </Text>
                  <Text color="fg.muted">Providers, global styles, router</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="purple.400" fontWeight="medium">
                    2. pages
                  </Text>
                  <Text color="fg.muted">Route screens (HomePage, SettingsPage)</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="purple.400" fontWeight="medium">
                    3. widgets
                  </Text>
                  <Text color="fg.muted">Composite blocks (Header, Sidebar)</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="purple.400" fontWeight="medium">
                    4. features
                  </Text>
                  <Text color="fg.muted">Scenarios (WindowControls, SystemInfo)</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="purple.400" fontWeight="medium">
                    5. entities
                  </Text>
                  <Text color="fg.muted">Domain models & Repositories (SystemInfo, Session)</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="purple.400" fontWeight="medium">
                    6. shared
                  </Text>
                  <Text color="fg.muted">UI kit, Tauri bridge, config, lib</Text>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Stack>

        <Card.Root
          p="5"
          borderRadius="xl"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.subtle"
          boxShadow="sm"
        >
          <Card.Header p="0" mb="2">
            <HStack gap="2" align="center">
              <ShieldCheck size={18} color="#22c55e" />
              <Heading size="sm" color="fg">
                Desktop Performance & Safety
              </Heading>
            </HStack>
          </Card.Header>
          <Card.Body p="0">
            <Text fontSize="sm" color="fg.muted" lineHeight="tall">
              Native OS window controls are isolated via <code>shared/api/tauri</code>. Hotkeys and
              window listeners automatically detach on unmount to eliminate memory leaks.
            </Text>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};
