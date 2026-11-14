import { Badge, Box, Button, Card, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useMediaEngine } from '../model/use-media-engine';

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
          <Badge colorPalette="blue" variant="subtle">
            60 FPS • 1080x1920
          </Badge>
        </Flex>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap="4">
          <VStack align="stretch" gap="2">
            <Text fontSize="sm" fontWeight="medium" color="fg">
              Нейронний голос диктора (Edge-TTS з автоприскоренням 1.1x та Jump-Cut):
            </Text>
            <Flex wrap="wrap" gap="2">
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

          <VStack align="stretch" gap="2">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium" color="fg">
                Rust Watchdog таймаут рендерингу (для слабких GPU/CPU):
              </Text>
              <Badge colorPalette="yellow" size="sm">
                {renderTimeoutSec} секунд
              </Badge>
            </HStack>
            <HStack gap="2">
              {[30, 40, 60, 90, 120, 180].map((sec) => (
                <Button
                  key={sec}
                  size="xs"
                  variant={renderTimeoutSec === sec ? 'solid' : 'outline'}
                  colorPalette={renderTimeoutSec === sec ? 'yellow' : 'gray'}
                  onClick={() => setRenderTimeout(sec)}
                >
                  {sec}с {sec === 40 ? '(GPU)' : sec === 120 ? '(CPU)' : ''}
                </Button>
              ))}
            </HStack>
            <Text fontSize="xs" color="fg.muted">
              Запобігає передчасному вбиванню рендерингу під час обробки важких фільтрів Pillow-box
              та Кена Бернса.
            </Text>
          </VStack>

          <HStack gap="3" pt="2">
            <Button colorPalette="blue" loading={isSynthesizing} onClick={synthesizeAudio}>
              Синтезувати Озвучку (Jump-Cut)
            </Button>

            <Button colorPalette="teal" loading={isRendering} onClick={renderFfmpegVideo}>
              Змонтувати ролик FFmpeg (1080x1920)
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
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
