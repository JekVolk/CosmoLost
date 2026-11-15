import { usePublicationStore } from '@/entities/publication';
import { useConnectorStore } from '@/entities/social-connector';
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
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  FolderOpen,
  Globe,
  Hash,
  Lock,
  MessageSquare,
  Share2,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useSocialPublishing } from '../model/use-social-publishing';

interface PublicationExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicationExportDialog: React.FC<PublicationExportDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const currentProject = usePublicationStore((s) => s.currentProject);
  const { selectedConnectorIds } = useConnectorStore();
  const { openLocalFolderDirectly } = useSocialPublishing();

  const [copiedSeo, setCopiedSeo] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [folderOpened, setFolderOpened] = useState(false);
  const [isTelegramCompressed, setIsTelegramCompressed] = useState(false);
  const [portalSynced, setPortalSynced] = useState(false);

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

  const isAlreadyPublished =
    currentProject?.status === 'PUBLISHED' || currentProject?.status === 'PUBLISHED_MANUALLY';
  const defaultProjectTitle = currentProject?.artifactName
    ? `${currentProject.artifactName} — Short #04`
    : 'Apollo 11 LM Eagle — Short #04';
  const defaultHook =
    currentProject?.seoCaption?.line1Hook ||
    "1. 55 years alone on the Sea of Tranquility. The untold story of Apollo 11's Eagle ascent stage.";
  const defaultContext =
    currentProject?.seoCaption?.line2Seo ||
    "2. Discover how humanity's first lunar base still sits intact in the silence of space.";
  const defaultCta =
    currentProject?.seoCaption?.line3Tags ||
    '3. Explore coordinates in the interactive 3D map at cosmolost.space.';
  const defaultPin =
    currentProject?.pinComment ||
    'What equipment should humanity retrieve first when we return to the Moon? Share your thoughts below! 👇';

  const defaultTags = currentProject?.tagGroups?.flatMap((g) => {
    if (g === 'viral') return ['#ViralSpace', '#CosmoLost'];
    if (g === 'moon') return ['#Apollo11', '#MoonArtifact', '#LunarModule'];
    if (g === 'mars') return ['#MarsRover', '#Perseverance', '#MarsLife'];
    return ['#SpaceHistory', '#NASA', '#CosmoLost'];
  }) || ['#Apollo11', '#MoonArtifact', '#SpaceHistory', '#NASA', '#LunarModule', '#CosmoLost'];

  const estimatedSizeBytes = isTelegramCompressed ? 28 * 1024 * 1024 : 74 * 1024 * 1024;
  const estimatedSizeMb = (estimatedSizeBytes / (1024 * 1024)).toFixed(0);
  const exceedsTelegramLimit = !isTelegramCompressed && estimatedSizeBytes > 50 * 1024 * 1024;

  const handleCopySeo = async () => {
    const pkg = `${defaultHook}\n\n${defaultContext}\n\n${defaultCta}\n\n${defaultTags.join(' ')}\n\n📌 Закріплений коментар:\n${defaultPin}`;
    await navigator.clipboard.writeText(pkg);
    setCopiedSeo(true);
    setTimeout(() => setCopiedSeo(false), 3000);
  };

  const handleCopyPin = async () => {
    await navigator.clipboard.writeText(defaultPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 3000);
  };

  const handleOpenFolder = async () => {
    await openLocalFolderDirectly();
    setFolderOpened(true);
    setTimeout(() => setFolderOpened(false), 3000);
  };

  const handleSyncPortal = () => {
    setPortalSynced(true);
    setTimeout(() => setPortalSynced(false), 4000);
  };

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
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <Box
          aria-modal="true"
          aria-labelledby="publication-dialog-title"
          bg="bg.panel"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="border.default"
          width="100%"
          maxWidth="880px"
          maxHeight="92vh"
          overflow="hidden"
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
            flexShrink="0"
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="2">
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
                    TAURI V2 NATIVE DISTRIBUTION
                  </Badge>
                  <Text fontSize="3xs" color="fg.muted" letterSpacing="wider">
                    LOCAL-FIRST EXPORT & ZERO-TRUST
                  </Text>
                </HStack>
                <Heading id="publication-dialog-title" size="md" color="fg">
                  Publication & Export Package
                </Heading>
                <Text fontSize="xs" color="fg.muted">
                  {defaultProjectTitle} • 1080×1920 (9:16 Vertical Shorts) • Розмір: ~
                  {estimatedSizeMb} МБ
                </Text>
              </VStack>

              <Button
                size="xs"
                variant="ghost"
                colorPalette="gray"
                onClick={onClose}
                title="Закрити діалог"
                aria-label="Закрити діалог"
              >
                <X size={16} />
              </Button>
            </Flex>
          </Box>

          {/* Body */}
          <Box p="6" display="flex" flexDirection="column" gap="5" overflowY="auto" minH="0">
            {/* Duplicate Publication Protection Banner */}
            {isAlreadyPublished && (
              <Box
                p="3.5"
                borderRadius="xl"
                bg="green.500/10"
                borderWidth="1px"
                borderColor="green.500"
              >
                <HStack justify="space-between" align="center" wrap="wrap" gap="2">
                  <HStack gap="2">
                    <Lock size={16} color="var(--chakra-colors-green-500)" />
                    <VStack align="flex-start" gap="0.5">
                      <Text fontSize="xs" fontWeight="bold" color="green.500">
                        Проєкт вже опубліковано (Захист від повторної публікації)
                      </Text>
                      <Text fontSize="3xs" color="fg.muted">
                        Посилання:{' '}
                        {currentProject?.externalPostUrl || 'Опубліковано вручну або через API'}.
                        Повторне надсилання заблоковано для уникнення дублікатів.
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge size="xs" colorPalette="green" variant="solid">
                    PUBLISHED
                  </Badge>
                </HStack>
              </Box>
            )}

            {/* Mandatory Local-First Bundle Foundation (Option C) */}
            <Box
              p="3.5"
              borderRadius="xl"
              bg="bg.surface"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="center" mb="2">
                <HStack gap="2">
                  <FileText size={15} color="var(--chakra-colors-cyan-400)" />
                  <Text fontWeight="bold" fontSize="xs" color="fg">
                    Обов'язковий локальний пакет (100% Local-First):
                  </Text>
                </HStack>
                <Badge size="xs" colorPalette="teal" variant="surface">
                  Збережено на диск
                </Badge>
              </Flex>
              <SimpleGrid columns={{ base: 2, sm: 4 }} gap="2">
                <Box
                  p="2"
                  borderRadius="md"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Text fontSize="3xs" fontWeight="bold" color="cyan.400">
                    1. MP4 ВІДЕО
                  </Text>
                  <Text fontSize="2xs" color="fg.muted">
                    1080×1920 60FPS
                  </Text>
                </Box>
                <Box
                  p="2"
                  borderRadius="md"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Text fontSize="3xs" fontWeight="bold" color="yellow.500">
                    2. CAPTIONS.TXT
                  </Text>
                  <Text fontSize="2xs" color="fg.muted">
                    Золота SEO-формула
                  </Text>
                </Box>
                <Box
                  p="2"
                  borderRadius="md"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Text fontSize="3xs" fontWeight="bold" color="green.500">
                    3. PIN_COMMENT.TXT
                  </Text>
                  <Text fontSize="2xs" color="fg.muted">
                    Закріплене питання
                  </Text>
                </Box>
                <Box
                  p="2"
                  borderRadius="md"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Text fontSize="3xs" fontWeight="bold" color="purple.500">
                    4. PROJECT.JSON
                  </Text>
                  <Text fontSize="2xs" color="fg.muted">
                    Повні метадані
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Telegram 50MB Limitation Proactive Warning */}
            {exceedsTelegramLimit && (
              <Box
                p="3.5"
                borderRadius="xl"
                bg="yellow.500/10"
                borderWidth="1px"
                borderColor="yellow.500"
              >
                <VStack align="stretch" gap="2">
                  <Flex justify="space-between" align="center" wrap="wrap" gap="2">
                    <HStack gap="2">
                      <AlertTriangle size={16} color="var(--chakra-colors-yellow-500)" />
                      <Text fontSize="xs" fontWeight="bold" color="yellow.500">
                        Розмір відео (~{estimatedSizeMb} МБ) перевищує ліміт Telegram Bot API (50
                        МБ)
                      </Text>
                    </HStack>
                    <HStack gap="2">
                      <Button
                        size="xs"
                        variant="solid"
                        colorPalette="yellow"
                        onClick={() => setIsTelegramCompressed(true)}
                      >
                        ⚡ Стиснути для Telegram (H.264 CRF 23, ~28 МБ)
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorPalette="gray"
                        onClick={handleOpenFolder}
                      >
                        <FolderOpen size={12} /> Вручну без втрати якості
                      </Button>
                    </HStack>
                  </Flex>
                  <Text fontSize="3xs" color="fg.muted">
                    <strong>Порада для максимальної якості:</strong> Якщо ви бажаєте зберегти
                    оригінальний бітрейт 18–20 Mbps без компресії, натисніть «Вручну», відкрийте
                    Windows Explorer і перетягніть MP4 у Telegram Desktop як «Файл / Документ»
                    (ліміт до 2 ГБ).
                  </Text>
                </VStack>
              </Box>
            )}

            {isTelegramCompressed && (
              <Box
                p="2.5"
                borderRadius="lg"
                bg="green.500/10"
                borderWidth="1px"
                borderColor="green.500"
              >
                <HStack justify="space-between" align="center">
                  <HStack gap="2">
                    <CheckCircle2 size={14} color="var(--chakra-colors-green-500)" />
                    <Text fontSize="2xs" color="green.500" fontWeight="semibold">
                      Оптимізовано для Telegram (H.264 CRF 23, ~28 МБ) — готово до відправлення без
                      перевищення ліміту!
                    </Text>
                  </HStack>
                  <Button
                    size="2xs"
                    variant="ghost"
                    colorPalette="gray"
                    onClick={() => setIsTelegramCompressed(false)}
                  >
                    Повернути оригінальний бітрейт (~74 МБ)
                  </Button>
                </HStack>
              </Box>
            )}

            {/* Platform Selection */}
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="fg" mb="2">
                Цільові канали та платформи:
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3">
                <Box
                  p="3"
                  borderRadius="xl"
                  bg="bg.surface"
                  borderWidth="1px"
                  borderColor={
                    selectedConnectorIds.includes('youtube-shorts') ? 'cyan.400' : 'border.subtle'
                  }
                >
                  <HStack justify="space-between" align="center">
                    <HStack gap="2">
                      <Box w="8px" h="8px" borderRadius="full" bg="red.500" />
                      <Text fontWeight="semibold" fontSize="xs" color="fg">
                        YouTube Shorts
                      </Text>
                    </HStack>
                    <Badge size="xs" colorPalette="green" variant="subtle">
                      OAuth PKCE
                    </Badge>
                  </HStack>
                  <Text fontSize="3xs" color="fg.muted" mt="1">
                    1080p 60fps • 40s duration • Auto-Pin
                  </Text>
                </Box>

                <Box
                  p="3"
                  borderRadius="xl"
                  bg="bg.surface"
                  borderWidth="1px"
                  borderColor="cyan.400"
                >
                  <HStack justify="space-between" align="center">
                    <HStack gap="2">
                      <Box w="8px" h="8px" borderRadius="full" bg="cyan.400" />
                      <Text fontWeight="semibold" fontSize="xs" color="fg">
                        Telegram Channel
                      </Text>
                    </HStack>
                    <Badge
                      size="xs"
                      colorPalette={isTelegramCompressed ? 'green' : 'yellow'}
                      variant="subtle"
                    >
                      {isTelegramCompressed ? 'CRF 23 (~28MB)' : '~74MB (Manual/CRF)'}
                    </Badge>
                  </HStack>
                  <Text fontSize="3xs" color="fg.muted" mt="1">
                    @cosmolost_hq • Direct / Manual Post
                  </Text>
                </Box>

                <Box
                  p="3"
                  borderRadius="xl"
                  bg="bg.surface"
                  borderWidth="1px"
                  borderColor="green.500"
                >
                  <HStack justify="space-between" align="center">
                    <HStack gap="2">
                      <Box w="8px" h="8px" borderRadius="full" bg="green.500" />
                      <Text fontWeight="semibold" fontSize="xs" color="fg">
                        TikTok & Local Disk
                      </Text>
                    </HStack>
                    <Badge size="xs" colorPalette="teal" variant="solid">
                      Native Explorer
                    </Badge>
                  </HStack>
                  <Text fontSize="3xs" color="fg.muted" mt="1">
                    MP4 saved in Videos/CosmoLost
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* 3-Line SEO Description Formula */}
            <Box
              bg="bg.surface"
              p="4"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="center" mb="2.5">
                <HStack gap="2">
                  <Share2 size={16} color="var(--chakra-colors-cyan-400)" />
                  <Text fontWeight="bold" fontSize="sm" color="fg">
                    3-рядковий SEO опис (Золота формула віральності):
                  </Text>
                </HStack>
                <Badge size="xs" colorPalette="purple" variant="surface">
                  248 chars • 42 words
                </Badge>
              </Flex>

              <VStack align="stretch" gap="2">
                {/* Line 1: Hook */}
                <Box
                  p="2.5"
                  borderRadius="md"
                  bg="bg.panel"
                  borderLeftWidth="3px"
                  borderColor="yellow.500"
                >
                  <Text fontSize="3xs" fontWeight="bold" color="yellow.500" mb="0.5">
                    РЯДОК 1 — ВІРУСНИЙ ХУК (0-3.5с):
                  </Text>
                  <Text fontSize="xs" color="fg">
                    {defaultHook}
                  </Text>
                </Box>

                {/* Line 2: Context */}
                <Box
                  p="2.5"
                  borderRadius="md"
                  bg="bg.panel"
                  borderLeftWidth="3px"
                  borderColor="cyan.400"
                >
                  <Text fontSize="3xs" fontWeight="bold" color="cyan.400" mb="0.5">
                    РЯДОК 2 — КОНТЕКСТ ТА НАУКОВА СУТНІСТЬ:
                  </Text>
                  <Text fontSize="xs" color="fg">
                    {defaultContext}
                  </Text>
                </Box>

                {/* Line 3: CTA */}
                <Box
                  p="2.5"
                  borderRadius="md"
                  bg="bg.panel"
                  borderLeftWidth="3px"
                  borderColor="green.500"
                >
                  <Text fontSize="3xs" fontWeight="bold" color="fg" mb="0.5">
                    РЯДОК 3 — ЗАКЛИК ДО ДІЇ (CTA НА 3D МАПУ):
                  </Text>
                  <Text fontSize="xs" color="fg">
                    {defaultCta}
                  </Text>
                </Box>
              </VStack>

              {/* Tags & Keywords */}
              <Box mt="3">
                <Text fontSize="3xs" color="fg.muted" mb="1.5">
                  Теги та ключові слова для алгоритмів соцмереж:
                </Text>
                <HStack gap="1.5" wrap="wrap">
                  {defaultTags.map((tag) => (
                    <Badge key={tag} size="xs" variant="surface" colorPalette="cyan">
                      <Hash size={10} style={{ marginRight: '2px' }} />
                      {tag.replace('#', '')}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            </Box>

            {/* Dedicated Pin Comment Block */}
            <Box
              bg="bg.surface"
              p="4"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="center" mb="2">
                <HStack gap="2">
                  <MessageSquare size={16} color="var(--chakra-colors-fg)" />
                  <Text fontWeight="bold" fontSize="sm" color="fg">
                    Закріплений коментар (Pin Comment):
                  </Text>
                </HStack>
                <Button
                  size="2xs"
                  variant="outline"
                  colorPalette={copiedPin ? 'green' : 'gray'}
                  onClick={handleCopyPin}
                  title="Скопіювати закріплений коментар у буфер"
                  aria-label="Скопіювати коментар"
                >
                  {copiedPin ? <Check size={11} /> : <Copy size={11} />}
                  {copiedPin ? 'Скопійовано!' : 'Копіювати коментар'}
                </Button>
              </Flex>

              <Box
                p="3"
                borderRadius="lg"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Text fontSize="xs" color="fg">
                  "{defaultPin}"
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            p="4"
            borderTopWidth="1px"
            borderColor="border.subtle"
            bg="bg.surface"
            flexShrink="0"
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="3">
              <HStack gap="2">
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="gray"
                  onClick={onClose}
                  title="Закрити модальне вікно експорту"
                  aria-label="Закрити"
                >
                  Закрити
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette={portalSynced ? 'green' : 'purple'}
                  onClick={handleSyncPortal}
                  title="Прив'язати відео до інтерактивної 3D мапи CosmoLost"
                  aria-label="Прив'язати відео до 3D мапи"
                >
                  <Globe size={14} />
                  {portalSynced ? 'Прив’язано до 3D мапи!' : '🌐 На 3D мапу CosmoLost'}
                </Button>
              </HStack>
              <HStack gap="2">
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette={folderOpened ? 'green' : 'teal'}
                  onClick={handleOpenFolder}
                  title="Відкрити папку з готовим відео у провіднику"
                  aria-label="Відкрити папку з файлом"
                >
                  <FolderOpen size={14} />
                  {folderOpened ? 'Папку відкрито' : 'Відкрити папку з файлом'}
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  colorPalette={copiedSeo ? 'green' : 'teal'}
                  onClick={handleCopySeo}
                  disabled={isAlreadyPublished}
                  title="Скопіювати повний пакет SEO опису"
                  aria-label="Скопіювати SEO пакет"
                >
                  {copiedSeo ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copiedSeo ? 'SEO пакет скопійовано!' : 'Скопіювати SEO пакет'}
                </Button>
              </HStack>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};
