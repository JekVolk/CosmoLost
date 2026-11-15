import {
  DEFAULT_SUBTITLE_STYLE,
  type SubtitlePresetName,
  usePublicationStore,
} from '@/entities/publication';
import { Badge, Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { CaseUpper, Sparkles, Type } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { SUBTITLE_PRESETS, chunkSentence, tokenizeChunk } from '../model/subtitle-styler';

const SAMPLE_PHRASE =
  'WHY DID PERSEVERANCE STOP TRANSMITTING TELEMETRY ON SOL 1042? DISCOVER THE SECRET';

export const SubtitleCustomizerSection: React.FC = () => {
  const currentProject = usePublicationStore((s) => s.currentProject);
  const updateSubtitleStyle = usePublicationStore((s) => s.updateSubtitleStyle);

  const style = currentProject?.subtitleStyle || DEFAULT_SUBTITLE_STYLE;
  const [activeChunkIdx, setActiveChunkIdx] = useState(0);

  const chunks = chunkSentence(SAMPLE_PHRASE, style.wordsPerChunk);
  const currentChunk = chunks[activeChunkIdx % chunks.length] || chunks[0];
  const tokenizedWords = tokenizeChunk(currentChunk || '', style);

  const applyPreset = (presetKey: SubtitlePresetName) => {
    const p = SUBTITLE_PRESETS[presetKey];
    updateSubtitleStyle({
      preset: p.id,
      textColor: p.textColor,
      highlightColor: p.highlightColor,
      strokeColor: p.strokeColor,
      strokeWidth: p.strokeWidth,
      isUppercase: p.isUppercase,
      highlightKeywords: p.highlightKeywords,
      wordsPerChunk: p.wordsPerChunk,
    });
  };

  const strokeShadow = `-${style.strokeWidth}px -${style.strokeWidth}px 0 ${style.strokeColor},
    ${style.strokeWidth}px -${style.strokeWidth}px 0 ${style.strokeColor},
    -${style.strokeWidth}px ${style.strokeWidth}px 0 ${style.strokeColor},
    ${style.strokeWidth}px ${style.strokeWidth}px 0 ${style.strokeColor},
    0 4px 10px rgba(0,0,0,0.85)`;

  return (
    <Box p="4" borderRadius="xl" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle">
      <VStack align="stretch" gap="3.5">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="2">
          <HStack gap="2">
            <Type size={16} color="#facc15" />
            <Text fontSize="sm" fontWeight="semibold" color="fg">
              Контрастні Субтитри (Kinetic Karaoke & High-Contrast)
            </Text>
          </HStack>
          <Badge
            colorPalette="yellow"
            variant="solid"
            size="xs"
            px="2.5"
            py="0.5"
            borderRadius="md"
          >
            {style.preset.replace('_', ' ')}
          </Badge>
        </Flex>

        {/* Presets Row */}
        <VStack align="stretch" gap="1.5">
          <Text fontSize="2xs" color="fg.muted">
            Стильові пресети максимального контрасту:
          </Text>
          <Flex wrap="wrap" gap="2">
            {(Object.keys(SUBTITLE_PRESETS) as SubtitlePresetName[]).map((presetId) => {
              const p = SUBTITLE_PRESETS[presetId];
              const isSelected = style.preset === presetId;
              return (
                <Button
                  key={presetId}
                  size="xs"
                  variant={isSelected ? 'solid' : 'outline'}
                  colorPalette={isSelected ? 'yellow' : 'gray'}
                  onClick={() => applyPreset(presetId)}
                >
                  <Box w="8px" h="8px" borderRadius="full" bg={p.highlightColor} />
                  {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
                </Button>
              );
            })}
          </Flex>
        </VStack>

        {/* Options Toggles: Uppercase & Keywords */}
        <HStack justify="space-between" align="center" wrap="wrap" gap="2">
          <HStack gap="2">
            <Button
              size="xs"
              variant={style.isUppercase ? 'solid' : 'subtle'}
              colorPalette={style.isUppercase ? 'purple' : 'gray'}
              onClick={() => updateSubtitleStyle({ isUppercase: !style.isUppercase })}
            >
              <CaseUpper size={14} />
              {style.isUppercase ? 'CAPS: УВІМК' : 'CAPS: ВИМК'}
            </Button>

            <Button
              size="xs"
              variant={style.highlightKeywords ? 'solid' : 'subtle'}
              colorPalette={style.highlightKeywords ? 'yellow' : 'gray'}
              onClick={() => updateSubtitleStyle({ highlightKeywords: !style.highlightKeywords })}
            >
              <Sparkles size={13} />
              {style.highlightKeywords ? 'Виділення ключових слів: ТАК' : 'Виділення: НІ'}
            </Button>
          </HStack>

          <HStack gap="1.5">
            <Text fontSize="2xs" color="fg.muted">
              Слів на чанк:
            </Text>
            {[2, 3, 4].map((count) => (
              <Button
                key={count}
                size="xs"
                variant={style.wordsPerChunk === count ? 'solid' : 'subtle'}
                colorPalette={style.wordsPerChunk === count ? 'teal' : 'gray'}
                onClick={() => updateSubtitleStyle({ wordsPerChunk: count })}
              >
                {count}
              </Button>
            ))}
          </HStack>
        </HStack>

        {/* Live Kinetic Contrast Subtitle Preview */}
        <Box
          p="5"
          borderRadius="lg"
          bg="radial-gradient(ellipse at center, #1e1b4b 0%, #030712 100%)"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          textAlign="center"
          cursor="pointer"
          onClick={() => setActiveChunkIdx((prev) => (prev + 1) % chunks.length)}
          title="Клікніть для зміни чанку прев'ю"
        >
          <VStack gap="1.5">
            <Flex justify="center" align="center" wrap="wrap" gap="2.5">
              {tokenizedWords.map((word, idx) => (
                <Text
                  key={`${word.text}-${idx}`}
                  as="span"
                  fontSize="xl"
                  fontWeight="black"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.04em"
                  color={word.isKeyword ? style.highlightColor : style.textColor}
                  style={{
                    textShadow: strokeShadow,
                    transform: word.isKeyword ? 'scale(1.08)' : 'none',
                    display: 'inline-block',
                    transition: 'transform 0.15s ease-in-out',
                  }}
                >
                  {word.text}
                </Text>
              ))}
            </Flex>

            <HStack justify="space-between" width="100%" pt="2">
              <Text fontSize="2xs" color="whiteAlpha.500">
                Чанк {activeChunkIdx + 1} з {chunks.length} (Клікніть для гортання)
              </Text>
              <Badge
                colorPalette="green"
                size="xs"
                variant="subtle"
                px="2.5"
                py="0.5"
                borderRadius="md"
              >
                Safe-Zone Aware (220px/420px)
              </Badge>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};
