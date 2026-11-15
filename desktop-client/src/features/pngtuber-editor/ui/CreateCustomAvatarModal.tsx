import {
  Badge,
  Box,
  Button,
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
import { Sparkles, Upload, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { usePngTuberEditorStore } from '../model/use-pngtuber-editor-store';

const PRESET_PALETTES = [
  { name: 'Неоновий Кіберпанк', colors: ['#06B6D4', '#0F172A', '#38BDF8'] },
  { name: 'Сонячний Спалах', colors: ['#F59E0B', '#78350F', '#FDE68A'] },
  { name: 'Марсіанський Оксид', colors: ['#EF4444', '#450A0A', '#FCA5A5'] },
  { name: 'Глибокий Квазар', colors: ['#8B5CF6', '#1E1B4B', '#DDD6FE'] },
  { name: 'Смарагдовий Пульсар', colors: ['#10B981', '#064E3B', '#A7F3D0'] },
];

export const CreateCustomAvatarModal: React.FC = () => {
  const isOpen = usePngTuberEditorStore((s) => s.isCreateAvatarModalOpen);
  const closeModal = usePngTuberEditorStore((s) => s.closeCreateAvatarModal);
  const addCustomCharacter = usePngTuberEditorStore((s) => s.addCustomCharacter);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('CUSTOM VTUBER');
  const [tag, setTag] = useState('ORIGINAL');
  const [archetype, setArchetype] = useState('Власний науковий диктор каналу.');
  const [palette, setPalette] = useState<string[]>(
    PRESET_PALETTES[0]?.colors ?? ['#06B6D4', '#0F172A', '#38BDF8'],
  );
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
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

  const handleFileChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatarImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomCharacter({
      name: name || 'Мій кастомний аватар',
      role: role || 'CUSTOM VTUBER',
      tag: tag || 'ORIGINAL',
      archetype: archetype || 'Користувацький персонаж-директор.',
      palette,
      avatarImageUrl: avatarImageUrl || undefined,
      signatureFeature: 'Власне завантажене зображення',
      voicePairing: 'Custom Voice Tone',
    });
  };

  return (
    <Portal>
      <Box
        position="fixed"
        inset="0"
        bg="blackAlpha.800"
        backdropFilter="blur(14px)"
        zIndex="1600"
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
          aria-labelledby="create-custom-avatar-title"
          bg="bg.panel"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="border.default"
          width="100%"
          maxWidth="640px"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.8)"
          overflow="hidden"
          as="form"
          onSubmit={handleSubmit}
        >
          {/* Header */}
          <Box p="4" bg="bg.surface" borderBottomWidth="1px" borderColor="border.subtle">
            <Flex justify="space-between" align="center">
              <HStack gap="2">
                <Sparkles size={18} color="var(--chakra-colors-cyan-400)" />
                <Heading id="create-custom-avatar-title" size="sm" color="fg">
                  Створити власний PNGTuber-аватар
                </Heading>
              </HStack>
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
            </Flex>
          </Box>

          {/* Form Content */}
          <Box p="5" display="flex" flexDirection="column" gap="4">
            {/* Avatar Image Uploader */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="fg" mb="1.5">
                Зображення аватара (PNG / WebP з прозорим фоном):
              </Text>
              <Box
                borderWidth="2px"
                borderStyle="dashed"
                borderColor={isDragging ? 'cyan.solid' : 'border.default'}
                borderRadius="xl"
                p="4"
                textAlign="center"
                bg={isDragging ? 'cyan.500/10' : 'bg.surface'}
                cursor="pointer"
                tabIndex={0}
                aria-label="Завантажити зображення аватара"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                transition="all 0.2s ease"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/webp,image/jpeg"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />

                {avatarImageUrl ? (
                  <VStack gap="2">
                    <Box
                      width="88px"
                      height="88px"
                      borderRadius="full"
                      borderWidth="3px"
                      borderColor={palette[0] || 'cyan.solid'}
                      overflow="hidden"
                      mx="auto"
                      bg="gray.950"
                      boxShadow="0 0 20px var(--chakra-colors-cyan-focus-ring, rgba(6, 182, 212, 0.35))"
                    >
                      <Image
                        src={avatarImageUrl}
                        alt="Uploaded Avatar Preview"
                        width="100%"
                        height="100%"
                        objectFit="cover"
                      />
                    </Box>
                    <HStack justify="center" gap="2">
                      <Badge size="xs" colorPalette="green" variant="solid">
                        Зображення завантажено
                      </Badge>
                      <Button
                        size="2xs"
                        variant="subtle"
                        colorPalette="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAvatarImageUrl(null);
                        }}
                        title="Видалити зображення"
                        aria-label="Видалити зображення"
                      >
                        Видалити
                      </Button>
                    </HStack>
                    <Text fontSize="3xs" color="fg.muted">
                      Натисніть або перетягніть інший файл для заміни
                    </Text>
                  </VStack>
                ) : (
                  <VStack gap="2" py="3">
                    <Box p="3" borderRadius="full" bg="cyan.500/10" color="cyan.fg">
                      <Upload size={24} />
                    </Box>
                    <Text fontSize="xs" fontWeight="medium" color="fg">
                      Перетягніть сюди PNG файл або натисніть для вибору
                    </Text>
                    <Text fontSize="3xs" color="fg.muted">
                      Підтримуються формати PNG, WebP, JPEG (бажано прозорий фон 512x512)
                    </Text>
                  </VStack>
                )}
              </Box>
            </Box>

            {/* Avatar Details */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="fg" mb="1">
                  Ім'я персонажа:
                </Text>
                <Input
                  size="sm"
                  placeholder="напр. Астро-Лис, Cyber-V"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  bg="bg.surface"
                  borderRadius="md"
                />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="fg" mb="1">
                  Роль у відео:
                </Text>
                <Input
                  size="sm"
                  placeholder="напр. ГОЛОВНИЙ ПІЛОТ, ЕКСПЕРТ"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  bg="bg.surface"
                  borderRadius="md"
                />
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="fg" mb="1">
                  Тег бейджа:
                </Text>
                <Input
                  size="sm"
                  placeholder="напр. VTUBER, AI HOST"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  bg="bg.surface"
                  borderRadius="md"
                />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="fg" mb="1">
                  Колірна палітра:
                </Text>
                <HStack gap="1.5" mt="1.5">
                  {PRESET_PALETTES.map((p) => {
                    const isSelected = palette[0] === p.colors[0];
                    return (
                      <Box
                        key={p.name}
                        tabIndex={0}
                        aria-label={`Обрати палітру: ${p.name}`}
                        aria-pressed={isSelected}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setPalette(p.colors);
                          }
                        }}
                        onClick={() => setPalette(p.colors)}
                        p="1"
                        borderRadius="md"
                        borderWidth={isSelected ? '2px' : '1px'}
                        borderColor={isSelected ? 'cyan.solid' : 'transparent'}
                        cursor="pointer"
                        title={p.name}
                      >
                        <HStack gap="1">
                          {p.colors.map((c) => (
                            <Box key={c} width="12px" height="12px" borderRadius="full" bg={c} />
                          ))}
                        </HStack>
                      </Box>
                    );
                  })}
                </HStack>
              </Box>
            </SimpleGrid>

            <Box>
              <Text fontSize="xs" fontWeight="bold" color="fg" mb="1">
                Архетип та опис:
              </Text>
              <Textarea
                size="sm"
                rows={2}
                placeholder="Опишіть манеру мовлення або характер вашого персонажа..."
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                bg="bg.surface"
                borderRadius="md"
              />
            </Box>
          </Box>

          {/* Footer */}
          <Box p="4" bg="bg.surface" borderTopWidth="1px" borderColor="border.subtle">
            <Flex justify="flex-end" gap="2">
              <Button
                size="sm"
                variant="outline"
                colorPalette="gray"
                onClick={closeModal}
                type="button"
                title="Скасувати створення аватара"
                aria-label="Скасувати"
              >
                Скасувати
              </Button>
              <Button
                size="sm"
                variant="solid"
                colorPalette="teal"
                type="submit"
                title="Зберегти та активувати аватар"
                aria-label="Зберегти та активувати аватар"
              >
                <Sparkles size={14} />
                Зберегти та активувати аватар
              </Button>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};
