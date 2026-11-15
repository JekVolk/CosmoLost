import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Portal,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Download, Mic, MicOff, RefreshCw, Sparkles, X } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useActiveCharacter, usePngTuberEditorStore } from '../model/use-pngtuber-editor-store';
import { CharacterPresetSelector } from './CharacterPresetSelector';
import { CreateCustomAvatarModal } from './CreateCustomAvatarModal';
import { SpriteCard } from './SpriteCard';

export const PngTuberAvatarEditorModal: React.FC = () => {
  const {
    isOpen,
    closeModal,
    selectedCharacterId,
    selectCharacter,
    selectedEmotion,
    selectEmotion,
    sprites,
    kinematics,
    isMicTestActive,
    simulatedRmsDb,
    setRmsThresholdDb,
    toggleMicTest,
    setSimulatedRmsDb,
    updateSpriteUpload,
    resetToDefaults,
  } = usePngTuberEditorStore();

  const activeCharacter = useActiveCharacter();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const closedSprites = sprites.filter((s) => s.phase === 'CLOSED');
  const openSprites = sprites.filter((s) => s.phase === 'OPEN');
  const primaryColor = activeCharacter.palette[0] || 'var(--chakra-colors-cyan-400)';

  return (
    <Portal>
      <Box
        position="fixed"
        inset="0"
        bg="blackAlpha.800"
        backdropFilter="blur(12px)"
        zIndex="1500"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="4"
        overflowY="auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <Box
          aria-modal="true"
          aria-labelledby="pngtuber-editor-title"
          bg="bg.panel"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="border.default"
          width="100%"
          maxWidth="1120px"
          maxHeight="92vh"
          overflowY="auto"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.7)"
          display="flex"
          flexDirection="column"
        >
          {/* Header */}
          <Box
            p="5"
            borderBottomWidth="1px"
            borderColor="border.subtle"
            bg="bg.surface"
            position="sticky"
            top="0"
            zIndex="10"
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="3">
              <VStack align="flex-start" gap="1">
                <HStack gap="2">
                  <Badge
                    size="xs"
                    colorPalette="cyan"
                    variant="solid"
                    px="2"
                    py="0.5"
                    borderRadius="md"
                  >
                    PNGTUBER ENGINE V2
                  </Badge>
                  <Text fontSize="3xs" color="fg.muted" letterSpacing="wider">
                    8-SPRITE DUAL-PHASE EXPRESSION MATRIX
                  </Text>
                </HStack>
                <Heading id="pngtuber-editor-title" size="md" color="fg">
                  Cosmo PNGTuber Avatar Studio & Sprite Matrix
                </Heading>
                <Text fontSize="xs" color="fg.muted">
                  Чотири емоції (Idle, Expert, Shock, Hype) з каліброваними фазами закритого та
                  відкритого рота для ліпсингу.
                </Text>
              </VStack>

              <HStack gap="2">
                <Button
                  size="xs"
                  variant="outline"
                  colorPalette="gray"
                  onClick={resetToDefaults}
                  title="Скинути налаштування аватара"
                  aria-label="Скинути налаштування"
                >
                  <RefreshCw size={13} />
                  Скинути
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="gray"
                  onClick={closeModal}
                  title="Закрити модалку"
                  aria-label="Закрити модалку"
                >
                  <X size={16} />
                </Button>
              </HStack>
            </Flex>
          </Box>

          {/* Modal Body */}
          <Box p="6" display="flex" flexDirection="column" gap="6">
            {/* Section 1: Character Talents Roster */}
            <Box>
              <HStack justify="space-between" align="center" mb="2.5">
                <HStack gap="2">
                  <Sparkles size={16} color={primaryColor} />
                  <Text fontWeight="bold" fontSize="sm" color="fg">
                    1. Вибір персонажа-директора (Талант CosmoLost):
                  </Text>
                </HStack>
                <Badge size="xs" variant="surface" colorPalette="teal">
                  Поточний: {activeCharacter.name}
                </Badge>
              </HStack>
              <CharacterPresetSelector
                selectedId={selectedCharacterId}
                onSelect={selectCharacter}
              />
            </Box>

            {/* Section 2: 8-Sprite Matrix (Row 1: Closed Mouth, Row 2: Open Mouth) */}
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="fg" mb="2">
                2. Матриця спрайтів: Фаза закритого рота (Спокій / Пауза / Амплитуда &lt;{' '}
                {kinematics.rmsThresholdDb} dB)
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="3" mb="4">
                {closedSprites.map((sprite) => (
                  <SpriteCard
                    key={sprite.id}
                    sprite={sprite}
                    character={activeCharacter}
                    isActive={selectedEmotion === sprite.emotion}
                    onSelect={() => selectEmotion(sprite.emotion)}
                    onUpload={(url) => updateSpriteUpload(sprite.id, url)}
                  />
                ))}
              </SimpleGrid>

              <Text fontWeight="bold" fontSize="sm" color="fg" mb="2">
                3. Матриця спрайтів: Фаза відкритого рота (Говоріння / Голос / Амплитуда &gt;={' '}
                {kinematics.rmsThresholdDb} dB)
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="3">
                {openSprites.map((sprite) => (
                  <SpriteCard
                    key={sprite.id}
                    sprite={sprite}
                    character={activeCharacter}
                    isActive={selectedEmotion === sprite.emotion}
                    onSelect={() => selectEmotion(sprite.emotion)}
                    onUpload={(url) => updateSpriteUpload(sprite.id, url)}
                  />
                ))}
              </SimpleGrid>
            </Box>

            {/* Section 3: Audio RMS Calibration & Lip-Sync Threshold */}
            <Box
              bg="bg.surface"
              p="4"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap="2" mb="3">
                <HStack gap="2">
                  <Mic size={16} color={primaryColor} />
                  <Text fontWeight="bold" fontSize="sm" color="fg">
                    4. Поріг чутливості RMS для відкривання рота (Vocal Gate):
                  </Text>
                </HStack>
                <HStack gap="2">
                  <Badge colorPalette="purple" size="xs" variant="solid">
                    Поріг: {kinematics.rmsThresholdDb} dB
                  </Badge>
                  <Badge colorPalette="cyan" size="xs" variant="subtle">
                    Нормалізований: {kinematics.rmsThresholdNormalized} RMS
                  </Badge>
                </HStack>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                {/* Threshold Slider */}
                <VStack align="stretch" gap="1.5">
                  <HStack justify="space-between">
                    <Text fontSize="2xs" color="fg.muted">
                      Регулювання порогу (від -40 dB тихий шепіт до -10 dB гучний голос):
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color="fg">
                      {kinematics.rmsThresholdDb} dB
                    </Text>
                  </HStack>
                  <input
                    type="range"
                    min="-40"
                    max="-10"
                    step="1"
                    value={kinematics.rmsThresholdDb}
                    onChange={(e) => setRmsThresholdDb(Number(e.target.value))}
                    style={{ width: '100%', accentColor: primaryColor }}
                    aria-label="Поріг чутливості RMS для відкривання рота"
                    title={`Поріг: ${kinematics.rmsThresholdDb} dB`}
                  />
                  <HStack justify="space-between" fontSize="3xs" color="fg.muted">
                    <span>-40 dB (Чутливий)</span>
                    <span>-22 dB (Рекомендований)</span>
                    <span>-10 dB (Строгий)</span>
                  </HStack>
                </VStack>

                {/* Live Mic Test */}
                <VStack align="stretch" gap="1.5">
                  <HStack justify="space-between">
                    <Text fontSize="2xs" color="fg.muted">
                      Симуляція сигналу мікрофона / мовлення:
                    </Text>
                    <Badge
                      size="xs"
                      colorPalette={simulatedRmsDb >= kinematics.rmsThresholdDb ? 'green' : 'gray'}
                    >
                      {simulatedRmsDb >= kinematics.rmsThresholdDb
                        ? 'РОТ ВІДКРИТИЙ 🗣️'
                        : 'РОТ ЗАКРИТИЙ 🤐'}
                    </Badge>
                  </HStack>
                  <HStack gap="2">
                    <Button
                      size="xs"
                      variant={isMicTestActive ? 'solid' : 'outline'}
                      colorPalette={isMicTestActive ? 'green' : 'gray'}
                      onClick={toggleMicTest}
                      title={
                        isMicTestActive
                          ? 'Вимкнути тест мікрофона'
                          : 'Увімкнути симуляцію мікрофона'
                      }
                      aria-label={
                        isMicTestActive
                          ? 'Вимкнути тест мікрофона'
                          : 'Увімкнути симуляцію мікрофона'
                      }
                    >
                      {isMicTestActive ? <Mic size={13} /> : <MicOff size={13} />}
                      {isMicTestActive ? 'Тест активний (-18 dB)' : 'Увімкнути тест'}
                    </Button>
                    <input
                      type="range"
                      min="-60"
                      max="0"
                      step="1"
                      value={simulatedRmsDb}
                      onChange={(e) => setSimulatedRmsDb(Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--chakra-colors-green-500)' }}
                      aria-label="Симуляція рівня гучності мовлення"
                      title={`Симуляція гучності: ${simulatedRmsDb} dB`}
                    />
                    <Text fontSize="2xs" fontFamily="monospace" width="45px" textAlign="right">
                      {simulatedRmsDb} dB
                    </Text>
                  </HStack>
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Section 4: Kinematics & Staging Settings */}
            <Box
              bg="bg.surface"
              p="4"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Text fontWeight="bold" fontSize="sm" color="fg" mb="2">
                5. Кінематика позиціонування аватара на 9:16 екрані:
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="3">
                <Box
                  p="2.5"
                  borderRadius="md"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Text fontSize="2xs" fontWeight="bold" color="fg">
                    Хук-позиція (0–3.5 сек):
                  </Text>
                  <Text fontSize="3xs" color="fg.muted" mt="1">
                    По центру екрана (Y = 1500px, X = Center, масштаб 1.2x). Максимальне залучення
                    уваги глядача під час хука.
                  </Text>
                </Box>
                <Box
                  p="2.5"
                  borderRadius="md"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Text fontSize="2xs" fontWeight="bold" color="fg">
                    Припаркована позиція (3.5+ сек):
                  </Text>
                  <Text fontSize="3xs" color="fg.muted" mt="1">
                    Лівий нижній кут (Y = 1700px, X = Left, масштаб 0.85x). Суворо над мертвою зоною
                    420px без перекриття кнопками.
                  </Text>
                </Box>
                <Box
                  p="2.5"
                  borderRadius="md"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Text fontSize="2xs" fontWeight="bold" color="fg">
                    Параметри згладжування:
                  </Text>
                  <Text fontSize="3xs" color="fg.muted" mt="1">
                    Attack Gate: 60мс • Release Gate: 120мс • Моргання: кожні 3.5с ± 0.8с для
                    реалістичної жвавості.
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Technical Guidelines Footer Info */}
            <Box
              p="3"
              borderRadius="lg"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap="2">
                <VStack align="flex-start" gap="0">
                  <Text fontSize="3xs" color="fg.muted">
                    Роздільність: 512 × 512 px (1:1 Alpha PNG) • Безпечні зони: Top 220px / Bottom
                    420px / Right 150px
                  </Text>
                  <Text fontSize="3xs" color="fg.muted">
                    Формат пакета: 8 файлів (cosmo_{'{idle,expert,shock,hype}_{closed,open}'}.png)
                  </Text>
                </VStack>
                <Badge size="xs" variant="surface" colorPalette="cyan">
                  Local-First In-Memory Caching
                </Badge>
              </Flex>
            </Box>
          </Box>

          {/* Modal Footer */}
          <Box
            p="4"
            borderTopWidth="1px"
            borderColor="border.subtle"
            bg="bg.surface"
            position="sticky"
            bottom="0"
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="3">
              <Button size="sm" variant="outline" colorPalette="gray" onClick={closeModal}>
                Скасувати
              </Button>
              <HStack gap="2">
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="teal"
                  onClick={() => {
                    const json = JSON.stringify(
                      { character: activeCharacter, kinematics },
                      null,
                      2,
                    );
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${activeCharacter.id}-pngtuber-pack.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download size={14} />
                  Експорт конфігурації
                </Button>
                <Button size="sm" variant="solid" colorPalette="teal" onClick={closeModal}>
                  Застосувати та зберегти
                </Button>
              </HStack>
            </Flex>
          </Box>
        </Box>
      </Box>
      <CreateCustomAvatarModal />
    </Portal>
  );
};
