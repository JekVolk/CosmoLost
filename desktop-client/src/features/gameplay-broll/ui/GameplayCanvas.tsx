import { Badge, Box, Flex, HStack, Text } from '@chakra-ui/react';
import type React from 'react';
import { ASPECT_RATIO_PRESETS } from '../model/constants';
import type { GameplaySimulationConfig, TelemetryMetrics } from '../model/types';

interface GameplayCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  config: GameplaySimulationConfig;
  telemetry: TelemetryMetrics;
  isRecording: boolean;
  recordedSeconds: number;
  targetSeconds: number | null;
  onJump?: () => void;
}

export const GameplayCanvas: React.FC<GameplayCanvasProps> = ({
  canvasRef,
  config,
  telemetry,
  isRecording,
  recordedSeconds,
  targetSeconds,
  onJump,
}) => {
  const aspectConfig = ASPECT_RATIO_PRESETS[config.aspectRatio];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      onJump?.();
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="black"
      borderRadius="xl"
      overflow="hidden"
      borderWidth="1px"
      borderColor="border.subtle"
      boxShadow="2xl"
      maxH="640px"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => onJump?.()}
      cursor="pointer"
      title="Натисніть ПРОБІЛ або клікніть для ручного стрибка"
    >
      {/* 60 FPS Canvas Element */}
      <Box
        as="canvas"
        ref={canvasRef}
        style={{
          aspectRatio: aspectConfig.cssAspect,
          maxHeight: '620px',
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />

      {/* Top Recording Indicator Overlay */}
      {isRecording && (
        <Flex
          position="absolute"
          top="4"
          left="4"
          bg="rgba(185, 28, 28, 0.9)"
          px="3"
          py="1"
          borderRadius="full"
          align="center"
          gap="2"
          boxShadow="lg"
        >
          <Box
            width="10px"
            height="10px"
            borderRadius="full"
            bg="white"
            animation="pulse 1.2s infinite ease-in-out"
          />
          <Text fontSize="xs" fontWeight="bold" color="white" fontFamily="mono">
            REC {formatTime(recordedSeconds)}
            {targetSeconds ? ` / ${formatTime(targetSeconds)}` : ''}
          </Text>
        </Flex>
      )}

      {/* Top Right Live Badges */}
      <HStack position="absolute" top="4" right="4" gap="2">
        {config.autoPilot && (
          <Badge colorPalette="green" variant="solid" size="sm" px="2.5" py="0.5" borderRadius="md">
            🤖 AI Автопілот
          </Badge>
        )}
        <Badge colorPalette="blue" variant="subtle" size="sm" px="2.5" py="0.5" borderRadius="md">
          {aspectConfig.label.split(' ')[0]}
        </Badge>
        <Badge colorPalette="purple" variant="solid" size="sm" px="2.5" py="0.5" borderRadius="md">
          60 FPS
        </Badge>
      </HStack>

      {/* Bottom Hint Banner */}
      <Flex
        position="absolute"
        bottom="3"
        left="4"
        right="4"
        justify="space-between"
        align="center"
        bg="rgba(15, 23, 42, 0.75)"
        backdropFilter="blur(4px)"
        px="3"
        py="1.5"
        borderRadius="md"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
      >
        <Text fontSize="2xs" color="fg.muted">
          💡 {config.autoPilot ? 'AI грає автоматично' : 'Ручне керування: Клік або ПРОБІЛ'}
        </Text>
        <HStack gap="3">
          <Text fontSize="2xs" color="teal.300" fontFamily="mono">
            {telemetry.environmentName}
          </Text>
          <Text fontSize="2xs" color="yellow.300" fontFamily="mono">
            ⭐ {telemetry.score} PTS
          </Text>
        </HStack>
      </Flex>
    </Box>
  );
};
