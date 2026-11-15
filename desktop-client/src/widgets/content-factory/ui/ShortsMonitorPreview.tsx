import { useArtifactStore, useArtifactsQuery } from '@/entities/artifact';
import { type VideoScriptSlide, usePublicationStore } from '@/entities/publication';
import { useGenerativeLabStore } from '@/features/generative-lab';
import { useActiveCharacter, usePngTuberEditorStore } from '@/features/pngtuber-editor';
import { useSocialPublishing } from '@/features/social-publishing';
import { Badge, Box, Button, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react';
import {
  Check,
  Copy,
  FolderOpen,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sliders,
  Sparkles,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

export const ShortsMonitorPreview: React.FC = () => {
  const currentProject = usePublicationStore((s) => s.currentProject);
  const selectedArtifactId = useArtifactStore((s) => s.selectedArtifactId);
  const { data: artifacts = [] } = useArtifactsQuery();

  const selectedArtifact =
    artifacts.find((a) => a.id === selectedArtifactId) ||
    artifacts.find((a) => a.id === currentProject?.artifactId) ||
    artifacts[0];

  const activeCharacter = useActiveCharacter();
  const openAvatarEditor = usePngTuberEditorStore((s) => s.openModal);
  const openGenerativeLab = useGenerativeLabStore((s) => s.openModal);
  const selectedEmotion = usePngTuberEditorStore((s) => s.selectedEmotion);
  const selectEmotion = usePngTuberEditorStore((s) => s.selectEmotion);
  const sprites = usePngTuberEditorStore((s) => s.sprites);
  const { openLocalFolderDirectly } = useSocialPublishing();

  // Safe Zones & Platform
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [safeZonePlatform, setSafeZonePlatform] = useState<'tiktok' | 'youtube' | 'instagram'>(
    'youtube',
  );
  const [enablePillowBox, setEnablePillowBox] = useState(true);

  // Playback simulation
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTimeSec, setPlaybackTimeSec] = useState(0);
  const totalDuration = currentProject?.targetDurationSec || 40;

  // Clipboard copy feedbacks
  const [copiedSeo, setCopiedSeo] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [folderOpened, setFolderOpened] = useState(false);

  const slides: VideoScriptSlide[] = currentProject?.slides || [
    {
      id: 's1',
      slideIndex: 1,
      type: 'HOOK',
      durationSec: 3.5,
      narratorText: 'Цей марсохід розраховували на 90 днів, але він прожив 15 років...',
      visualPrompt: 'Mars dust storm sunset',
      pngtuberState: 'SHOCK',
    },
    {
      id: 's2',
      slideIndex: 2,
      type: 'B_ROLL_FACTS',
      durationSec: 14,
      narratorText: 'Він пройшов 45 кілометрів по Марсу, знайшовши докази давніх озер.',
      visualPrompt: 'Rover tracks in red dunes',
      pngtuberState: 'EXPERT',
    },
    {
      id: 's3',
      slideIndex: 3,
      type: 'DRAMA_PEAK',
      durationSec: 15.5,
      narratorText: 'Глобальна буря закрила сонце. Останні слова: Батарея розряджена, стає темно.',
      visualPrompt: 'Darkness covering Martian crater',
      pngtuberState: 'SHOCK',
    },
    {
      id: 's4',
      slideIndex: 4,
      type: 'SEAMLESS_LOOP_CTA',
      durationSec: 7,
      narratorText: 'Точне місце спочинку Opportunity вже на 3D-мапі CosmoLost. Досліди сам!',
      visualPrompt: '3D interactive planet map',
      pngtuberState: 'HYPE',
    },
  ];

  // Active slide calculation
  const currentSlideInfo = useMemo(() => {
    let accumulated = 0;
    for (const slide of slides) {
      if (playbackTimeSec >= accumulated && playbackTimeSec < accumulated + slide.durationSec) {
        return {
          slide,
          timeInSlide: playbackTimeSec - accumulated,
        };
      }
      accumulated += slide.durationSec;
    }
    const lastSlide = slides[slides.length - 1];
    return {
      slide: (lastSlide ?? slides[0]) as VideoScriptSlide,
      timeInSlide: 0,
    };
  }, [slides, playbackTimeSec]);

  // Derived current emotion
  const effectiveEmotion = selectedEmotion || currentSlideInfo.slide?.pngtuberState || 'IDLE';

  // Kinetic subtitle words
  const currentSubtitleWords = useMemo(() => {
    const text = currentSlideInfo.slide?.narratorText || 'CosmoLost NASA Documentary';
    const words = text.split(/\s+/).filter(Boolean);
    const progress = Math.min(
      1,
      currentSlideInfo.timeInSlide / (currentSlideInfo.slide?.durationSec || 3),
    );
    const activeIndex = Math.floor(progress * words.length);
    const start = Math.max(0, activeIndex - 1);
    const chunk = words.slice(start, start + 3).map((w, idx) => ({
      key: `sub-${start + idx}-${w}`,
      word: w,
    }));
    const currentWord = words[activeIndex] || words[0] || '';
    return { chunk, currentWord };
  }, [currentSlideInfo]);

  // Playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTimeSec((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalDuration]);

  // Lipsync mouth oscillation when playing
  const isMouthOpen = isPlaying && Math.sin(playbackTimeSec * 15) > 0.1;

  // Custom avatar sprite mapping (supports user uploaded custom avatars & individual sprites)
  const matchingSprite = sprites.find(
    (s) => s.emotion === effectiveEmotion && s.phase === (isMouthOpen ? 'OPEN' : 'CLOSED'),
  );
  const customSpriteUrl = matchingSprite?.customDataUrl || activeCharacter.avatarImageUrl;

  // Kinematic positioning: Hook (0-3.5s) is centered, Parked (3.5s+) is bottom-left
  const isHookPhase = playbackTimeSec <= 3.5;

  const handleCopySeo = async () => {
    const hook =
      currentProject?.seoCaption?.line1Hook || '55 years alone on the Sea of Tranquility.';
    const context =
      currentProject?.seoCaption?.line2Seo ||
      'Discover how humanity first lunar base still sits intact.';
    const cta = currentProject?.seoCaption?.line3Tags || 'Explore coordinates at cosmolost.space.';
    const tags = '#Apollo11 #MoonArtifact #SpaceHistory #NASA #CosmoLost';
    await navigator.clipboard.writeText(`${hook}\n\n${context}\n\n${cta}\n\n${tags}`);
    setCopiedSeo(true);
    setTimeout(() => setCopiedSeo(false), 2500);
  };

  const handleCopyPin = async () => {
    const pin =
      currentProject?.pinComment ||
      'What equipment should humanity retrieve first when we return to the Moon? 👇';
    await navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleOpenFolder = async () => {
    await openLocalFolderDirectly();
    setFolderOpened(true);
    setTimeout(() => setFolderOpened(false), 2500);
  };

  const imageUrl =
    selectedArtifact?.previewImageUrl ||
    'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg';

  return (
    <Box
      bg="bg.panel"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      p="4"
      display="flex"
      flexDirection="column"
      gap="3.5"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="2">
        <HStack gap="2">
          <Text fontWeight="bold" fontSize="xs" color="fg">
            Live 9:16 Shorts Монітор
          </Text>
          <Badge colorPalette="purple" size="xs" variant="surface">
            1080×1920
          </Badge>
        </HStack>

        <HStack gap="1.5">
          {/* Safe Zones Toggle */}
          <Button
            size="xs"
            variant={showSafeZones ? 'solid' : 'outline'}
            colorPalette={showSafeZones ? 'teal' : 'gray'}
            onClick={() => setShowSafeZones(!showSafeZones)}
            title="Перемкнути сітку безпечних зон"
          >
            <Shield size={11} />
            Safe Zones: {showSafeZones ? 'ON' : 'OFF'}
          </Button>

          {showSafeZones && (
            <HStack gap="1">
              {(['youtube', 'tiktok', 'instagram'] as const).map((plat) => (
                <Button
                  key={plat}
                  size="xs"
                  variant={safeZonePlatform === plat ? 'solid' : 'ghost'}
                  colorPalette={safeZonePlatform === plat ? 'cyan' : 'gray'}
                  onClick={() => setSafeZonePlatform(plat)}
                  title={`Сітка безпечних зон для ${plat === 'youtube' ? 'YouTube Shorts' : plat === 'tiktok' ? 'TikTok' : 'Instagram Reels'}`}
                >
                  {plat === 'youtube' ? 'Shorts' : plat === 'tiktok' ? 'TikTok' : 'Reels'}
                </Button>
              ))}
            </HStack>
          )}

          {/* Pillow-box toggle */}
          <Button
            size="xs"
            variant={enablePillowBox ? 'solid' : 'outline'}
            colorPalette={enablePillowBox ? 'cyan' : 'gray'}
            onClick={() => setEnablePillowBox(!enablePillowBox)}
            title="Ефект Pillow-Box (розмитий фон)"
          >
            Pillow-Box: {enablePillowBox ? 'ON' : 'OFF'}
          </Button>

          {/* AI Generative Lab Trigger */}
          <Button
            size="xs"
            variant="solid"
            colorPalette="purple"
            onClick={() => {
              const slideIdx = slides.findIndex((s) => s.id === currentSlideInfo.slide?.id);
              openGenerativeLab(slideIdx >= 0 ? slideIdx : 0);
            }}
            title="Відкрити ШІ-Лабораторію для промптів Veo, Nano Banana, Lyria та заміни фрагментів"
            aria-label="ШІ Лабораторія фрагментів"
          >
            <Sparkles size={11} />
            ШІ Лабораторія
          </Button>
        </HStack>
      </Flex>

      {/* 9:16 Smartphone Mockup Canvas */}
      <Box
        position="relative"
        width="100%"
        maxWidth="330px"
        height="586px"
        mx="auto"
        borderRadius="24px"
        borderWidth="6px"
        borderColor="gray.800"
        bg="gray.950"
        overflow="hidden"
        boxShadow="0 20px 40px rgba(0, 0, 0, 0.8)"
      >
        {/* Visual Layer: Custom AI Asset (Veo / Nano Banana) or NASA Archival Photo with Pillow-box Blur */}
        {currentSlideInfo.slide?.customMediaUrl ? (
          currentSlideInfo.slide.customMediaType === 'video' ||
          /\.(mp4|webm|mov)$/i.test(currentSlideInfo.slide.customMediaUrl) ? (
            <Box position="absolute" inset="0" overflow="hidden" bg="black">
              <video
                key={currentSlideInfo.slide.id}
                src={currentSlideInfo.slide.customMediaUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box position="absolute" top="14px" right="12px" zIndex="25">
                <Badge size="xs" colorPalette="cyan" variant="solid" px="2" py="0.5">
                  🎬 Veo 3.1
                </Badge>
              </Box>
            </Box>
          ) : (
            <Box position="absolute" inset="0" overflow="hidden" bg="black">
              <Image
                key={currentSlideInfo.slide.id}
                src={currentSlideInfo.slide.customMediaUrl}
                alt="Custom AI Asset"
                position="absolute"
                inset="0"
                width="100%"
                height="100%"
                objectFit="cover"
                style={{
                  transform: `scale(${1.03 + Math.sin(playbackTimeSec * 0.3) * 0.02})`,
                  transition: 'transform 0.2s ease-out',
                }}
              />
              <Box position="absolute" top="14px" right="12px" zIndex="25">
                <Badge size="xs" colorPalette="yellow" variant="solid" px="2" py="0.5">
                  🎨 Nano Banana
                </Badge>
              </Box>
            </Box>
          )
        ) : enablePillowBox ? (
          <Box position="absolute" inset="0" overflow="hidden">
            {/* Blurred Background from the same photo */}
            <Image
              src={imageUrl}
              alt="Blurred Background"
              position="absolute"
              inset="-20px"
              width="calc(100% + 40px)"
              height="calc(100% + 40px)"
              objectFit="cover"
              filter="blur(22px) brightness(0.4)"
              transform="scale(1.2)"
            />

            {/* Crisp Centered 4:3 Photo */}
            <Box
              position="absolute"
              top="16%"
              left="5%"
              right="5%"
              height="225px"
              borderRadius="md"
              overflow="hidden"
              boxShadow="0 10px 30px rgba(0,0,0,0.8)"
              borderWidth="1px"
              borderColor="rgba(255,255,255,0.15)"
            >
              <Image
                src={imageUrl}
                alt={selectedArtifact?.name || 'NASA Archival 4:3'}
                width="100%"
                height="100%"
                objectFit="contain"
                bg="gray.950"
                style={{
                  transform: `scale(${1.02 + Math.sin(playbackTimeSec * 0.25) * 0.03})`,
                  transition: 'transform 0.2s ease-out',
                }}
              />
              <Box
                position="absolute"
                bottom="2"
                left="2"
                bg="rgba(0,0,0,0.75)"
                px="1.5"
                py="0.5"
                borderRadius="sm"
              >
                <Text fontSize="3xs" color="gray.300">
                  📷 NASA Archival • 4:3 Original
                </Text>
              </Box>
            </Box>
          </Box>
        ) : (
          <Image
            src={imageUrl}
            alt={selectedArtifact?.name || 'NASA Archival Full'}
            position="absolute"
            inset="0"
            width="100%"
            height="100%"
            objectFit="cover"
          />
        )}

        {/* HUD Telemetry Overlay */}
        <Box
          position="absolute"
          top="14px"
          left="12px"
          bg="rgba(8, 15, 31, 0.85)"
          backdropFilter="blur(6px)"
          px="2"
          py="1"
          borderRadius="md"
          borderWidth="1px"
          borderColor="cyan.500/40"
          fontFamily="monospace"
          fontSize="3xs"
          color="cyan.300"
          zIndex="20"
        >
          <Text fontWeight="bold" lineClamp={1}>
            {selectedArtifact?.name || 'Apollo 11 LM Eagle'}
          </Text>
          <Text color="fg.muted">
            {selectedArtifact?.celestialBody.toUpperCase() || 'MOON'} • DSN 60 FPS
          </Text>
        </Box>

        {/* Word Magnet Banner during Hook (0-3.5s) */}
        {isHookPhase && (
          <Box
            position="absolute"
            top="14%"
            left="50%"
            transform="translateX(-50%)"
            zIndex="25"
            pointerEvents="none"
          >
            <Badge
              size="sm"
              colorPalette="yellow"
              variant="solid"
              px="3"
              py="1"
              fontSize="2xs"
              fontWeight="black"
              borderRadius="full"
              boxShadow="0 0 16px rgba(245, 158, 11, 0.9)"
            >
              {currentProject?.magnetWord || '⚡ ВІРУСНИЙ ХУК'}
            </Badge>
          </Box>
        )}

        {/* Kinetic Subtitles in Safe Zone */}
        <Box
          position="absolute"
          bottom="140px"
          left="16px"
          right="56px"
          textAlign="center"
          pointerEvents="none"
          zIndex="25"
        >
          <Text
            fontSize="xs"
            fontWeight="black"
            color="white"
            lineHeight="1.3"
            textTransform="uppercase"
            style={{
              textShadow:
                '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',
            }}
          >
            {currentSubtitleWords.chunk.map(({ key, word }) => {
              const isHighlight =
                word.toLowerCase().replace(/[^a-zа-яіїє0-9]/gi, '') ===
                currentSubtitleWords.currentWord.toLowerCase().replace(/[^a-zа-яіїє0-9]/gi, '');
              return (
                <span
                  key={key}
                  style={{
                    color: isHighlight ? 'var(--chakra-colors-yellow-400)' : 'white',
                    padding: '0 2px',
                    display: 'inline-block',
                    transform: isHighlight ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </Text>
        </Box>

        {/* Animated PNGTuber Avatar */}
        <Box
          position="absolute"
          transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          style={
            isHookPhase
              ? {
                  bottom: '180px',
                  left: '50%',
                  transform: 'translateX(-50%) scale(1.18)',
                  width: '90px',
                  height: '90px',
                }
              : {
                  bottom: '72px',
                  left: '12px',
                  transform: 'scale(1)',
                  width: '74px',
                  height: '74px',
                }
          }
          zIndex="30"
          pointerEvents="none"
        >
          {customSpriteUrl ? (
            <Box
              width="100%"
              height="100%"
              borderRadius="full"
              overflow="hidden"
              borderWidth="3px"
              borderColor={activeCharacter.palette[0] || 'var(--chakra-colors-cyan-400)'}
              bg="gray.950"
              boxShadow="0 4px 16px rgba(0,0,0,0.8)"
            >
              <Image
                src={customSpriteUrl}
                alt={activeCharacter.name}
                width="100%"
                height="100%"
                objectFit="cover"
              />
            </Box>
          ) : (
            <svg viewBox="0 0 100 100" width="100%" height="100%" role="img">
              <title>PNGTuber Avatar - {activeCharacter.name}</title>
              <circle
                cx="50"
                cy="50"
                r="44"
                fill={activeCharacter.palette[1] || 'var(--chakra-colors-gray-900)'}
                stroke={activeCharacter.palette[0] || 'var(--chakra-colors-cyan-400)'}
                strokeWidth="4"
              />
              <rect
                x="20"
                y="26"
                width="60"
                height="50"
                rx="14"
                fill="var(--chakra-colors-gray-950)"
                stroke={activeCharacter.palette[0] || 'var(--chakra-colors-cyan-400)'}
                strokeWidth="2.5"
              />

              {/* Face Emotion */}
              {effectiveEmotion === 'SHOCK' ? (
                <g>
                  <circle cx="36" cy="45" r="9" fill="#ffffff" />
                  <circle cx="64" cy="45" r="9" fill="#ffffff" />
                  <circle cx="36" cy="45" r="4" fill="#000000" />
                  <circle cx="64" cy="45" r="4" fill="#000000" />
                  <ellipse
                    cx="50"
                    cy="64"
                    rx="8"
                    ry={isMouthOpen ? 12 : 7}
                    fill="var(--chakra-colors-red-500)"
                  />
                </g>
              ) : effectiveEmotion === 'EXPERT' ? (
                <g>
                  <rect
                    x="26"
                    y="40"
                    width="48"
                    height="10"
                    rx="3"
                    fill="var(--chakra-colors-cyan-400)"
                    opacity="0.8"
                  />
                  <circle cx="38" cy="45" r="2.5" fill="#ffffff" />
                  <circle cx="62" cy="45" r="2.5" fill="#ffffff" />
                  <path
                    d={isMouthOpen ? 'M 40 60 Q 50 68 60 62 Z' : 'M 40 62 Q 52 64 60 59'}
                    stroke="#ffffff"
                    strokeWidth="3"
                    fill={isMouthOpen ? '#ffffff' : 'none'}
                  />
                </g>
              ) : effectiveEmotion === 'HYPE' ? (
                <g>
                  <text x="26" y="52" fontSize="16" fill="var(--chakra-colors-yellow-400)">
                    ★
                  </text>
                  <text x="54" y="52" fontSize="16" fill="var(--chakra-colors-yellow-400)">
                    ★
                  </text>
                  <path
                    d={isMouthOpen ? 'M 35 60 Q 50 74 65 60 Z' : 'M 36 60 Q 50 68 64 60'}
                    stroke="var(--chakra-colors-yellow-400)"
                    strokeWidth="4"
                    fill={isMouthOpen ? 'var(--chakra-colors-yellow-400)' : 'none'}
                  />
                </g>
              ) : (
                <g>
                  <circle cx="36" cy="46" r="4" fill="#ffffff" />
                  <circle cx="64" cy="46" r="4" fill="#ffffff" />
                  <path
                    d={isMouthOpen ? 'M 42 60 Q 50 66 58 60 Z' : 'M 42 61 Q 50 65 58 61'}
                    stroke="#ffffff"
                    strokeWidth="3"
                    fill={isMouthOpen ? '#ffffff' : 'none'}
                  />
                </g>
              )}
            </svg>
          )}
        </Box>

        {/* SAFE ZONES OVERLAY (220px TOP, 420px BOTTOM, 150px RIGHT) */}
        {showSafeZones && (
          <Box position="absolute" inset="0" pointerEvents="none" zIndex="40">
            {/* Top Dead Zone 220px (height = 220/1920 * 586 ≈ 67px) */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              height="67px"
              bg="rgba(239, 68, 68, 0.22)"
              borderBottomWidth="1px"
              borderBottomStyle="dashed"
              borderBottomColor="red.500"
              px="2"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Badge size="xs" colorPalette="red" variant="solid">
                TOP DEAD ZONE 220px ({safeZonePlatform.toUpperCase()})
              </Badge>
              <Text fontSize="3xs" color="red.200">
                Пошук / Назва аудіо
              </Text>
            </Box>

            {/* Right Dead Zone 150px (width = 150/1080 * 330 ≈ 46px) */}
            <Box
              position="absolute"
              top="67px"
              bottom="128px"
              right="0"
              width="46px"
              bg="rgba(245, 158, 11, 0.18)"
              borderLeftWidth="1px"
              borderLeftStyle="dashed"
              borderLeftColor="yellow.500"
              display="flex"
              flexDirection="column"
              justifyContent="flex-end"
              alignItems="center"
              pb="2"
              gap="1.5"
            >
              <Text fontSize="3xs" color="yellow.200">
                ❤️ 14K
              </Text>
              <Text fontSize="3xs" color="yellow.200">
                💬 482
              </Text>
              <Text fontSize="3xs" color="yellow.200">
                ↗️ 9.1K
              </Text>
              <Box
                width="18px"
                height="18px"
                borderRadius="full"
                bg="black"
                borderWidth="2px"
                borderColor="yellow.400"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="4xs">🎵</Text>
              </Box>
            </Box>

            {/* Bottom Dead Zone 420px (height = 420/1920 * 586 ≈ 128px) */}
            <Box
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              height="128px"
              bg="rgba(239, 68, 68, 0.22)"
              borderTopWidth="1px"
              borderTopStyle="dashed"
              borderTopColor="red.500"
              px="2"
              py="1.5"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <HStack justify="space-between" align="center">
                <HStack gap="1">
                  <Box w="12px" h="12px" borderRadius="full" bg="cyan.400" />
                  <Text fontSize="3xs" fontWeight="bold" color="white">
                    @cosmolost
                  </Text>
                </HStack>
                <Badge size="xs" colorPalette="red">
                  BOTTOM DEAD ZONE 420px
                </Badge>
              </HStack>

              <Text fontSize="3xs" color="gray.300" lineClamp={2}>
                {currentProject?.artifactName || 'Apollo 11 LM Eagle'}: Останні слова телеметрії у
                Морі Спокою...
              </Text>
              <Text fontSize="4xs" color="gray.400">
                🎵 Оригінальний звук • CosmoLost Synth
              </Text>
            </Box>

            {/* Central Safe Zone Guidance Outline */}
            <Box
              position="absolute"
              top="67px"
              bottom="128px"
              left="0"
              right="46px"
              borderWidth="1px"
              borderStyle="dotted"
              borderColor="green.400"
              display="flex"
              alignItems="flex-start"
              justifyContent="center"
              pt="1"
            >
              <Badge size="xs" colorPalette="green" variant="surface">
                🛡️ БЕЗПЕЧНА ЗОНА 9:16
              </Badge>
            </Box>
          </Box>
        )}
      </Box>

      {/* Expression Quick-Bar & Avatar Customization Trigger */}
      <Box p="4" borderRadius="lg" bg="bg.surface" borderWidth="1px" borderColor="border.subtle">
        <Flex justify="space-between" align="center" wrap="wrap" gap="3">
          <HStack gap="2">
            <Text fontSize="2xs" color="fg.muted">
              Емоція аватара:
            </Text>
            <HStack gap="1.5">
              {(['IDLE', 'EXPERT', 'SHOCK', 'HYPE'] as const).map((em) => (
                <Button
                  key={em}
                  size="sm"
                  variant={effectiveEmotion === em ? 'solid' : 'ghost'}
                  colorPalette={effectiveEmotion === em ? 'cyan' : 'gray'}
                  onClick={() => selectEmotion(em)}
                  title={`Обрати емоцію ${em}`}
                >
                  {em}
                </Button>
              ))}
            </HStack>
          </HStack>

          <Button
            size="sm"
            variant="outline"
            colorPalette="teal"
            onClick={openAvatarEditor}
            title="Відкрити редактор 8 спрайтів аватара"
            aria-label="Відкрити редактор 8 спрайтів аватара"
          >
            <Sliders size={11} />
            Редактор 8 спрайтів
          </Button>
        </Flex>
      </Box>

      {/* Scrubber & Playback Controls */}
      <Box p="4" borderRadius="lg" bg="bg.surface" borderWidth="1px" borderColor="border.subtle">
        <Flex justify="space-between" align="center" mb="3">
          <HStack gap="3">
            <Button
              size="sm"
              variant="solid"
              colorPalette={isPlaying ? 'yellow' : 'cyan'}
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Пауза' : 'Превʼю'}
              aria-label={isPlaying ? 'Пауза' : 'Превʼю'}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              {isPlaying ? 'Пауза' : 'Превʼю'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              colorPalette="gray"
              onClick={() => {
                setIsPlaying(false);
                setPlaybackTimeSec(0);
              }}
              title="Скинути таймкод"
              aria-label="Скинути таймкод"
            >
              <RotateCcw size={12} />
            </Button>
          </HStack>

          <Text fontSize="2xs" fontFamily="monospace" color="fg">
            {playbackTimeSec.toFixed(1)}s / {totalDuration}s
          </Text>
        </Flex>

        {/* Scrubber Bar */}
        <Box
          width="100%"
          height="10px"
          borderRadius="full"
          bg="bg.muted"
          position="relative"
          cursor="pointer"
          role="slider"
          aria-label="Відео скрабер"
          aria-valuemin={0}
          aria-valuemax={totalDuration}
          aria-valuenow={playbackTimeSec}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setPlaybackTimeSec((prev) => Math.max(0, Number((prev - 1).toFixed(1))));
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              setPlaybackTimeSec((prev) => Math.min(totalDuration, Number((prev + 1).toFixed(1))));
            } else if (e.key === 'Home') {
              e.preventDefault();
              setPlaybackTimeSec(0);
            } else if (e.key === 'End') {
              e.preventDefault();
              setPlaybackTimeSec(totalDuration);
            }
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setPlaybackTimeSec(Number((ratio * totalDuration).toFixed(1)));
          }}
        >
          <Box
            height="100%"
            width={`${(playbackTimeSec / totalDuration) * 100}%`}
            borderRadius="full"
            bg="cyan.500"
            transition="width 0.1s linear"
          />
        </Box>
      </Box>

      {/* Action Buttons Below Monitor */}
      <VStack align="stretch" gap="3">
        <HStack gap="3">
          <Button
            size="sm"
            variant="outline"
            colorPalette={copiedSeo ? 'green' : 'gray'}
            onClick={handleCopySeo}
            flex="1"
            title="Скопіювати SEO опис у буфер обміну"
            aria-label="Копіювати SEO опис"
          >
            {copiedSeo ? <Check size={12} /> : <Copy size={12} />}
            {copiedSeo ? 'Опис скопійовано!' : 'Копіювати SEO опис'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            colorPalette={copiedPin ? 'green' : 'gray'}
            onClick={handleCopyPin}
            flex="1"
            title="Скопіювати закріплений коментар у буфер обміну"
            aria-label="Копіювати Pin"
          >
            {copiedPin ? <Check size={12} /> : <Copy size={12} />}
            {copiedPin ? 'Pin скопійовано!' : 'Копіювати Pin'}
          </Button>
        </HStack>

        <Button
          size="sm"
          variant="solid"
          colorPalette={folderOpened ? 'green' : 'teal'}
          onClick={handleOpenFolder}
          width="100%"
          title="Відкрити папку з готовим відео у файловому менеджері"
          aria-label="Відкрити папку з готовим відео"
        >
          <FolderOpen size={13} />
          {folderOpened ? 'Папку відкрито в OS Explorer' : 'Відкрити папку з готовим відео'}
        </Button>
      </VStack>
    </Box>
  );
};
