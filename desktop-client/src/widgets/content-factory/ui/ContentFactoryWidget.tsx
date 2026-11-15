import { ArtifactCard, useArtifactStore, useArtifactsQuery } from '@/entities/artifact';
import { ProjectSummaryCard, usePublicationStore } from '@/entities/publication';
import { GameplayBrollModal, GameplayBrollQuickButton } from '@/features/gameplay-broll';
import { MediaEnginePanel } from '@/features/media-engine';
import { NodeGraphCanvas } from '@/features/node-editor';
import { ScriptGeneratorPanel } from '@/features/script-generator';
import { SocialPublishPanel } from '@/features/social-publishing';
import { ROUTES } from '@/shared/config';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ArrowLeft, Network, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ContentFactoryWidget() {
  const navigate = useNavigate();
  const { data: artifacts = [], isLoading } = useArtifactsQuery();
  const selectedArtifactId = useArtifactStore((s) => s.selectedArtifactId);
  const selectArtifact = useArtifactStore((s) => s.selectArtifact);
  const currentProject = usePublicationStore((s) => s.currentProject);

  const [viewMode, setViewMode] = useState<'panels' | 'graph'>('panels');

  const selectedArtifact = artifacts.find((a) => a.id === selectedArtifactId);

  return (
    <VStack align="stretch" gap="5">
      {/* Sleek Studio Header */}
      <Box bg="bg.panel" p="3.5" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
        <HStack justify="space-between" align="center" wrap="wrap" gap="3">
          <HStack gap="3" align="center">
            <Button
              size="xs"
              variant="outline"
              colorPalette="gray"
              onClick={() => navigate(ROUTES.OVERVIEW)}
              title="Повернутися до списку проєктів"
            >
              <ArrowLeft size={13} />
              До проєктів
            </Button>
            <Heading size="lg" color="fg">
              Фабрика Контенту CosmoLost
            </Heading>
            <Badge colorPalette="teal" variant="solid" size="xs" px="2.5" py="1" borderRadius="md">
              Local-First Engine
            </Badge>
            <Badge
              colorPalette="purple"
              variant="subtle"
              size="xs"
              px="2.5"
              py="1"
              borderRadius="md"
            >
              1080x1920 • 60 FPS
            </Badge>
            {selectedArtifact && (
              <Badge
                colorPalette="teal"
                size="xs"
                variant="surface"
                px="2.5"
                py="1"
                borderRadius="md"
              >
                <Sparkles size={11} style={{ marginRight: '4px' }} />
                {selectedArtifact.name}
              </Badge>
            )}
          </HStack>

          {/* View Switcher: Panels vs Visual DAG */}
          <HStack gap="2">
            <GameplayBrollQuickButton />
            <Button
              size="xs"
              variant={viewMode === 'panels' ? 'solid' : 'outline'}
              colorPalette="teal"
              onClick={() => setViewMode('panels')}
            >
              <SlidersHorizontal size={13} />
              Панелі керування
            </Button>
            <Button
              size="xs"
              variant={viewMode === 'graph' ? 'solid' : 'outline'}
              colorPalette="purple"
              onClick={() => setViewMode('graph')}
            >
              <Network size={13} />
              Нодовий Граф
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Artifact Selection Rail (Compact Horizontal Scroll) */}
      <Box>
        <HStack justify="space-between" mb="2" align="center">
          <HStack gap="2">
            <Text
              fontWeight="semibold"
              fontSize="xs"
              color="fg"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              1. Вибір цільового артефакту (NASA Open Data & 3D Models):
            </Text>
            <Badge
              size="xs"
              variant="outline"
              colorPalette="gray"
              px="2"
              py="0.5"
              borderRadius="md"
            >
              {artifacts.length} об'єктів
            </Badge>
          </HStack>
          {isLoading && (
            <Badge size="xs" px="2" py="0.5" borderRadius="md">
              Завантаження каталогу...
            </Badge>
          )}
        </HStack>

        <Flex
          overflowX="auto"
          gap="2.5"
          px="1"
          pb="2"
          css={{
            '&::-webkit-scrollbar': { height: '5px' },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--chakra-colors-border-subtle)',
              borderRadius: '4px',
            },
          }}
        >
          {artifacts.map((art) => (
            <Box key={art.id} minWidth="240px" maxWidth="260px" flexShrink={0}>
              <ArtifactCard
                artifact={art}
                isSelected={selectedArtifactId === art.id}
                onSelect={selectArtifact}
              />
            </Box>
          ))}
        </Flex>
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
        <SimpleGrid columns={{ base: 1, xl: 2 }} gap="5" alignItems="flex-start">
          {/* Left Column: Script Generation & Social Publishing */}
          <VStack align="stretch" gap="5">
            <ScriptGeneratorPanel />
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

          {/* Right Column: Shorts Studio Preview & Media Engine */}
          <Box position={{ xl: 'sticky' }} top={{ xl: '3' }}>
            <MediaEnginePanel />
          </Box>
        </SimpleGrid>
      )}
      {/* Modal / Overlay for B-Roll Gameplay Generator */}
      <GameplayBrollModal />
    </VStack>
  );
}
