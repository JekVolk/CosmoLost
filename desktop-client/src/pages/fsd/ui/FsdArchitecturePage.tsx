import { Badge, Box, Card, HStack, Heading, Separator, Text, VStack } from '@/shared/ui';
import { CheckCircle, Code, FolderTree, ShieldCheck } from 'lucide-react';
import type React from 'react';

const FSD_LAYERS_SPECS = [
  {
    layer: '1. app',
    badge: 'Root',
    colorPalette: 'purple',
    desc: 'Providers, global styles, router, and application initialization.',
    canImport: 'pages, widgets, features, entities, shared',
  },
  {
    layer: '2. pages',
    badge: 'Screens',
    colorPalette: 'blue',
    desc: 'Full desktop screens and route compositions.',
    canImport: 'widgets, features, entities, shared',
  },
  {
    layer: '3. widgets',
    badge: 'Composite',
    colorPalette: 'cyan',
    desc: 'Standalone composite UI blocks combining features & entities (Header, Sidebar).',
    canImport: 'features, entities, shared',
  },
  {
    layer: '4. features',
    badge: 'Scenarios',
    colorPalette: 'green',
    desc: 'User interactions that bring business value (WindowControls, SystemInfo).',
    canImport: 'entities, shared',
  },
  {
    layer: '5. entities',
    badge: 'Domain',
    colorPalette: 'orange',
    desc: 'Business models, API endpoints, Repository pattern, and pure UI cards.',
    canImport: 'shared only',
  },
  {
    layer: '6. shared',
    badge: 'Foundation',
    colorPalette: 'gray',
    desc: 'Reusable UI kit (Chakra UI wrappers), Tauri IPC bridge, config, lib/utils.',
    canImport: 'Nothing (Foundation)',
  },
];

export const FsdArchitecturePage: React.FC = () => {
  return (
    <Box p="6">
      <VStack align="stretch" gap="5">
        <Box>
          <HStack gap="3" mb="2" align="center">
            <Heading size="2xl" color="fg">
              Feature-Sliced Design Explorer
            </Heading>
            <Badge colorPalette="purple" size="md" variant="subtle">
              FSD v2.1
            </Badge>
          </HStack>
          <Text color="fg.muted" fontSize="md">
            Architectural rules, layer hierarchy, and automated boundary protection in CosmoLost.
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
              <FolderTree size={18} color="#a855f7" />
              <Heading size="sm" color="fg">
                Strict Layer Hierarchy (Top-to-Bottom)
              </Heading>
            </HStack>
          </Card.Header>
          <Card.Body p="0">
            <VStack align="stretch" gap="3">
              {FSD_LAYERS_SPECS.map((spec, index) => (
                <Box key={spec.layer}>
                  <HStack justify="space-between" align="center" py="1">
                    <HStack gap="3">
                      <Badge colorPalette={spec.colorPalette} size="sm" variant="surface">
                        {spec.badge}
                      </Badge>
                      <Text fontWeight="semibold" color="fg">
                        {spec.layer}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="fg.muted">
                      Imports: {spec.canImport}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="fg.muted" mt="0.5">
                    {spec.desc}
                  </Text>
                  {index < FSD_LAYERS_SPECS.length - 1 && (
                    <Separator my="2" borderColor="border.subtle" />
                  )}
                </Box>
              ))}
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
                <ShieldCheck size={18} color="#22c55e" />
                <Heading size="sm" color="fg">
                  Automated Boundary Guard
                </Heading>
              </HStack>
            </Card.Header>
            <Card.Body p="0">
              <VStack align="stretch" gap="2" fontSize="sm" color="fg.muted">
                <HStack gap="2">
                  <CheckCircle size={15} color="#22c55e" />
                  <Text>Zero cross-slice imports on the same layer</Text>
                </HStack>
                <HStack gap="2">
                  <CheckCircle size={15} color="#22c55e" />
                  <Text>Public API (index.ts) required for all slices</Text>
                </HStack>
                <HStack gap="2">
                  <CheckCircle size={15} color="#22c55e" />
                  <Text>Deep imports into slice internals strictly forbidden</Text>
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
                <Code size={18} color="#38bdf8" />
                <Heading size="sm" color="fg">
                  Clean Container Pattern
                </Heading>
              </HStack>
            </Card.Header>
            <Card.Body p="0">
              <VStack align="stretch" gap="2" fontSize="sm" color="fg.muted">
                <HStack gap="2">
                  <CheckCircle size={15} color="#38bdf8" />
                  <Text>Hooks and stores isolated in model/</Text>
                </HStack>
                <HStack gap="2">
                  <CheckCircle size={15} color="#38bdf8" />
                  <Text>UI components in ui/ are pure and props-driven</Text>
                </HStack>
                <HStack gap="2">
                  <CheckCircle size={15} color="#38bdf8" />
                  <Text>API callers mapped through Repository pattern</Text>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </HStack>
      </VStack>
    </Box>
  );
};
