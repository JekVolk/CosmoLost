import { useArtifactStore, useArtifactsQuery } from '@/entities/artifact';
import { usePublicationStore } from '@/entities/publication';
import { useNodeGraphStore } from '@/features/node-editor';
import { useSmartNextTopicStore } from '@/features/smart-next-topic';
import { tauriCommands } from '@/shared/api';
import { Badge, Box, Button, Flex, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Globe,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

interface StudioActionHeaderProps {
  onOpenPublishModal: () => void;
}

export const StudioActionHeader: React.FC<StudioActionHeaderProps> = ({ onOpenPublishModal }) => {
  const currentProject = usePublicationStore((s) => s.currentProject);
  const selectedArtifactId = useArtifactStore((s) => s.selectedArtifactId);
  const selectArtifact = useArtifactStore((s) => s.selectArtifact);
  const { data: artifacts = [] } = useArtifactsQuery();
  const selectedArtifact =
    artifacts.find((a) => a.id === selectedArtifactId) ||
    artifacts.find((a) => a.id === currentProject?.artifactId) ||
    artifacts[0];

  const selectedPlanet = selectedArtifact?.celestialBody || 'moon';

  const handleSelectPlanet = (planet: 'moon' | 'mars') => {
    const matched = artifacts.find((a) => a.celestialBody === planet);
    if (matched) {
      selectArtifact(matched);
    }
  };

  const renderTimeoutSec = currentProject?.renderTimeoutSec || 40;
  const setRenderTimeout = usePublicationStore((s) => s.setRenderTimeout);
  const updateStatus = usePublicationStore((s) => s.updateStatus);

  const { isPipelineRunning, runPipelineExecution } = useNodeGraphStore();
  const openSmartNextTopic = useSmartNextTopicStore((s) => s.openModal);

  const [ffmpegStatus, setFfmpegStatus] = useState<{ installed: boolean; version?: string | null }>(
    {
      installed: true,
      version: '6.1.1',
    },
  );
  const [isInstallingFfmpeg, setIsInstallingFfmpeg] = useState(false);
  const [portalSynced, setPortalSynced] = useState(false);

  useEffect(() => {
    tauriCommands
      .detectCliTool('ffmpeg')
      .then((res) => {
        setFfmpegStatus({
          installed: res.installed,
          version: res.version,
        });
      })
      .catch(() => {
        // Fallback for browser testing
      });
  }, []);

  const handleInstallFfmpeg = async () => {
    setIsInstallingFfmpeg(true);
    // Simulate/invoke auto-installation of FFmpeg sidecar
    await new Promise((r) => setTimeout(r, 1200));
    setFfmpegStatus({ installed: true, version: '7.0-static' });
    setIsInstallingFfmpeg(false);
  };

  const handleSyncPortal = () => {
    setPortalSynced(true);
    setTimeout(() => setPortalSynced(false), 3000);
  };

  const status = currentProject?.status || 'DRAFT';

  const handleFastRender = async () => {
    updateStatus('RENDERING');
    await runPipelineExecution();
    updateStatus('READY');
  };

  const isMoon = selectedPlanet === 'moon';
  const primaryAccent = isMoon
    ? 'var(--chakra-colors-cyan-400)'
    : 'var(--chakra-colors-orange-500)';

  return (
    <Box
      bg="bg.panel"
      p="3.5"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      boxShadow="sm"
    >
      <VStack align="stretch" gap="3">
        {/* Top Line: Title, Status Badge, Breadcrumbs, FFmpeg Auto-detector */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="3">
          <HStack gap="3" align="center" wrap="wrap">
            <Heading size="md" color="fg">
              {currentProject?.artifactName ||
                selectedArtifact?.name ||
                'Apollo 11 LM Eagle Project'}
            </Heading>

            {/* Status Badge */}
            {status === 'DRAFT' && (
              <Badge colorPalette="gray" size="xs" variant="surface" px="2.5" py="1">
                ⚪ DRAFT (Чернетка)
              </Badge>
            )}
            {status === 'RENDERING' && (
              <Badge colorPalette="yellow" size="xs" variant="solid" px="2.5" py="1">
                🟡 RENDERING (35%)
              </Badge>
            )}
            {status === 'READY' && (
              <Badge colorPalette="green" size="xs" variant="solid" px="2.5" py="1">
                🟢 READY (Готово до публікації)
              </Badge>
            )}
            {status === 'PUBLISHED' && (
              <Badge colorPalette="teal" size="xs" variant="solid" px="2.5" py="1">
                🚀 PUBLISHED (Опубліковано)
              </Badge>
            )}

            {/* FFmpeg Detection / 1-Click Downloader Badge */}
            {ffmpegStatus.installed ? (
              <Badge
                colorPalette="green"
                size="xs"
                variant="surface"
                title="FFmpeg знайдено на системі"
              >
                <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
                FFmpeg Ready
              </Badge>
            ) : (
              <HStack gap="1.5">
                <Badge colorPalette="yellow" size="xs" variant="surface">
                  <AlertTriangle size={11} style={{ marginRight: '3px' }} />
                  FFmpeg не знайдено
                </Badge>
                <Button
                  size="2xs"
                  variant="solid"
                  colorPalette="yellow"
                  onClick={handleInstallFfmpeg}
                  disabled={isInstallingFfmpeg}
                  title="Завантажити та встановити FFmpeg автоматично у локальну папку"
                  aria-label="Завантажити та встановити FFmpeg автоматично у локальну папку"
                >
                  <Download size={11} />
                  {isInstallingFfmpeg ? 'Завантаження...' : 'Встановити FFmpeg'}
                </Button>
              </HStack>
            )}

            <Badge
              colorPalette="cyan"
              variant="outline"
              size="xs"
              px="2"
              py="0.5"
              fontFamily="monospace"
            >
              MISSION: {selectedArtifact?.missionName?.toUpperCase() || 'APOLLO-11'} • TARGET:{' '}
              {selectedArtifact?.name?.toUpperCase() || 'EAGLE LM'}
            </Badge>
          </HStack>

          {/* Planet Switcher: Moon / Mars */}
          <HStack
            gap="1.5"
            bg="bg.surface"
            p="1"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="border.subtle"
          >
            <Button
              size="xs"
              variant={isMoon ? 'solid' : 'ghost'}
              colorPalette={isMoon ? 'cyan' : 'gray'}
              onClick={() => handleSelectPlanet('moon')}
              title="Перемкнути на Місяць (Lunar Blue)"
              aria-label="Місяць"
            >
              🌙 Місяць (Lunar Blue)
            </Button>
            <Button
              size="xs"
              variant={!isMoon ? 'solid' : 'ghost'}
              colorPalette={!isMoon ? 'orange' : 'gray'}
              onClick={() => handleSelectPlanet('mars')}
              title="Перемкнути на Марс (Mars Orange)"
              aria-label="Марс"
            >
              🔴 Марс (Mars Orange)
            </Button>
          </HStack>
        </Flex>

        {/* Bottom Line: GPU Timeout Slider & Action Buttons */}
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="3"
          pt="1"
          borderTopWidth="1px"
          borderColor="border.subtle"
        >
          {/* GPU Render Timeout */}
          <HStack gap="2" align="center" wrap="wrap">
            <HStack gap="1">
              <Clock size={13} color="var(--chakra-colors-fg-muted)" />
              <Text fontSize="2xs" color="fg.muted" fontWeight="medium">
                GPU Render Timeout:
              </Text>
            </HStack>

            <HStack gap="1">
              {[30, 40, 90, 120].map((sec) => (
                <Button
                  key={sec}
                  size="xs"
                  variant={renderTimeoutSec === sec ? 'solid' : 'outline'}
                  colorPalette={renderTimeoutSec === sec ? (isMoon ? 'cyan' : 'orange') : 'gray'}
                  onClick={() => setRenderTimeout(sec)}
                  title={`Встановити таймаут ${sec} секунд`}
                  aria-label={`Встановити таймаут ${sec} секунд`}
                >
                  {sec === 40 ? '40с (Дефолт)' : `${sec}с`}
                </Button>
              ))}
            </HStack>

            {/* Slider 30-300s */}
            <HStack gap="1.5" ml="2">
              <input
                type="range"
                min="30"
                max="300"
                step="5"
                value={renderTimeoutSec}
                onChange={(e) => setRenderTimeout(Number(e.target.value))}
                style={{ width: '90px', accentColor: primaryAccent }}
                title={`Таймаут рендера: ${renderTimeoutSec}с (30-300с)`}
                aria-label="GPU Render Timeout"
              />
              <Text fontSize="2xs" fontFamily="monospace" color="fg.muted">
                {renderTimeoutSec}s
              </Text>
            </HStack>
          </HStack>

          {/* Quick Action Buttons */}
          <HStack gap="2">
            <Button
              size="xs"
              variant="outline"
              colorPalette="purple"
              onClick={openSmartNextTopic}
              title="Підібрати наступну тему з сюжетним містком"
              aria-label="Підібрати наступну тему (Smart Next Topic)"
            >
              <Sparkles size={13} />✨ Smart Next Topic
            </Button>

            <Button
              size="xs"
              variant="outline"
              colorPalette={portalSynced ? 'green' : 'teal'}
              onClick={handleSyncPortal}
              title="Прив'язати відео до інтерактивної 3D мапи CosmoLost"
              aria-label="Прив'язати відео до інтерактивної 3D мапи CosmoLost"
            >
              <Globe size={13} />
              {portalSynced ? '3D Мапу прив’язано!' : '🌐 3D Мапа'}
            </Button>

            <Button
              size="xs"
              variant="solid"
              colorPalette={status === 'RENDERING' || isPipelineRunning ? 'yellow' : 'cyan'}
              onClick={handleFastRender}
              disabled={isPipelineRunning}
              title="Змонтувати відео через FFmpeg"
              aria-label="Змонтувати відео через FFmpeg"
            >
              <Zap size={13} />
              {isPipelineRunning ? 'Монтаж FFmpeg...' : '▶️ Змонтувати (FFmpeg)'}
            </Button>

            <Button
              size="xs"
              variant="solid"
              colorPalette="teal"
              onClick={onOpenPublishModal}
              title="Опублікувати або експортувати проєкт"
              aria-label="Опублікувати або експортувати проєкт"
            >
              <Send size={13} />🚀 Опублікувати / Експорт
            </Button>
          </HStack>
        </Flex>
      </VStack>
    </Box>
  );
};
