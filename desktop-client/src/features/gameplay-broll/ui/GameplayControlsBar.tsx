import { Badge, Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { Bot, Clapperboard, Film, Square } from 'lucide-react';
import type React from 'react';
import { ASPECT_RATIO_PRESETS, AVATAR_OPTIONS, CELESTIAL_PRESETS } from '../model/constants';
import type {
  CelestialGameplayPreset,
  GameplayAspectRatio,
  GameplayAvatarType,
  GameplaySimulationConfig,
} from '../model/types';

interface GameplayControlsBarProps {
  config: GameplaySimulationConfig;
  onUpdateConfig: (patch: Partial<GameplaySimulationConfig>) => void;
  isRecording: boolean;
  recordedSeconds: number;
  onStartRecord: (durationSec?: number) => void;
  onStopRecord: () => void;
  recordDuration: number;
  onSelectRecordDuration: (durationSec: number) => void;
}

export const GameplayControlsBar: React.FC<GameplayControlsBarProps> = ({
  config,
  onUpdateConfig,
  isRecording,
  recordedSeconds,
  onStartRecord,
  onStopRecord,
  recordDuration,
  onSelectRecordDuration,
}) => {
  const currentPreset = CELESTIAL_PRESETS[config.preset];

  return (
    <VStack align="stretch" gap="4">
      {/* 1. Celestial World Presets */}
      <VStack align="stretch" gap="1.5">
        <HStack justify="space-between">
          <Text fontSize="xs" fontWeight="semibold" color="fg">
            1. Локація та Гравітація (NASA Presets):
          </Text>
          <Badge colorPalette="cyan" size="xs" px="2" py="0.5" borderRadius="md">
            {currentPreset.gravityDisplay} м/с²
          </Badge>
        </HStack>
        <Flex wrap="wrap" gap="2">
          {(Object.keys(CELESTIAL_PRESETS) as CelestialGameplayPreset[]).map((pKey) => {
            const p = CELESTIAL_PRESETS[pKey];
            const isSelected = config.preset === pKey;
            return (
              <Button
                key={pKey}
                size="xs"
                variant={isSelected ? 'solid' : 'outline'}
                colorPalette={isSelected ? 'cyan' : 'gray'}
                onClick={() => onUpdateConfig({ preset: pKey })}
              >
                {p.name.split(' ')[0]} {p.name.split(' ')[1]}
              </Button>
            );
          })}
        </Flex>
        <Text fontSize="2xs" color="fg.muted">
          {currentPreset.description}
        </Text>
      </VStack>

      {/* 2. Avatar Selection */}
      <VStack align="stretch" gap="1.5">
        <Text fontSize="xs" fontWeight="semibold" color="fg">
          2. Персонаж / Геймплейний Аватар:
        </Text>
        <Flex wrap="wrap" gap="2">
          {AVATAR_OPTIONS.map((opt) => {
            const isSelected = config.avatar === opt.id;
            return (
              <Button
                key={opt.id}
                size="xs"
                variant={isSelected ? 'solid' : 'outline'}
                colorPalette={isSelected ? 'purple' : 'gray'}
                onClick={() => onUpdateConfig({ avatar: opt.id as GameplayAvatarType })}
              >
                <span>{opt.icon}</span>
                {opt.label.split('(')[0]?.trim() || opt.label}
              </Button>
            );
          })}
        </Flex>
      </VStack>

      {/* 3. Aspect Ratio & Mode Options */}
      <HStack justify="space-between" align="center" wrap="wrap" gap="3">
        <VStack align="start" gap="1">
          <Text fontSize="xs" fontWeight="semibold" color="fg">
            Формат відео:
          </Text>
          <HStack gap="1.5">
            {(Object.keys(ASPECT_RATIO_PRESETS) as GameplayAspectRatio[]).map((ratio) => (
              <Button
                key={ratio}
                size="xs"
                variant={config.aspectRatio === ratio ? 'solid' : 'subtle'}
                colorPalette={config.aspectRatio === ratio ? 'blue' : 'gray'}
                onClick={() => onUpdateConfig({ aspectRatio: ratio })}
              >
                {ratio}
              </Button>
            ))}
          </HStack>
        </VStack>

        <VStack align="start" gap="1">
          <Text fontSize="xs" fontWeight="semibold" color="fg">
            Режим гри:
          </Text>
          <Button
            size="xs"
            variant={config.autoPilot ? 'solid' : 'outline'}
            colorPalette={config.autoPilot ? 'green' : 'gray'}
            onClick={() => onUpdateConfig({ autoPilot: !config.autoPilot })}
          >
            <Bot size={13} />
            {config.autoPilot ? 'AI Автопілот (Увімк)' : 'Ручне керування'}
          </Button>
        </VStack>
      </HStack>

      {/* 4. Recording Controller */}
      <Box p="3" bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
        <VStack align="stretch" gap="2.5">
          <HStack justify="space-between" align="center">
            <HStack gap="2">
              <Film size={15} color="#06b6d4" />
              <Text fontSize="xs" fontWeight="bold" color="fg">
                Запис B-Roll Відеокліпу (60 FPS)
              </Text>
            </HStack>
            {isRecording && (
              <Badge colorPalette="red" variant="solid" size="xs" px="2" py="0.5" borderRadius="md">
                Запис: {recordedSeconds}с / {recordDuration}с
              </Badge>
            )}
          </HStack>

          <HStack gap="2" align="center">
            <Text fontSize="2xs" color="fg.muted">
              Тривалість кліпу:
            </Text>
            {[5, 10, 15, 30].map((sec) => (
              <Button
                key={sec}
                size="xs"
                variant={recordDuration === sec ? 'solid' : 'subtle'}
                colorPalette={recordDuration === sec ? 'teal' : 'gray'}
                disabled={isRecording}
                onClick={() => onSelectRecordDuration(sec)}
              >
                {sec}с
              </Button>
            ))}
          </HStack>

          <HStack gap="2" pt="1">
            {!isRecording ? (
              <Button
                size="sm"
                colorPalette="red"
                variant="solid"
                width="100%"
                onClick={() => onStartRecord(recordDuration)}
              >
                <Clapperboard size={16} />
                Записати кліп ({recordDuration}с)
              </Button>
            ) : (
              <Button
                size="sm"
                colorPalette="red"
                variant="outline"
                width="100%"
                onClick={onStopRecord}
              >
                <Square size={16} />
                Зупинити запис зараз
              </Button>
            )}
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};
