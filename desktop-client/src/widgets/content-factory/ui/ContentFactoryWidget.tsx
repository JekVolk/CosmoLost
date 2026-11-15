import { ArtifactCard, useArtifactStore, useArtifactsQuery } from '@/entities/artifact';
import { ProjectSummaryCard, usePublicationStore } from '@/entities/publication';
import { GameplayBrollModal, GameplayBrollQuickButton } from '@/features/gameplay-broll';
import { GenerativeLabModal } from '@/features/generative-lab';
import { NodeGraphCanvas } from '@/features/node-editor';
import { PngTuberAvatarEditorModal } from '@/features/pngtuber-editor';
import { ScriptGeneratorPanel } from '@/features/script-generator';
import { SmartNextTopicDialog } from '@/features/smart-next-topic';
import { PublicationExportDialog, SocialPublishPanel } from '@/features/social-publishing';
import { ROUTES } from '@/shared/config';
import { Badge, Box, Button, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, Database, Network, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShortsMonitorPreview } from './ShortsMonitorPreview';
import { StudioActionHeader } from './StudioActionHeader';
import { StudioStepper } from './StudioStepper';

export function ContentFactoryWidget() {
  const navigate = useNavigate();
  const { data: artifacts = [], isLoading } = useArtifactsQuery();
  const selectedArtifactId = useArtifactStore((s) => s.selectedArtifactId);
  const selectArtifact = useArtifactStore((s) => s.selectArtifact);
  const currentProject = usePublicationStore((s) => s.currentProject);

  const [viewMode, setViewMode] = useState<'graph' | 'panels' | 'artifacts'>('graph');
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);

  const selectedArtifact =
    artifacts.find((a) => a.id === selectedArtifactId) ||
    artifacts.find((a) => a.id === currentProject?.artifactId) ||
    artifacts[0];

  return (
    <VStack align="stretch" gap="4">
      {/* Top Studio Navigation & Breadcrumbs */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="2">
        <HStack gap="2.5">
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
          <Badge colorPalette="teal" variant="solid" size="xs" px="2.5" py="1" borderRadius="md">
            Local-First Studio V2
          </Badge>
          <Badge colorPalette="purple" variant="subtle" size="xs" px="2.5" py="1" borderRadius="md">
            1080×1920 • 60 FPS
          </Badge>
          {selectedArtifact && (
            <Badge
              colorPalette="teal"
              variant="surface"
              size="xs"
              px="2.5"
              py="1"
              borderRadius="md"
            >
              <Sparkles size={11} style={{ marginRight: '4px' }} />
              {selectedArtifact.name}
            </Badge>
          )}
        </HStack>

        <HStack gap="2">
          <GameplayBrollQuickButton />
          <Button
            size="xs"
            variant={viewMode === 'graph' ? 'solid' : 'outline'}
            colorPalette="purple"
            onClick={() => setViewMode('graph')}
          >
            <Network size={13} />
            Нодовий Граф (React Flow)
          </Button>
          <Button
            size="xs"
            variant={viewMode === 'panels' ? 'solid' : 'outline'}
            colorPalette="teal"
            onClick={() => setViewMode('panels')}
          >
            <SlidersHorizontal size={13} />
            Панелі скрипта
          </Button>
          <Button
            size="xs"
            variant={viewMode === 'artifacts' ? 'solid' : 'outline'}
            colorPalette="cyan"
            onClick={() => setViewMode('artifacts')}
          >
            <Database size={13} />
            Артефакти ({artifacts.length})
          </Button>
        </HStack>
      </Flex>

      {/* Fast Action Header with Project Title, Render Status, GPU Timeout Slider, Fast Actions */}
      <StudioActionHeader onOpenPublishModal={() => setIsExportDialogOpen(true)} />

      {/* 5-Stage Stepper: Artifact -> Script -> Audio -> Composite -> Publish */}
      <StudioStepper
        currentStage={currentStage}
        onSelectStage={(stage) => {
          setCurrentStage(stage);
          if (stage === 1) setViewMode('artifacts');
          else if (stage === 2) setViewMode('panels');
          else if (stage === 5) setIsExportDialogOpen(true);
          else setViewMode('graph');
        }}
      />

      {/* Split-Screen Workspace (60% Left Workspace / 40% Right 9:16 Shorts Monitor) */}
      <SimpleGrid columns={{ base: 1, xl: 12 }} gap="4" alignItems="flex-start">
        {/* Left 60% Workspace (Columns: base: 12, xl: 7 or 8) */}
        <Box gridColumn={{ xl: 'span 7' }} display="flex" flexDirection="column" gap="4">
          {viewMode === 'graph' ? (
            <Box>
              <HStack justify="space-between" mb="2" align="center">
                <Text
                  fontWeight="bold"
                  fontSize="xs"
                  color="fg"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Нодовий граф (@xyflow/react) — 5-етапний пайплайн генерації:
                </Text>
                <Badge size="xs" variant="surface" colorPalette="teal">
                  Interactive Node Flow
                </Badge>
              </HStack>
              <NodeGraphCanvas />
            </Box>
          ) : viewMode === 'panels' ? (
            <VStack align="stretch" gap="4">
              <ScriptGeneratorPanel />
              <SocialPublishPanel />
              {currentProject && (
                <Box>
                  <Text fontWeight="semibold" fontSize="xs" color="fg" mb="2">
                    Поточний активний проект:
                  </Text>
                  <ProjectSummaryCard project={currentProject} />
                </Box>
              )}
            </VStack>
          ) : (
            <Box>
              <HStack justify="space-between" mb="2" align="center">
                <Text
                  fontWeight="semibold"
                  fontSize="xs"
                  color="fg"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Каталог артефактів NASA (Місяць / Марс):
                </Text>
                {isLoading && (
                  <Badge size="xs" colorPalette="teal">
                    Завантаження...
                  </Badge>
                )}
              </HStack>

              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="3">
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
          )}
        </Box>

        {/* Right 40% Panel: Interactive 9:16 Shorts Monitor */}
        <Box gridColumn={{ xl: 'span 5' }} position={{ xl: 'sticky' }} top={{ xl: '3' }}>
          <ShortsMonitorPreview />
        </Box>
      </SimpleGrid>

      {/* Global Studio Modals */}
      <PngTuberAvatarEditorModal />
      <GenerativeLabModal />
      <SmartNextTopicDialog />
      <PublicationExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
      <GameplayBrollModal />
    </VStack>
  );
}
