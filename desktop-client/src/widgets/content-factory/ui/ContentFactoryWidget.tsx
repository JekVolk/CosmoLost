import { ArtifactCard, useArtifactStore, useArtifactsQuery } from '@/entities/artifact';
import { ProjectSummaryCard, usePublicationStore } from '@/entities/publication';
import { MediaEnginePanel } from '@/features/media-engine';
import { NodeGraphCanvas } from '@/features/node-editor';
import { ScriptGeneratorPanel } from '@/features/script-generator';
import { SocialPublishPanel } from '@/features/social-publishing';
import { Badge, Box, Button, HStack, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Network, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export function ContentFactoryWidget() {
  const { data: artifacts = [], isLoading } = useArtifactsQuery();
  const selectedArtifactId = useArtifactStore((s) => s.selectedArtifactId);
  const selectArtifact = useArtifactStore((s) => s.selectArtifact);
  const currentProject = usePublicationStore((s) => s.currentProject);

  const [viewMode, setViewMode] = useState<'panels' | 'graph'>('panels');

  return (
    <VStack align="stretch" gap="6">
      <Box>
        <HStack justify="space-between" align="center" wrap="wrap" gap="3" mb="2">
          <HStack gap="3" align="center">
            <Heading size="xl" color="fg">
              Фабрика Контенту CosmoLost
            </Heading>
            <Badge colorPalette="teal" variant="solid" size="md">
              Local-First Engine
            </Badge>
            <Badge colorPalette="purple" variant="subtle" size="md">
              1080x1920 60FPS
            </Badge>
          </HStack>

          {/* View Switcher: Panels vs Visual DAG */}
          <HStack gap="2">
            <Button
              size="sm"
              variant={viewMode === 'panels' ? 'solid' : 'outline'}
              colorPalette="teal"
              onClick={() => setViewMode('panels')}
            >
              <SlidersHorizontal size={14} />
              Панелі керування
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'graph' ? 'solid' : 'outline'}
              colorPalette="purple"
              onClick={() => setViewMode('graph')}
            >
              <Network size={14} />
              Нодовий Граф (@xyflow/react)
            </Button>
          </HStack>
        </HStack>

        <Text color="fg.muted" fontSize="sm">
          Автоматизоване виробництво вірусних науково-популярних роликів (Shorts / Reels / TikTok)
          за артефактами NASA.
        </Text>
      </Box>

      {/* Artifact Selection Bar */}
      <Box>
        <HStack justify="space-between" mb="3">
          <Text fontWeight="semibold" fontSize="sm" color="fg">
            1. Вибір цільового артефакту (NASA Open Data & 3D Models):
          </Text>
          {isLoading && <Badge size="xs">Завантаження каталогу...</Badge>}
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
          {artifacts.map((art) => (
            <ArtifactCard
              key={art.id}
              artifact={art}
              isSelected={selectedArtifactId === art.id}
              onSelect={selectArtifact}
            />
          ))}
        </SimpleGrid>
      </Box>

      {/* Dynamic View: Node Graph vs Modular Panels */}
      {viewMode === 'graph' ? (
        <Box>
          <Text fontWeight="semibold" fontSize="sm" color="fg" mb="3">
            2. Візуальний DAG пайплайну генерації та дистрибуції:
          </Text>
          <NodeGraphCanvas />
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
          <VStack align="stretch" gap="6">
            <ScriptGeneratorPanel />
            <MediaEnginePanel />
          </VStack>

          <VStack align="stretch" gap="6">
            <SocialPublishPanel />
            {currentProject && (
              <Box>
                <Text fontWeight="semibold" fontSize="sm" color="fg" mb="3">
                  Поточний активний проект:
                </Text>
                <ProjectSummaryCard project={currentProject} />
              </Box>
            )}
          </VStack>
        </SimpleGrid>
      )}
    </VStack>
  );
}
