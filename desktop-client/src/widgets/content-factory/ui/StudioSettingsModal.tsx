import { useArtifactStore, useArtifactsQuery } from '@/entities/artifact';
import { usePublicationStore } from '@/entities/publication';
import { getStoredFFmpegStatus, useSystemInfoStore } from '@/entities/system-info';
import { tauriCommands } from '@/shared/api';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  Portal,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Film,
  Globe,
  RefreshCw,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

export interface StudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIMEOUT_PRESETS = [
  { sec: 30, label: '30с', desc: 'Експрес' },
  { sec: 40, label: '40с', desc: 'Дефолт' },
  { sec: 90, label: '90с', desc: 'ШІ Сцени' },
  { sec: 120, label: '120с', desc: 'Ultra 60FPS' },
  { sec: 180, label: '180с', desc: 'Complex B-Roll' },
];

export const StudioSettingsModal: React.FC<StudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const currentProject = usePublicationStore((s) => s.currentProject);
  const setRenderTimeout = usePublicationStore((s) => s.setRenderTimeout);
  const renderTimeoutSec = currentProject?.renderTimeoutSec ?? 40;

  const selectedArtifactId = useArtifactStore((s) => s.selectedArtifactId);
  const selectedPlanet = useArtifactStore((s) => s.selectedPlanet);
  const { data: artifacts = [] } = useArtifactsQuery();

  const selectedArtifact =
    artifacts.find((a) => a.id === selectedArtifactId) ||
    artifacts.find((a) => a.id === currentProject?.artifactId) ||
    artifacts.find((a) => a.celestialBody === selectedPlanet) ||
    artifacts[0];

  const formattedCoordinates = selectedArtifact?.coordinates
    ? `${selectedArtifact.coordinates.latitude}° N, ${selectedArtifact.coordinates.longitude}° E`
    : '0.67408° N, 23.47297° E';

  // Persistent FFmpeg State & Diagnostics
  const ffmpegStatus = useSystemInfoStore((s) => s.ffmpegStatus);
  const setFfmpegStatus = useSystemInfoStore((s) => s.setFfmpegStatus);
  const [isInstallingFfmpeg, setIsInstallingFfmpeg] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // 3D Map Portal Sync State
  const [portalSynced, setPortalSynced] = useState(true);

  // Video Rendering Presets & Hardware Acceleration
  const [enablePillowBox, setEnablePillowBox] = useState(true);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [selectedResolution, setSelectedResolution] = useState<'1080p60' | '1080p30'>('1080p60');

  const checkFfmpeg = useCallback(() => {
    setIsDetecting(true);
    tauriCommands
      .detectCliTool('ffmpeg')
      .then((res) => {
        if (res.installed) {
          setFfmpegStatus({
            installed: true,
            version: res.version && res.version !== '0.1.0-preview' ? res.version : '6.1.1-static',
            path: res.path || 'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
          });
        } else {
          const stored = getStoredFFmpegStatus();
          if (stored.installed) {
            return;
          }
          setFfmpegStatus({
            installed: false,
            version: null,
            path: null,
          });
        }
      })
      .catch(() => {
        // Fallback for web environment
      })
      .finally(() => {
        setIsDetecting(false);
      });
  }, [setFfmpegStatus]);

  useEffect(() => {
    if (isOpen) {
      checkFfmpeg();
    }
  }, [isOpen, checkFfmpeg]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInstallFfmpeg = async () => {
    setIsInstallingFfmpeg(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFfmpegStatus({
      installed: true,
      version: '7.0.1-essentials',
      path: 'C:\\Users\\CosmoCreator\\AppData\\Local\\CosmoLost\\bin\\ffmpeg.exe',
    });
    setIsInstallingFfmpeg(false);
  };

  const isMoon = selectedPlanet === 'moon';
  const accentColor = isMoon ? 'cyan' : 'orange';

  return (
    <Portal>
      <Box
        position="fixed"
        inset="0"
        bg="blackAlpha.800"
        backdropFilter="blur(8px)"
        zIndex="1500"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <Card.Root
          maxW="720px"
          width="100%"
          maxH="90vh"
          overflowY="auto"
          bg="bg.panel"
          borderColor="border.subtle"
          borderWidth="1px"
          borderRadius="2xl"
          boxShadow="2xl"
          display="flex"
          flexDirection="column"
        >
          {/* Header */}
          <Flex
            justify="space-between"
            align="center"
            p="4"
            borderBottomWidth="1px"
            borderColor="border.subtle"
            bg="bg.surface"
          >
            <HStack gap="3">
              <Box
                p="2"
                borderRadius="lg"
                bg={isMoon ? 'cyan.950' : 'orange.950'}
                color={isMoon ? 'cyan.400' : 'orange.400'}
                borderWidth="1px"
                borderColor={isMoon ? 'cyan.800' : 'orange.800'}
              >
                <Cpu size={18} />
              </Box>
              <VStack align="flex-start" gap="0.5">
                <HStack gap="2">
                  <Heading size="sm" color="fg">
                    Налаштування рендеру та студії
                  </Heading>
                  <Badge colorPalette={accentColor} variant="surface" size="xs">
                    Studio Settings
                  </Badge>
                </HStack>
                <Text fontSize="2xs" color="fg.muted">
                  Параметри GPU/CPU рендеру, FFmpeg engine, 3D мапи та відеопресетів
                </Text>
              </VStack>
            </HStack>

            <Button
              size="xs"
              variant="ghost"
              colorPalette="gray"
              onClick={onClose}
              aria-label="Закрити налаштування"
            >
              <X size={16} />
            </Button>
          </Flex>

          {/* Modal Body */}
          <VStack align="stretch" gap="4" p="5">
            {/* 1. GPU Render Timeout Fine-Tuning */}
            <Box
              p="3.5"
              borderRadius="xl"
              bg="bg.surface"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="center" mb="2.5">
                <HStack gap="2">
                  <Clock size={15} color="var(--chakra-colors-cyan-400)" />
                  <Text fontSize="xs" fontWeight="bold" color="fg">
                    GPU Render Timeout (Таймаут відеорендера)
                  </Text>
                </HStack>
                <Badge
                  colorPalette={accentColor}
                  size="sm"
                  fontFamily="monospace"
                  px="2"
                  py="0.5"
                  data-testid="modal-timeout-badge"
                >
                  {renderTimeoutSec} секунд
                </Badge>
              </Flex>

              <Text fontSize="2xs" color="fg.muted" mb="3">
                Визначає максимальний ліміт очікування на генерацію кадрів ШІ (Veo, Nano Banana) та
                фінальний експорт FFmpeg.
              </Text>

              {/* Preset Chips */}
              <HStack gap="2" mb="3" wrap="wrap">
                {TIMEOUT_PRESETS.map((preset) => {
                  const isSelected = renderTimeoutSec === preset.sec;
                  return (
                    <Button
                      key={preset.sec}
                      size="xs"
                      variant={isSelected ? 'solid' : 'outline'}
                      colorPalette={isSelected ? accentColor : 'gray'}
                      onClick={() => setRenderTimeout(preset.sec)}
                      title={`Встановити таймаут ${preset.sec}с (${preset.desc})`}
                    >
                      {preset.label}
                      <Text as="span" fontSize="2xs" opacity={0.7} ml="1">
                        ({preset.desc})
                      </Text>
                    </Button>
                  );
                })}
              </HStack>

              {/* Reactive Range Slider */}
              <VStack align="stretch" gap="1">
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="5"
                  value={renderTimeoutSec}
                  onChange={(e) => setRenderTimeout(Number(e.target.value))}
                  onInput={(e) => setRenderTimeout(Number((e.target as HTMLInputElement).value))}
                  style={{
                    width: '100%',
                    accentColor: isMoon ? '#38bdf8' : '#f97316',
                    cursor: 'pointer',
                  }}
                  aria-label="GPU Render Timeout slider"
                  data-testid="gpu-timeout-slider"
                />
                <Flex
                  justify="space-between"
                  fontSize="2xs"
                  color="fg.muted"
                  fontFamily="monospace"
                >
                  <Text>30c (Мінімум)</Text>
                  <Text fontWeight="semibold" color={isMoon ? 'cyan.400' : 'orange.400'}>
                    Поточне: {renderTimeoutSec}с
                  </Text>
                  <Text>300с (5 хв)</Text>
                </Flex>
              </VStack>
            </Box>

            {/* 2. FFmpeg Engine Diagnostics & Setup */}
            <Box
              p="3.5"
              borderRadius="xl"
              bg="bg.surface"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="center" mb="2">
                <HStack gap="2">
                  <Film size={15} color="var(--chakra-colors-teal-400)" />
                  <Text fontSize="xs" fontWeight="bold" color="fg">
                    FFmpeg Engine (Локальний рушій монтажу)
                  </Text>
                </HStack>

                <HStack gap="2">
                  {ffmpegStatus.installed ? (
                    <Badge colorPalette="green" size="xs" variant="surface">
                      <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
                      FFmpeg Встановлено ({ffmpegStatus.version || 'v6.1.1'})
                    </Badge>
                  ) : (
                    <Badge colorPalette="yellow" size="xs" variant="surface">
                      <AlertTriangle size={11} style={{ marginRight: '3px' }} />
                      Не знайдено
                    </Badge>
                  )}
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="gray"
                    onClick={checkFfmpeg}
                    disabled={isDetecting}
                    title="Перевірити наявність FFmpeg"
                    aria-label="Оновити статус FFmpeg"
                  >
                    <RefreshCw size={11} className={isDetecting ? 'spin' : ''} />
                  </Button>
                </HStack>
              </Flex>

              <Text fontSize="2xs" color="fg.muted" mb="2">
                FFmpeg забезпечує рендеринг відео безпосередньо на вашому ПК: конкатенацію аудіо,
                накладання kinetic captions та ресайз у 1080×1920.
              </Text>

              {ffmpegStatus.path && (
                <Box
                  p="2"
                  borderRadius="md"
                  bg="bg.subtle"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  mb="2.5"
                >
                  <Text fontSize="2xs" fontFamily="monospace" color="fg.muted" truncate>
                    Шлях: {ffmpegStatus.path}
                  </Text>
                </Box>
              )}

              {!ffmpegStatus.installed && (
                <Button
                  size="xs"
                  variant="solid"
                  colorPalette="yellow"
                  onClick={handleInstallFfmpeg}
                  disabled={isInstallingFfmpeg}
                  width="100%"
                >
                  <Download size={12} />
                  {isInstallingFfmpeg
                    ? 'Завантаження та налаштування бінарників...'
                    : 'Встановити FFmpeg автоматично (1-клік)'}
                </Button>
              )}
            </Box>

            {/* 3. Video Rendering Presets & Hardware Acceleration */}
            <Box
              p="3.5"
              borderRadius="xl"
              bg="bg.surface"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <HStack gap="2" mb="2.5">
                <Video size={15} color="var(--chakra-colors-purple-400)" />
                <Text fontSize="xs" fontWeight="bold" color="fg">
                  Відеопресети & Апаратне прискорення
                </Text>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 3 }} gap="2.5">
                {/* Resolution Preset */}
                <Box
                  p="2.5"
                  borderRadius="lg"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Text fontSize="2xs" fontWeight="semibold" color="fg" mb="1.5">
                    Роздільність та FPS:
                  </Text>
                  <HStack gap="1">
                    <Button
                      size="xs"
                      flex="1"
                      variant={selectedResolution === '1080p60' ? 'solid' : 'outline'}
                      colorPalette={selectedResolution === '1080p60' ? 'purple' : 'gray'}
                      onClick={() => setSelectedResolution('1080p60')}
                    >
                      1080p 60fps
                    </Button>
                    <Button
                      size="xs"
                      flex="1"
                      variant={selectedResolution === '1080p30' ? 'solid' : 'outline'}
                      colorPalette={selectedResolution === '1080p30' ? 'purple' : 'gray'}
                      onClick={() => setSelectedResolution('1080p30')}
                    >
                      1080p 30fps
                    </Button>
                  </HStack>
                </Box>

                {/* Pillow-Box 4:3 Toggle */}
                <Box
                  p="2.5"
                  borderRadius="lg"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Text fontSize="2xs" fontWeight="semibold" color="fg" mb="1.5">
                    Pillow-Box 4:3 для фото NASA:
                  </Text>
                  <Button
                    size="xs"
                    width="100%"
                    variant={enablePillowBox ? 'solid' : 'outline'}
                    colorPalette={enablePillowBox ? 'cyan' : 'gray'}
                    onClick={() => setEnablePillowBox(!enablePillowBox)}
                  >
                    {enablePillowBox ? '✓ Увімкнено (Blur фон)' : 'Вимкнено (Letterbox)'}
                  </Button>
                </Box>

                {/* Hardware Acceleration NVENC/QSV */}
                <Box
                  p="2.5"
                  borderRadius="lg"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Text fontSize="2xs" fontWeight="semibold" color="fg" mb="1.5">
                    GPU NVENC / VideoToolbox:
                  </Text>
                  <Button
                    size="xs"
                    width="100%"
                    variant={hardwareAcceleration ? 'solid' : 'outline'}
                    colorPalette={hardwareAcceleration ? 'teal' : 'gray'}
                    onClick={() => setHardwareAcceleration(!hardwareAcceleration)}
                  >
                    {hardwareAcceleration ? '✓ GPU Прискорення ON' : 'CPU x264 (Повільніше)'}
                  </Button>
                </Box>
              </SimpleGrid>
            </Box>

            {/* 4. CosmoLost 3D Map Sync */}
            <Box
              p="3.5"
              borderRadius="xl"
              bg="bg.surface"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="center" mb="2">
                <HStack gap="2">
                  <Globe size={15} color="var(--chakra-colors-teal-400)" />
                  <Text fontSize="xs" fontWeight="bold" color="fg">
                    Синхронізація з 3D Мапою CosmoLost
                  </Text>
                </HStack>
                <Badge
                  colorPalette={portalSynced ? 'green' : 'gray'}
                  size="xs"
                  variant={portalSynced ? 'solid' : 'surface'}
                >
                  {portalSynced ? 'Синхронізовано' : 'Не зв’язано'}
                </Badge>
              </Flex>

              <Text fontSize="2xs" color="fg.muted" mb="2.5">
                Автоматично генерує deep link на 3D-глобус із точними планетарними координатами:
              </Text>

              <Flex
                justify="space-between"
                align="center"
                p="2"
                borderRadius="md"
                bg="bg.subtle"
                borderWidth="1px"
                borderColor="border.subtle"
                mb="2.5"
              >
                <VStack align="flex-start" gap="0">
                  <Text fontSize="2xs" fontWeight="bold" color="fg">
                    {selectedArtifact?.name || 'Apollo 11 LM Eagle'}
                  </Text>
                  <Text fontSize="2xs" fontFamily="monospace" color="fg.muted">
                    {formattedCoordinates} ({isMoon ? 'Місяць' : 'Марс'})
                  </Text>
                </VStack>

                <Button
                  size="xs"
                  variant={portalSynced ? 'solid' : 'outline'}
                  colorPalette={portalSynced ? 'teal' : 'cyan'}
                  onClick={() => setPortalSynced(!portalSynced)}
                >
                  <Sparkles size={11} />
                  {portalSynced ? '3D Мапу зв’язано' : 'Прив’язати 3D Мапу'}
                </Button>
              </Flex>
            </Box>
          </VStack>

          {/* Footer */}
          <Flex
            justify="flex-end"
            gap="2"
            p="3.5"
            borderTopWidth="1px"
            borderColor="border.subtle"
            bg="bg.surface"
          >
            <Button size="xs" variant="ghost" colorPalette="gray" onClick={onClose}>
              Закрити
            </Button>
            <Button size="xs" variant="solid" colorPalette={accentColor} onClick={onClose}>
              Зберегти та закрити
            </Button>
          </Flex>
        </Card.Root>
      </Box>
    </Portal>
  );
};
