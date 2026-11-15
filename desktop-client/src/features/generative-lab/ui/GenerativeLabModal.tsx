import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  Image,
  Input,
  Portal,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import {
  Check,
  Copy,
  Film,
  Headphones,
  Image as ImageIcon,
  Mic,
  Radio,
  Sparkles,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useGenerativeLab } from '../model/use-generative-lab';

export const GenerativeLabModal: React.FC = () => {
  const {
    isOpen,
    closeModal,
    activeSlideIndex,
    setActiveSlideIndex,
    slides,
    currentSlide,
    artifactName,
    currentVeoPrompt,
    currentImagePrompt,
    currentAudioPrompt,
    currentNarratorText,
    copiedModality,
    copyPrompt,
    setManualMedia,
    handleFileUpload,
    removeMedia,
    runProxyGeneration,
    isGeneratingProxy,
    proxyStatusFeedback,
    proxyEndpoint,
    updateSlidePrompt,
  } = useGenerativeLab();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

  const currentMediaUrl = currentSlide?.customMediaUrl;
  const isVideo =
    currentSlide?.customMediaType === 'video' ||
    (currentMediaUrl ? /\.(mp4|webm|mov)$/i.test(currentMediaUrl) : false);

  const handleApplyUrl = () => {
    if (!manualUrlInput.trim()) return;
    const url = manualUrlInput.trim();
    const type = /\.(mp4|webm|mov)$/i.test(url) ? 'video' : 'image';
    setManualMedia(url, type);
    setManualUrlInput('');
  };

  return (
    <Portal>
      <Box
        position="fixed"
        inset="0"
        bg="rgba(4, 7, 15, 0.88)"
        backdropFilter="blur(8px)"
        zIndex="modal"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="4"
      >
        <Box
          bg="bg.panel"
          borderWidth="1px"
          borderColor="teal.500/40"
          borderRadius="2xl"
          boxShadow="0 25px 60px rgba(0,0,0,0.9)"
          width="100%"
          maxWidth="1050px"
          maxHeight="92vh"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {/* Header */}
          <Flex
            justify="space-between"
            align="center"
            px="6"
            py="4"
            borderBottomWidth="1px"
            borderColor="border.subtle"
            bg="bg.surface"
          >
            <HStack gap="3">
              <Box p="2" borderRadius="lg" bg="teal.950" color="teal.400">
                <Sparkles size={20} />
              </Box>
              <VStack align="flex-start" gap="0">
                <HStack gap="2">
                  <Heading size="sm" color="fg">
                    Лабораторія ШІ-Генерації та Інспекції Фрагментів
                  </Heading>
                  <Badge colorPalette="teal" variant="solid" size="xs">
                    DEV BYOK
                  </Badge>
                  <Badge colorPalette="purple" variant="subtle" size="xs">
                    Veo 3.1 • Nano Banana • Lyria
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="fg.muted">
                  Фокус на артефакті:{' '}
                  <Text as="span" color="teal.300" fontWeight="bold">
                    {artifactName}
                  </Text>{' '}
                  • Керування промптами та ручна інʼєкція відео/зображень
                </Text>
              </VStack>
            </HStack>

            <Button
              size="sm"
              variant="ghost"
              colorPalette="gray"
              onClick={closeModal}
              title="Закрити модалку (Esc)"
              aria-label="Закрити"
            >
              <X size={18} />
            </Button>
          </Flex>

          {/* Slide Segment Navigation */}
          <Box px="6" py="2.5" bg="bg.subtle" borderBottomWidth="1px" borderColor="border.subtle">
            <Flex gap="2" wrap="wrap" justify="space-between" align="center">
              <HStack gap="2">
                <Text fontSize="2xs" color="fg.muted" fontWeight="bold" textTransform="uppercase">
                  Сцена ролика:
                </Text>
                {slides.map((s, idx) => {
                  const isSelected = activeSlideIndex === idx;
                  const hasCustom = Boolean(s.customMediaUrl);
                  return (
                    <Button
                      key={s.id}
                      size="xs"
                      variant={isSelected ? 'solid' : 'outline'}
                      colorPalette={isSelected ? 'teal' : hasCustom ? 'purple' : 'gray'}
                      onClick={() => setActiveSlideIndex(idx)}
                    >
                      {idx + 1}. {s.type.replace('_', ' ')} ({s.durationSec}с)
                      {hasCustom && (
                        <Badge size="xs" colorPalette="yellow" ml="1">
                          ШІ
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </HStack>

              <HStack gap="1.5">
                <Radio size={12} color="#06b6d4" />
                <Text fontSize="2xs" color="cyan.300">
                  Проксі: {proxyEndpoint}
                </Text>
              </HStack>
            </Flex>
          </Box>

          {/* Body Content */}
          <Box p="6" overflowY="auto" flex="1">
            <SimpleGrid columns={{ base: 1, lg: 12 }} gap="6" alignItems="flex-start">
              {/* Left Column (Prompts for each Modality) */}
              <Box gridColumn={{ lg: 'span 7' }} display="flex" flexDirection="column" gap="4">
                {/* 1. Veo 3.1 Video Prompt */}
                <Card.Root bg="bg.surface" borderColor="border.subtle" p="4">
                  <VStack align="stretch" gap="2.5">
                    <Flex justify="space-between" align="center">
                      <HStack gap="2">
                        <Film size={16} color="#38bdf8" />
                        <Text fontWeight="semibold" fontSize="xs" color="fg">
                          🎬 Відео Промпт (Google Flow / Veo 3.1, 9:16)
                        </Text>
                      </HStack>
                      <HStack gap="1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          colorPalette={copiedModality === 'video' ? 'green' : 'cyan'}
                          onClick={() => copyPrompt('video', currentVeoPrompt)}
                          title="Скопіювати промпт для вставки у Google Flow або VideoFX"
                        >
                          {copiedModality === 'video' ? <Check size={12} /> : <Copy size={12} />}
                          {copiedModality === 'video' ? 'Скопійовано!' : 'Копіювати Veo'}
                        </Button>
                        <Button
                          size="xs"
                          variant="solid"
                          colorPalette="teal"
                          loading={isGeneratingProxy}
                          onClick={() => runProxyGeneration('video')}
                          title="Відправити запит до локального Antigravity/Flow проксі"
                        >
                          <Zap size={12} />
                          Proxy Veo
                        </Button>
                      </HStack>
                    </Flex>
                    <Textarea
                      size="sm"
                      rows={3}
                      value={currentVeoPrompt}
                      onChange={(e) => {
                        if (currentSlide) {
                          updateSlidePrompt(currentSlide.id, 'veoPrompt', e.target.value);
                        }
                      }}
                      fontSize="xs"
                      fontFamily="monospace"
                      bg="bg.panel"
                      borderColor="border.subtle"
                    />
                  </VStack>
                </Card.Root>

                {/* 2. Nano Banana / Imagen 3 Image Prompt */}
                <Card.Root bg="bg.surface" borderColor="border.subtle" p="4">
                  <VStack align="stretch" gap="2.5">
                    <Flex justify="space-between" align="center">
                      <HStack gap="2">
                        <ImageIcon size={16} color="#f59e0b" />
                        <Text fontWeight="semibold" fontSize="xs" color="fg">
                          🎨 Фото Промпт (Nano Banana 2 / Gemini Image, 8K)
                        </Text>
                      </HStack>
                      <HStack gap="1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          colorPalette={copiedModality === 'image' ? 'green' : 'yellow'}
                          onClick={() => copyPrompt('image', currentImagePrompt)}
                          title="Скопіювати промпт для Gemini або Nano Banana"
                        >
                          {copiedModality === 'image' ? <Check size={12} /> : <Copy size={12} />}
                          {copiedModality === 'image' ? 'Скопійовано!' : 'Копіювати Image'}
                        </Button>
                        <Button
                          size="xs"
                          variant="solid"
                          colorPalette="yellow"
                          loading={isGeneratingProxy}
                          onClick={() => runProxyGeneration('image')}
                          title="Згенерувати через /v1/images/generations локального проксі"
                        >
                          <Zap size={12} />
                          Proxy Image
                        </Button>
                      </HStack>
                    </Flex>
                    <Textarea
                      size="sm"
                      rows={3}
                      value={currentImagePrompt}
                      onChange={(e) => {
                        if (currentSlide) {
                          updateSlidePrompt(currentSlide.id, 'imagePrompt', e.target.value);
                        }
                      }}
                      fontSize="xs"
                      fontFamily="monospace"
                      bg="bg.panel"
                      borderColor="border.subtle"
                    />
                  </VStack>
                </Card.Root>

                {/* 3. Lyria Music / Soundtrack Prompt */}
                <Card.Root bg="bg.surface" borderColor="border.subtle" p="4">
                  <VStack align="stretch" gap="2.5">
                    <Flex justify="space-between" align="center">
                      <HStack gap="2">
                        <Headphones size={16} color="#a855f7" />
                        <Text fontWeight="semibold" fontSize="xs" color="fg">
                          🎵 Музичний Саундтрек (Lyria Audio Vibe)
                        </Text>
                      </HStack>
                      <Button
                        size="xs"
                        variant="outline"
                        colorPalette={copiedModality === 'audio' ? 'green' : 'purple'}
                        onClick={() => copyPrompt('audio', currentAudioPrompt)}
                      >
                        {copiedModality === 'audio' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedModality === 'audio' ? 'Скопійовано!' : 'Копіювати Lyria'}
                      </Button>
                    </Flex>
                    <Textarea
                      size="sm"
                      rows={2}
                      value={currentAudioPrompt}
                      onChange={(e) => {
                        if (currentSlide) {
                          updateSlidePrompt(currentSlide.id, 'audioPrompt', e.target.value);
                        }
                      }}
                      fontSize="xs"
                      fontFamily="monospace"
                      bg="bg.panel"
                      borderColor="border.subtle"
                    />
                  </VStack>
                </Card.Root>

                {/* 4. Narrator Speech Text */}
                <Card.Root bg="bg.surface" borderColor="border.subtle" p="4">
                  <VStack align="stretch" gap="2">
                    <Flex justify="space-between" align="center">
                      <HStack gap="2">
                        <Mic size={16} color="#10b981" />
                        <Text fontWeight="semibold" fontSize="xs" color="fg">
                          🎙️ Текст Диктора (Озвучка фрагмента)
                        </Text>
                      </HStack>
                      <Button
                        size="xs"
                        variant="outline"
                        colorPalette={copiedModality === 'voice' ? 'green' : 'teal'}
                        onClick={() => copyPrompt('voice', currentNarratorText)}
                      >
                        {copiedModality === 'voice' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedModality === 'voice' ? 'Скопійовано!' : 'Копіювати текст'}
                      </Button>
                    </Flex>
                    <Text
                      fontSize="xs"
                      color="fg"
                      bg="bg.panel"
                      p="2.5"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="border.subtle"
                    >
                      {currentNarratorText || '— Немає тексту —'}
                    </Text>
                  </VStack>
                </Card.Root>
              </Box>

              {/* Right Column (Asset Injector & Live Fragment Slot) */}
              <Box gridColumn={{ lg: 'span 5' }} display="flex" flexDirection="column" gap="4">
                {/* Active Slide Asset Preview */}
                <Card.Root bg="bg.surface" borderColor="border.subtle" p="4">
                  <VStack align="stretch" gap="3">
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="semibold" fontSize="xs" color="fg">
                        Поточний асет фрагмента #{activeSlideIndex + 1}:
                      </Text>
                      {currentMediaUrl ? (
                        <Badge colorPalette="green" variant="solid" size="xs">
                          {isVideo ? '🎬 Власне Відео' : '🎨 Власне Фото'}
                        </Badge>
                      ) : (
                        <Badge colorPalette="gray" variant="surface" size="xs">
                          📷 NASA Архів (Дефолт)
                        </Badge>
                      )}
                    </Flex>

                    {/* Media Preview Box */}
                    <Box
                      position="relative"
                      width="100%"
                      height="230px"
                      borderRadius="lg"
                      overflow="hidden"
                      bg="black"
                      borderWidth="1px"
                      borderColor="border.subtle"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {currentMediaUrl ? (
                        isVideo ? (
                          <video
                            src={currentMediaUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Image
                            src={currentMediaUrl}
                            alt="Custom Asset"
                            width="100%"
                            height="100%"
                            objectFit="cover"
                          />
                        )
                      ) : (
                        <VStack gap="1" p="4" textAlign="center">
                          <ImageIcon size={32} color="#64748b" />
                          <Text fontSize="xs" color="fg.muted">
                            Власний асет ще не призначено.
                          </Text>
                          <Text fontSize="2xs" color="fg.muted">
                            У плеєрі транслюватиметься архівне фото NASA з Pillow-Box.
                          </Text>
                        </VStack>
                      )}
                    </Box>

                    {currentMediaUrl && (
                      <Button
                        size="xs"
                        variant="outline"
                        colorPalette="red"
                        onClick={removeMedia}
                        width="100%"
                      >
                        <Trash2 size={12} />
                        Скинути на стандартний NASA архів
                      </Button>
                    )}
                  </VStack>
                </Card.Root>

                {/* Drag & Drop and URL Injector */}
                <Card.Root bg="bg.surface" borderColor="border.subtle" p="4">
                  <VStack align="stretch" gap="3">
                    <Text fontWeight="semibold" fontSize="xs" color="fg">
                      Вставити згенероване відео або фото:
                    </Text>

                    {/* Drag & Drop Zone */}
                    <Box
                      borderWidth="2px"
                      borderStyle="dashed"
                      borderColor={isDragging ? 'teal.400' : 'border.subtle'}
                      bg={isDragging ? 'teal.950/40' : 'bg.subtle'}
                      borderRadius="lg"
                      p="4"
                      textAlign="center"
                      cursor="pointer"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (file) handleFileUpload(file);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <VStack gap="1">
                        <Upload size={22} color="var(--chakra-colors-teal-400)" />
                        <Text fontSize="xs" fontWeight="medium" color="fg">
                          Перетягніть файл сюди або натисніть
                        </Text>
                        <Text fontSize="2xs" color="fg.muted">
                          Підтримуються: .mp4, .webm, .png, .jpg (до 100 МБ)
                        </Text>
                      </VStack>
                    </Box>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />

                    {/* Manual URL Input */}
                    <VStack align="stretch" gap="1.5">
                      <Text fontSize="2xs" color="fg.muted">
                        Або вставте пряме посилання (URL) на відео/зображення:
                      </Text>
                      <HStack gap="2">
                        <Input
                          size="xs"
                          placeholder="https://... або /local/path/video.mp4"
                          value={manualUrlInput}
                          onChange={(e) => setManualUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleApplyUrl();
                          }}
                        />
                        <Button size="xs" colorPalette="teal" onClick={handleApplyUrl}>
                          Застосувати
                        </Button>
                      </HStack>
                    </VStack>

                    {proxyStatusFeedback && (
                      <Box
                        p="2.5"
                        borderRadius="md"
                        bg="teal.950"
                        borderWidth="1px"
                        borderColor="teal.700"
                      >
                        <Text fontSize="xs" color="teal.200">
                          {proxyStatusFeedback}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Card.Root>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Footer */}
          <Flex
            justify="space-between"
            align="center"
            px="6"
            py="3.5"
            borderTopWidth="1px"
            borderColor="border.subtle"
            bg="bg.surface"
          >
            <Text fontSize="2xs" color="fg.muted">
              💡 Порада: Скопіюйте Veo/Image промпт → згенеруйте у браузері безкоштовно за кредитами
              Google AI Pro → перетягніть готовий ролик сюди!
            </Text>
            <Button size="sm" colorPalette="teal" onClick={closeModal}>
              Готово
            </Button>
          </Flex>
        </Box>
      </Box>
    </Portal>
  );
};
