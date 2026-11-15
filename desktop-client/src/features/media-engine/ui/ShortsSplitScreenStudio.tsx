import { useArtifactStore, useArtifactsQuery } from '@/entities/artifact';
import { type VideoScriptSlide, usePublicationStore } from '@/entities/publication';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  Film,
  Gamepad2,
  Headphones,
  Music,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type LayoutMode = 'SPLIT_50_50' | 'FULL_BROLL' | 'FULL_NASA';
export type AvatarEmotion = 'IDLE' | 'EXPERT' | 'SHOCK' | 'HYPE';
export type AvatarPresetId = 'violetta' | 'neil' | 'rover_bot';

const BGM_PRESETS = [
  { id: 'cosmic-synthwave', title: 'Cosmic Synthwave (120 BPM)', vibe: '⚡ Енергійний' },
  { id: 'deep-space-drone', title: 'Deep Space Drone (Dark Ambient)', vibe: '🌌 Загадковий' },
  { id: 'lofi-space', title: 'Solar Wind Lo-Fi Beats', vibe: '☕ Спокійний' },
  { id: 'apollo-radio', title: 'Apollo 11 Radio Static + Synth', vibe: '🎙️ Документальний' },
];

export function ShortsSplitScreenStudio() {
  const currentProject = usePublicationStore((s) => s.currentProject);
  const selectedArtifactId = useArtifactStore((s) => s.selectedArtifactId);
  const { data: artifacts = [] } = useArtifactsQuery();
  const selectedArtifact =
    artifacts.find((a) => a.id === selectedArtifactId) ||
    artifacts.find((a) => a.id === currentProject?.artifactId) ||
    artifacts[0];

  const [layoutMode, setLayoutMode] = useState<LayoutMode>('SPLIT_50_50');
  const [avatarPreset, setAvatarPreset] = useState<AvatarPresetId>('violetta');
  const [manualEmotion, setManualEmotion] = useState<AvatarEmotion | null>(null);
  const [selectedBgm, setSelectedBgm] = useState<string>('cosmic-synthwave');
  const [bgmVolumeDb, setBgmVolumeDb] = useState<number>(-24);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [safeZonePlatform, setSafeZonePlatform] = useState<'tiktok' | 'youtube' | 'instagram'>(
    'tiktok',
  );

  // Timeline & Playback simulation
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTimeSec, setPlaybackTimeSec] = useState(0);
  const totalDuration = currentProject?.targetDurationSec || 40;

  const slides: VideoScriptSlide[] = currentProject?.slides || [
    {
      id: 's1',
      slideIndex: 1,
      type: 'HOOK',
      durationSec: 3,
      narratorText: 'Цей марсохід розраховували на 90 днів, але він прожив 15 років...',
      visualPrompt: 'Mars dust storm sunset',
      pngtuberState: 'SHOCK',
    },
    {
      id: 's2',
      slideIndex: 2,
      type: 'B_ROLL_FACTS',
      durationSec: 15,
      narratorText: 'Він пройшов 45 кілометрів по Марсу, знайшовши докази давніх озер.',
      visualPrompt: 'Rover tracks in red dunes',
      pngtuberState: 'EXPERT',
    },
    {
      id: 's3',
      slideIndex: 3,
      type: 'DRAMA_PEAK',
      durationSec: 15,
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

  // Active slide calculation based on playbackTimeSec
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

  // Active emotion derived from slide or manual override
  const activeEmotion: AvatarEmotion =
    manualEmotion || currentSlideInfo.slide?.pngtuberState || 'IDLE';

  // Subtitle chunk derived from active slide text
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

  // Animation frame timer for playback
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

  // Audio-reactive mouth flutter simulation when playing
  const isMouthOpen = isPlaying && Math.sin(playbackTimeSec * 14) > 0.1;

  return (
    <Card.Root bg="bg.panel" borderColor="border.subtle" borderWidth="1px" borderRadius="xl">
      <Card.Header pb="2">
        <Flex justify="space-between" align="center" wrap="wrap" gap="2">
          <HStack gap="2">
            <Film size={20} color="#38bdf8" />
            <Heading size="md" color="fg">
              Студія Спліт-Екрану (Split-Screen) та Персонажі з Емоціями
            </Heading>
          </HStack>
          <HStack gap="2" wrap="wrap">
            <Badge
              colorPalette="purple"
              variant="solid"
              size="xs"
              px="2.5"
              py="0.5"
              borderRadius="md"
            >
              9:16 Shorts
            </Badge>
            <Badge
              colorPalette="pink"
              variant="subtle"
              size="xs"
              px="2.5"
              py="0.5"
              borderRadius="md"
            >
              PNGTuber Ліпсінк
            </Badge>
            <Badge
              colorPalette="teal"
              variant="subtle"
              size="xs"
              px="2.5"
              py="0.5"
              borderRadius="md"
            >
              B-Roll Retention &gt; 75%
            </Badge>
          </HStack>
        </Flex>
        <Text color="fg.muted" fontSize="sm" mt="1">
          Монтаж на два екрани (верх: наукові фото NASA • низ: динамічний 60 FPS B-Roll геймплей),
          анімований персонаж-ведучий з емоціями під хук та наукові тези, кінетичні субтитри та
          фонова музика.
        </Text>
      </Card.Header>

      <Card.Body pt="3">
        <VStack align="stretch" gap="5">
          {/* Main Studio Viewport (Controls on left, 9:16 Mockup on right) */}
          <Flex gap="6" direction={{ base: 'column', lg: 'row' }} align="flex-start">
            {/* Left Column: Interactive Controls */}
            <VStack align="stretch" gap="4" flex="1">
              {/* 1. Layout Mode Switcher */}
              <Box p="3" borderRadius="lg" bg="bg.subtle" borderWidth="1px">
                <Text fontSize="xs" fontWeight="bold" color="fg.muted" mb="2">
                  1. Режим кадру (Layout):
                </Text>
                <HStack gap="2" wrap="wrap">
                  <Button
                    size="xs"
                    variant={layoutMode === 'SPLIT_50_50' ? 'solid' : 'outline'}
                    colorPalette={layoutMode === 'SPLIT_50_50' ? 'teal' : 'gray'}
                    onClick={() => setLayoutMode('SPLIT_50_50')}
                  >
                    <Gamepad2 size={13} />
                    Спліт 50/50 (NASA + B-Roll)
                  </Button>
                  <Button
                    size="xs"
                    variant={layoutMode === 'FULL_BROLL' ? 'solid' : 'outline'}
                    colorPalette={layoutMode === 'FULL_BROLL' ? 'purple' : 'gray'}
                    onClick={() => setLayoutMode('FULL_BROLL')}
                  >
                    Повний B-Roll геймплей
                  </Button>
                  <Button
                    size="xs"
                    variant={layoutMode === 'FULL_NASA' ? 'solid' : 'outline'}
                    colorPalette={layoutMode === 'FULL_NASA' ? 'blue' : 'gray'}
                    onClick={() => setLayoutMode('FULL_NASA')}
                  >
                    Архівне фото NASA (Pillow-box)
                  </Button>
                </HStack>
              </Box>

              {/* 2. Avatar Character & Emotions */}
              <Box p="3" borderRadius="lg" bg="bg.subtle" borderWidth="1px">
                <HStack justify="space-between" mb="2">
                  <Text fontSize="xs" fontWeight="bold" color="fg.muted">
                    2. Персонаж-ведучий (PNGTuber) та емоції:
                  </Text>
                  <Badge colorPalette="pink" size="xs" px="2" py="0.5" borderRadius="md">
                    Стан: {activeEmotion}
                  </Badge>
                </HStack>

                {/* Preset Switcher */}
                <HStack gap="2" mb="3">
                  {[
                    { id: 'violetta', name: 'Віолетта (CosmoHost)' },
                    { id: 'neil', name: 'Астронавт Ніл' },
                    { id: 'rover_bot', name: 'Марсохід-Дроїд' },
                  ].map((preset) => (
                    <Button
                      key={preset.id}
                      size="xs"
                      variant={avatarPreset === preset.id ? 'solid' : 'outline'}
                      colorPalette={avatarPreset === preset.id ? 'pink' : 'gray'}
                      onClick={() => setAvatarPreset(preset.id as AvatarPresetId)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </HStack>

                {/* Emotions Switcher */}
                <Text fontSize="2xs" color="fg.muted" mb="1.5">
                  Емоційні вирази обличчя (автоматично змінюються за таймлайном слайдів):
                </Text>
                <HStack gap="2" wrap="wrap">
                  {[
                    { id: 'SHOCK', label: '😱 ШОК (Хук 0-3с / Аварія)', color: 'red' },
                    { id: 'EXPERT', label: '🧐 ЕКСПЕРТ (Наука / Датчики)', color: 'blue' },
                    { id: 'IDLE', label: '🙂 СПОКІЙНИЙ (Оповідання)', color: 'teal' },
                    { id: 'HYPE', label: '🚀 ХАЙП / ЗАКЛИК (CTA Loop)', color: 'purple' },
                  ].map((emo) => {
                    const isCurrent = activeEmotion === emo.id;
                    return (
                      <Button
                        key={emo.id}
                        size="xs"
                        variant={isCurrent ? 'solid' : 'outline'}
                        colorPalette={isCurrent ? emo.color : 'gray'}
                        onClick={() => {
                          setManualEmotion(emo.id as AvatarEmotion);
                          setTimeout(() => setManualEmotion(null), 4000);
                        }}
                      >
                        {emo.label}
                      </Button>
                    );
                  })}
                </HStack>
              </Box>

              {/* 3. BGM Cosmic Soundscape */}
              <Box p="3" borderRadius="lg" bg="bg.subtle" borderWidth="1px">
                <HStack justify="space-between" mb="2">
                  <HStack gap="1.5">
                    <Music size={14} color="#a855f7" />
                    <Text fontSize="xs" fontWeight="bold" color="fg.muted">
                      3. Фонова музика з рекомендаціями (BGM):
                    </Text>
                  </HStack>
                  <HStack gap="1">
                    {[-30, -24, -18].map((db) => (
                      <Button
                        key={db}
                        size="xs"
                        variant={bgmVolumeDb === db ? 'solid' : 'outline'}
                        colorPalette={bgmVolumeDb === db ? 'yellow' : 'gray'}
                        onClick={() => setBgmVolumeDb(db)}
                      >
                        {db} dB
                      </Button>
                    ))}
                  </HStack>
                </HStack>

                <Flex wrap="wrap" gap="2" mb="2">
                  {BGM_PRESETS.map((bgm) => (
                    <Button
                      key={bgm.id}
                      size="xs"
                      variant={selectedBgm === bgm.id ? 'solid' : 'outline'}
                      colorPalette={selectedBgm === bgm.id ? 'purple' : 'gray'}
                      onClick={() => setSelectedBgm(bgm.id)}
                    >
                      <Headphones size={12} />
                      {bgm.title}
                      <Badge
                        size="xs"
                        ml="1.5"
                        px="2"
                        py="0.5"
                        borderRadius="md"
                        colorPalette="yellow"
                        variant="subtle"
                      >
                        {bgm.vibe}
                      </Badge>
                    </Button>
                  ))}
                </Flex>
                <Text fontSize="2xs" color="fg.subtle">
                  Приглушується автоматично до -24 dB, коли звучить голос диктора, і піднімається в
                  паузах.
                </Text>
              </Box>

              {/* 4. Playback & Scrubber Controls */}
              <Box p="3" borderRadius="lg" bg="bg.subtle" borderWidth="1px">
                <Flex justify="space-between" align="center" mb="2">
                  <HStack gap="2">
                    <Button
                      size="sm"
                      colorPalette={isPlaying ? 'yellow' : 'teal'}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      {isPlaying ? 'Пауза' : 'Відтворити ролик'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="gray"
                      onClick={() => {
                        setIsPlaying(false);
                        setPlaybackTimeSec(0);
                      }}
                    >
                      <RotateCcw size={13} />
                      00:00
                    </Button>
                  </HStack>

                  <HStack gap="1.5">
                    <Text fontSize="xs" fontWeight="bold" color="fg">
                      {playbackTimeSec.toFixed(1)}с / {totalDuration}с
                    </Text>
                    <Button
                      size="xs"
                      variant={showSafeZones ? 'solid' : 'outline'}
                      colorPalette={showSafeZones ? 'green' : 'gray'}
                      onClick={() => setShowSafeZones(!showSafeZones)}
                      title="Показати межі кнопок TikTok/Shorts"
                    >
                      <Shield size={12} />
                      Safe Zones
                    </Button>
                    {showSafeZones && (
                      <HStack gap="1" ml="1">
                        <Button
                          size="2xs"
                          variant={safeZonePlatform === 'tiktok' ? 'solid' : 'ghost'}
                          colorPalette={safeZonePlatform === 'tiktok' ? 'cyan' : 'gray'}
                          onClick={() => setSafeZonePlatform('tiktok')}
                        >
                          TikTok
                        </Button>
                        <Button
                          size="2xs"
                          variant={safeZonePlatform === 'youtube' ? 'solid' : 'ghost'}
                          colorPalette={safeZonePlatform === 'youtube' ? 'red' : 'gray'}
                          onClick={() => setSafeZonePlatform('youtube')}
                        >
                          Shorts
                        </Button>
                        <Button
                          size="2xs"
                          variant={safeZonePlatform === 'instagram' ? 'solid' : 'ghost'}
                          colorPalette={safeZonePlatform === 'instagram' ? 'purple' : 'gray'}
                          onClick={() => setSafeZonePlatform('instagram')}
                        >
                          Reels
                        </Button>
                      </HStack>
                    )}
                  </HStack>
                </Flex>

                {/* Scrubber Progress Bar */}
                <Box
                  w="100%"
                  h="6px"
                  bg="gray.800"
                  borderRadius="full"
                  overflow="hidden"
                  cursor="pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    setPlaybackTimeSec(Number((ratio * totalDuration).toFixed(1)));
                  }}
                >
                  <Box
                    h="100%"
                    w={`${(playbackTimeSec / totalDuration) * 100}%`}
                    bg="teal.400"
                    transition="width 0.1s linear"
                  />
                </Box>

                {/* Slide segments markers */}
                <HStack justify="space-between" mt="1">
                  <Text fontSize="2xs" color="red.400">
                    [0-3с] ⚡ Хук
                  </Text>
                  <Text fontSize="2xs" color="blue.400">
                    [3-18с] 🔬 Наука
                  </Text>
                  <Text fontSize="2xs" color="orange.400">
                    [18-33с] 💥 Драма
                  </Text>
                  <Text fontSize="2xs" color="green.400">
                    [33-40с] 🔄 Loop CTA
                  </Text>
                </HStack>
              </Box>
            </VStack>

            {/* Right Column: 9:16 Smartphone Mockup Viewport */}
            <Box
              w="280px"
              h="498px"
              borderRadius="28px"
              borderWidth="8px"
              borderColor="#1e293b"
              bg="#000000"
              position="relative"
              overflow="hidden"
              boxShadow="2xl"
              flexShrink="0"
              mx="auto"
            >
              {/* Dynamic Screen Layout */}
              {layoutMode === 'SPLIT_50_50' ? (
                <Flex direction="column" w="100%" h="100%">
                  {/* TOP SCREEN: Real Official NASA Archive Photo with Ken Burns Pan */}
                  <Box flex="1" w="100%" position="relative" overflow="hidden" bg="#05070e">
                    {/* Real NASA Photograph */}
                    <Image
                      src={
                        selectedArtifact?.previewImageUrl ||
                        'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg'
                      }
                      alt={selectedArtifact?.name || 'NASA Artifact'}
                      position="absolute"
                      inset="0"
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      style={{
                        transform: `scale(${1.08 + Math.sin(playbackTimeSec * 0.25) * 0.04}) translate(${Math.sin(playbackTimeSec * 0.15) * 4}px, ${Math.cos(playbackTimeSec * 0.15) * 2}px)`,
                        transition: 'transform 0.2s ease-out',
                      }}
                    />

                    {/* Subtle cinematic gradient vignette for text legibility */}
                    <Box
                      position="absolute"
                      inset="0"
                      bgGradient="to-t"
                      gradientFrom="black/80"
                      gradientVia="transparent"
                      gradientTo="black/70"
                      pointerEvents="none"
                    />

                    {/* Official NASA Archive Source Pill */}
                    <Box
                      position="absolute"
                      bottom="8px"
                      left="8px"
                      bg="black/75"
                      backdropFilter="blur(4px)"
                      px="2"
                      py="1"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="white/10"
                    >
                      <Text fontSize="3xs" fontWeight="bold" color="white" lineClamp={1}>
                        📷 {selectedArtifact?.name || 'NASA Space Hardware'}
                      </Text>
                      <Text fontSize="3xs" color="gray.300">
                        {selectedArtifact?.celestialBody === 'mars'
                          ? 'Марсіанська поверхня'
                          : 'Місячна поверхня'}{' '}
                        • {selectedArtifact?.missionName}
                      </Text>
                    </Box>

                    {/* Sci-Fi Telemetry HUD Overlay */}
                    <Box
                      position="absolute"
                      top="8px"
                      left="8px"
                      bg="black/75"
                      backdropFilter="blur(4px)"
                      px="2"
                      py="1"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="cyan.500/30"
                      fontSize="3xs"
                      color="cyan.300"
                      fontFamily="monospace"
                    >
                      <Text>
                        {selectedArtifact?.lastContactSol
                          ? `SOL ${selectedArtifact.lastContactSol} • `
                          : ''}
                        {selectedArtifact?.celestialBody.toUpperCase()}
                      </Text>
                      <Text color="gray.300">
                        LAT {selectedArtifact?.coordinates?.latitude.toFixed(2)}° • LON{' '}
                        {selectedArtifact?.coordinates?.longitude.toFixed(2)}°
                      </Text>
                    </Box>
                  </Box>

                  {/* DIVIDER BAR */}
                  <Box h="2px" w="100%" bg="teal.400" boxShadow="0 0 8px #2dd4bf" />

                  {/* BOTTOM SCREEN: 60 FPS Procedural Gameplay B-Roll Simulation */}
                  <Box
                    flex="1"
                    w="100%"
                    position="relative"
                    overflow="hidden"
                    bg="linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)"
                  >
                    {/* Procedural ground ridges moving left */}
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      h="40%"
                      bg="#292524"
                      clipPath="polygon(0 40%, 30% 20%, 70% 50%, 100% 20%, 100% 100%, 0 100%)"
                      style={{
                        transform: `translateX(-${(playbackTimeSec * 20) % 50}px)`,
                      }}
                    />

                    {/* Low-gravity bouncing runner / rover */}
                    <Box
                      position="absolute"
                      bottom="35%"
                      left="40%"
                      w="24px"
                      h="24px"
                      borderRadius="full"
                      bg="teal.400"
                      boxShadow="0 0 12px #2dd4bf"
                      style={{
                        transform: `translateY(${Math.sin(playbackTimeSec * 4) * -22}px)`,
                      }}
                    />

                    <Badge
                      position="absolute"
                      bottom="6px"
                      left="6px"
                      colorPalette="teal"
                      size="xs"
                      variant="solid"
                      px="2"
                      py="0.5"
                      borderRadius="md"
                    >
                      B-Roll 60 FPS
                    </Badge>
                  </Box>
                </Flex>
              ) : layoutMode === 'FULL_BROLL' ? (
                <Box w="100%" h="100%" bg="#0c0a09" position="relative">
                  <Box
                    position="absolute"
                    bottom="30%"
                    left="45%"
                    w="32px"
                    h="32px"
                    borderRadius="full"
                    bg="teal.400"
                    boxShadow="0 0 15px #2dd4bf"
                    style={{
                      transform: `translateY(${Math.sin(playbackTimeSec * 4) * -30}px)`,
                    }}
                  />
                  <Badge
                    position="absolute"
                    top="10px"
                    left="10px"
                    colorPalette="teal"
                    size="xs"
                    px="2"
                    py="0.5"
                    borderRadius="md"
                  >
                    Full Gameplay Parkour
                  </Badge>
                </Box>
              ) : (
                <Box
                  w="100%"
                  h="100%"
                  bg="#090d16"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Sparkles size={60} color="#fb923c" />
                </Box>
              )}

              {/* OVERLAY: Kinetic Contrast Subtitles in Safe Zone */}
              <Box
                position="absolute"
                bottom="105px"
                left="12px"
                right="12px"
                textAlign="center"
                pointerEvents="none"
                zIndex="20"
              >
                <Text
                  fontSize="sm"
                  fontWeight="black"
                  color="#ffffff"
                  lineHeight="1.2"
                  textTransform="uppercase"
                  style={{
                    textShadow:
                      '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.9)',
                  }}
                >
                  {currentSubtitleWords.chunk.map(({ key, word }) => {
                    const isHighlight =
                      word.toLowerCase().replace(/[^a-zа-яіїє0-9]/gi, '') ===
                      currentSubtitleWords.currentWord
                        .toLowerCase()
                        .replace(/[^a-zа-яіїє0-9]/gi, '');
                    return (
                      <span
                        key={key}
                        style={{
                          color: isHighlight ? '#FFD700' : '#ffffff',
                          padding: '0 3px',
                          display: 'inline-block',
                          transform: isHighlight ? 'scale(1.12)' : 'scale(1)',
                          transition: 'transform 0.1s ease',
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </Text>
              </Box>

              {/* OVERLAY: Word Magnet (0-3.5s Viral Hook Trigger) */}
              {playbackTimeSec <= 3.5 && (
                <Box
                  position="absolute"
                  top="44px"
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
                    py="0.5"
                    fontSize="xs"
                    fontWeight="black"
                    letterSpacing="wider"
                    borderRadius="full"
                    boxShadow="0 0 12px rgba(234, 179, 8, 0.9)"
                  >
                    {currentProject?.magnetWord || '⚡ ШОК'}
                  </Badge>
                </Box>
              )}

              {/* OVERLAY: Series Badge (Chronicles / Multi-part) */}
              {currentProject?.seriesInfo && (
                <Box position="absolute" top="10px" left="10px" zIndex="25" pointerEvents="none">
                  <Badge
                    size="xs"
                    colorPalette="purple"
                    variant="solid"
                    px="2"
                    py="0.5"
                    borderRadius="md"
                  >
                    {currentProject.seriesInfo.seriesName} • Ч.
                    {currentProject.seriesInfo.partNumber}/{currentProject.seriesInfo.totalParts}
                  </Badge>
                </Box>
              )}

              {/* OVERLAY: Reactive PNGTuber Avatar with 4 Emotions */}
              <Box
                position="absolute"
                bottom="12px"
                left="12px"
                w="68px"
                h="68px"
                zIndex="30"
                pointerEvents="none"
              >
                {/* Expressive SVG Character */}
                <svg viewBox="0 0 100 100" width="100%" height="100%" role="img">
                  <title>PNGTuber Avatar - {avatarPreset}</title>
                  {/* Head & Helmet */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill={avatarPreset === 'rover_bot' ? '#334155' : '#0ea5e9'}
                    stroke="#ffffff"
                    strokeWidth="4"
                  />
                  {/* Visor / Face */}
                  <rect
                    x="20"
                    y="24"
                    width="60"
                    height="52"
                    rx="16"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />

                  {/* Emotion Expressions */}
                  {activeEmotion === 'SHOCK' ? (
                    // SHOCK: Huge round eyes, open mouth
                    <g>
                      <circle cx="36" cy="45" r="9" fill="#ffffff" />
                      <circle cx="64" cy="45" r="9" fill="#ffffff" />
                      <circle cx="36" cy="45" r="4" fill="#000000" />
                      <circle cx="64" cy="45" r="4" fill="#000000" />
                      {/* Open O-mouth */}
                      <ellipse cx="50" cy="64" rx="8" ry={isMouthOpen ? 12 : 7} fill="#ef4444" />
                    </g>
                  ) : activeEmotion === 'EXPERT' ? (
                    // EXPERT: Sleek glowing HUD visor, analytical smirk
                    <g>
                      <rect x="26" y="40" width="48" height="10" rx="3" fill="#38bdf8" />
                      <circle cx="38" cy="45" r="2" fill="#ffffff" />
                      <circle cx="62" cy="45" r="2" fill="#ffffff" />
                      {/* Smirk */}
                      <path
                        d={isMouthOpen ? 'M 40 60 Q 50 68 60 62 Z' : 'M 40 62 Q 52 64 60 59'}
                        stroke="#ffffff"
                        strokeWidth="3"
                        fill={isMouthOpen ? '#ffffff' : 'none'}
                      />
                    </g>
                  ) : activeEmotion === 'HYPE' ? (
                    // HYPE: Star / laser eyes, enthusiastic grin
                    <g>
                      <text x="26" y="52" fontSize="16" fill="#facc15">
                        ★
                      </text>
                      <text x="54" y="52" fontSize="16" fill="#facc15">
                        ★
                      </text>
                      <path
                        d={isMouthOpen ? 'M 35 60 Q 50 74 65 60 Z' : 'M 36 60 Q 50 68 64 60'}
                        stroke="#facc15"
                        strokeWidth="4"
                        fill={isMouthOpen ? '#facc15' : 'none'}
                      />
                    </g>
                  ) : (
                    // IDLE: Calm, friendly
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
              </Box>

              {/* OVERLAY: Semi-Transparent Safe Zones (TikTok/Reels UI) */}
              {showSafeZones && (
                <Box position="absolute" inset="0" pointerEvents="none" zIndex="40">
                  {/* Top Bar (Search, Sound name) */}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    h="38px"
                    bg="rgba(239, 68, 68, 0.22)"
                    borderBottom="1px dashed #ef4444"
                    px="2"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <HStack gap="1">
                      <Badge
                        size="xs"
                        colorPalette="red"
                        variant="solid"
                        px="2"
                        py="0.5"
                        borderRadius="md"
                      >
                        {safeZonePlatform.toUpperCase()}
                      </Badge>
                      <Text fontSize="2xs" color="#fca5a5" fontWeight="bold">
                        Мертва зона Top 220px (
                        {safeZonePlatform === 'tiktok'
                          ? 'Для вас | Підписки'
                          : safeZonePlatform === 'youtube'
                            ? 'YouTube Shorts'
                            : 'Instagram Reels'}
                        )
                      </Text>
                    </HStack>
                    <Text fontSize="2xs" color="#fca5a5">
                      🔍 220px
                    </Text>
                  </Box>

                  {/* Right Actions Bar (Like, Comment, Bookmark, Share, Audio) */}
                  <Box
                    position="absolute"
                    top="38px"
                    bottom="76px"
                    right="0"
                    w="46px"
                    bg="rgba(234, 179, 8, 0.18)"
                    borderLeft="1px dashed #eab308"
                    display="flex"
                    flexDirection="column"
                    justifyContent="flex-end"
                    alignItems="center"
                    pb="2"
                    gap="2"
                  >
                    <VStack gap="0" fontSize="2xs" color="#fef08a">
                      <Text>❤️</Text>
                      <Text fontSize="3xs" fontWeight="bold">
                        142K
                      </Text>
                    </VStack>
                    <VStack gap="0" fontSize="2xs" color="#fef08a">
                      <Text>💬</Text>
                      <Text fontSize="3xs" fontWeight="bold">
                        1.9K
                      </Text>
                    </VStack>
                    <VStack gap="0" fontSize="2xs" color="#fef08a">
                      <Text>🔖</Text>
                      <Text fontSize="3xs" fontWeight="bold">
                        34K
                      </Text>
                    </VStack>
                    <VStack gap="0" fontSize="2xs" color="#fef08a">
                      <Text>↗️</Text>
                      <Text fontSize="3xs" fontWeight="bold">
                        12K
                      </Text>
                    </VStack>
                    {/* Vinyl audio disc */}
                    <Box
                      w="20px"
                      h="20px"
                      borderRadius="full"
                      bg="black"
                      borderWidth="2px"
                      borderColor="yellow.400"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="3xs">🎵</Text>
                    </Box>
                  </Box>

                  {/* Bottom Bar (Caption, Profile, Audio wave) */}
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    h="76px"
                    bg="rgba(239, 68, 68, 0.22)"
                    borderTop="1px dashed #ef4444"
                    px="2"
                    py="1"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                  >
                    <HStack justify="space-between" align="center">
                      <HStack gap="1">
                        <Box w="14px" h="14px" borderRadius="full" bg="teal.400" />
                        <Text fontSize="2xs" fontWeight="bold" color="#ffffff">
                          @cosmolost
                        </Text>
                        <Badge size="xs" colorPalette="teal" px="1.5" py="0.5" borderRadius="full">
                          ✓
                        </Badge>
                      </HStack>
                      <Text fontSize="3xs" color="#fca5a5">
                        Мертва зона 420px
                      </Text>
                    </HStack>
                    <Text fontSize="3xs" color="#e2e8f0" lineClamp={1}>
                      {currentProject?.artifactName || 'NASA Space Mission'}: Останні слова
                      телеметрії...
                    </Text>
                    <Text fontSize="3xs" color="#cbd5e1" lineClamp={1}>
                      🎵 Оригінальний звук - CosmoLost Sci-Fi Soundscape
                    </Text>
                  </Box>

                  {/* Central Safe Zone Guidance Outline */}
                  <Box
                    position="absolute"
                    top="38px"
                    bottom="76px"
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
                    <Badge
                      size="xs"
                      colorPalette="green"
                      variant="surface"
                      px="2"
                      py="0.5"
                      borderRadius="md"
                    >
                      🛡️ Безпечна зона ({safeZonePlatform.toUpperCase()}): Текст і персонаж захищені
                    </Badge>
                  </Box>
                </Box>
              )}
            </Box>
          </Flex>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
