import { Badge, Box, Button, Card, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useMediaEngine } from '../model/use-media-engine';
import { ShortsSplitScreenStudio } from './ShortsSplitScreenStudio';
import { SubtitleCustomizerSection } from './SubtitleCustomizerSection';

export function MediaEnginePanel() {
  const {
    selectedVoice,
    setSelectedVoice,
    isSynthesizing,
    isRendering,
    renderProgress,
    statusMessage,
    renderTimeoutSec,
    setRenderTimeout,
    synthesizeAudio,
    renderFfmpegVideo,
    voices,
  } = useMediaEngine();

  return (
    <Card.Root bg="bg.panel" borderColor="border.subtle">
      <Card.Header>
        <Flex justify="space-between" align="center">
          <Text fontWeight="semibold" fontSize="lg" color="fg">
            Медіа-Конвеєр (Edge-TTS + FFmpeg Sidecar)
          </Text>
          <Badge colorPalette="blue" variant="subtle" size="xs" px="2.5" py="0.5" borderRadius="md">
            60 FPS • 1080x1920
          </Badge>
        </Flex>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap="4">
          {/* 9:16 Split-Screen & Emotional Character Studio (Primary Viewport) */}
          <ShortsSplitScreenStudio />

          {/* Quick Render Action Buttons */}
          <HStack gap="3" pt="1">
            <Button
              colorPalette="teal"
              size="md"
              loading={isRendering}
              onClick={renderFfmpegVideo}
              flex="1"
              fontWeight="semibold"
            >
              🎬 Змонтувати ролик FFmpeg (1080x1920)
            </Button>
            <Button
              colorPalette="blue"
              size="md"
              variant="outline"
              loading={isSynthesizing}
              onClick={synthesizeAudio}
            >
              🎙️ Синтезувати Озвучку
            </Button>
          </HStack>

          {renderProgress !== null && (
            <VStack align="stretch" gap="1">
              <HStack justify="space-between">
                <Text fontSize="xs" color="fg.muted">
                  Прогрес FFmpeg компиляції:
                </Text>
                <Text fontSize="xs" fontWeight="bold" color="teal.400">
                  {renderProgress}%
                </Text>
              </HStack>
              <Box height="6px" width="100%" bg="bg.subtle" borderRadius="full" overflow="hidden">
                <Box
                  height="100%"
                  width={`${renderProgress}%`}
                  bg="teal.400"
                  transition="width 0.3s"
                />
              </Box>
            </VStack>
          )}

          {statusMessage && (
            <Box p="3" borderRadius="lg" bg="blue.950" borderWidth="1px" borderColor="blue.700">
              <Text fontSize="xs" color="blue.200">
                {statusMessage}
              </Text>
            </Box>
          )}

          {/* Contrast Kinetic Subtitles Customizer */}
          <SubtitleCustomizerSection />

          {/* Speech & Audio Engine Details */}
          <VStack align="stretch" gap="2" pt="1">
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color="fg.muted"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Нейронний голос диктора (Edge-TTS 1.1x Jump-Cut):
            </Text>
            <Flex wrap="wrap" gap="1.5">
              {voices.map((v) => {
                const isSelected = selectedVoice === v.id;
                return (
                  <Button
                    key={v.id}
                    size="xs"
                    variant={isSelected ? 'solid' : 'outline'}
                    colorPalette={isSelected ? 'blue' : 'gray'}
                    onClick={() => setSelectedVoice(v.id as typeof selectedVoice)}
                  >
                    {v.name}
                  </Button>
                );
              })}
            </Flex>
          </VStack>

          {/* Rust Watchdog timeout */}
          <VStack align="stretch" gap="1.5" pt="1">
            <HStack justify="space-between">
              <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                Rust Watchdog таймаут рендерингу:
              </Text>
              <Badge colorPalette="yellow" size="xs" px="2" py="0.5" borderRadius="md">
                {renderTimeoutSec}с{' '}
                {renderTimeoutSec === 40 ? '(GPU)' : renderTimeoutSec === 120 ? '(CPU)' : ''}
              </Badge>
            </HStack>
            <HStack gap="1.5">
              {[30, 40, 60, 90, 120, 180].map((sec) => (
                <Button
                  key={sec}
                  size="2xs"
                  variant={renderTimeoutSec === sec ? 'solid' : 'outline'}
                  colorPalette={renderTimeoutSec === sec ? 'yellow' : 'gray'}
                  onClick={() => setRenderTimeout(sec)}
                >
                  {sec}с
                </Button>
              ))}
            </HStack>
          </VStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
