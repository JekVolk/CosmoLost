import { APP_CONFIG } from '@/shared/config';
import { Badge, Box, Card, HStack, Heading, Separator, Text, VStack } from '@/shared/ui';
import { Check, Command, Monitor, Shield } from 'lucide-react';
import type React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <Box p="6">
      <VStack align="stretch" gap="5">
        <Box>
          <HStack gap="3" mb="2" align="center">
            <Heading size="2xl" color="fg">
              Desktop Settings & Environment
            </Heading>
            <Badge colorPalette="gray" size="md" variant="subtle">
              v{APP_CONFIG.version}
            </Badge>
          </HStack>
          <Text color="fg.muted" fontSize="md">
            Application preferences, environment parameters, and desktop shortcuts.
          </Text>
        </Box>

        <Card.Root
          p="5"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="xl"
        >
          <Card.Header p="0" mb="4">
            <HStack gap="2" align="center">
              <Monitor size={18} color="#38bdf8" />
              <Heading size="sm" color="fg">
                Desktop Client Specifications
              </Heading>
            </HStack>
          </Card.Header>
          <Card.Body p="0">
            <VStack align="stretch" gap="3" fontSize="sm">
              <HStack justify="space-between">
                <Text color="fg.muted">Application Name:</Text>
                <Text fontWeight="semibold" color="fg">
                  {APP_CONFIG.appName}
                </Text>
              </HStack>
              <Separator borderColor="border.subtle" />
              <HStack justify="space-between">
                <Text color="fg.muted">Framework Core:</Text>
                <HStack gap="2">
                  <Badge colorPalette="teal" variant="surface">
                    Tauri v2
                  </Badge>
                  <Badge colorPalette="purple" variant="surface">
                    React 19
                  </Badge>
                </HStack>
              </HStack>
              <Separator borderColor="border.subtle" />
              <HStack justify="space-between">
                <Text color="fg.muted">Styling Engine:</Text>
                <Badge colorPalette="blue" variant="surface">
                  Chakra UI v3 (Dark Mode)
                </Badge>
              </HStack>
              <Separator borderColor="border.subtle" />
              <HStack justify="space-between">
                <Text color="fg.muted">State Management:</Text>
                <HStack gap="2">
                  <Badge colorPalette="orange" variant="surface">
                    React Query v5
                  </Badge>
                  <Badge colorPalette="cyan" variant="surface">
                    Zustand v5
                  </Badge>
                </HStack>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        <HStack gap="5" align="stretch">
          <Card.Root
            p="5"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
            flex="1"
          >
            <Card.Header p="0" mb="3">
              <HStack gap="2" align="center">
                <Command size={18} color="#a855f7" />
                <Heading size="sm" color="fg">
                  Desktop Shortcuts
                </Heading>
              </HStack>
            </Card.Header>
            <Card.Body p="0">
              <VStack align="stretch" gap="2.5" fontSize="sm">
                <HStack justify="space-between">
                  <Text color="fg.muted">Quick Refresh:</Text>
                  <Badge variant="outline">F5 / Ctrl + R</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="fg.muted">Overview Screen:</Text>
                  <Badge variant="outline">Alt + 1</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="fg.muted">FSD Architecture:</Text>
                  <Badge variant="outline">Alt + 2</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="fg.muted">IPC Bridge Tester:</Text>
                  <Badge variant="outline">Alt + 3</Badge>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root
            p="5"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
            flex="1"
          >
            <Card.Header p="0" mb="3">
              <HStack gap="2" align="center">
                <Shield size={18} color="#22c55e" />
                <Heading size="sm" color="fg">
                  Code Health & Quality
                </Heading>
              </HStack>
            </Card.Header>
            <Card.Body p="0">
              <VStack align="stretch" gap="2.5" fontSize="sm" color="fg.muted">
                <HStack gap="2">
                  <Check size={16} color="#22c55e" />
                  <Text>Biome Linter & Formatter active</Text>
                </HStack>
                <HStack gap="2">
                  <Check size={16} color="#22c55e" />
                  <Text>FSD Cross-Import Boundaries checked</Text>
                </HStack>
                <HStack gap="2">
                  <Check size={16} color="#22c55e" />
                  <Text>Strict TypeScript compiler mode</Text>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </HStack>
      </VStack>
    </Box>
  );
};
