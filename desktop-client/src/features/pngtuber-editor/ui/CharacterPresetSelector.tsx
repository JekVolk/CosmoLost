import { Badge, Box, Button, HStack, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Plus, Trash2, User } from 'lucide-react';
import type React from 'react';
import type { CharacterPreset } from '../model/types';
import { useAllCharacters, usePngTuberEditorStore } from '../model/use-pngtuber-editor-store';

interface CharacterPresetSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CharacterPresetSelector: React.FC<CharacterPresetSelectorProps> = ({
  selectedId,
  onSelect,
}) => {
  const allCharacters = useAllCharacters();
  const openCreateModal = usePngTuberEditorStore((s) => s.openCreateAvatarModal);
  const deleteCustomCharacter = usePngTuberEditorStore((s) => s.deleteCustomCharacter);

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3">
      {allCharacters.map((char: CharacterPreset) => {
        const isSelected = char.id === selectedId;
        const primaryColor = char.palette[0] || 'var(--chakra-colors-cyan-400)';
        return (
          <Box
            key={char.id}
            tabIndex={0}
            aria-label={`Обрати персонажа: ${char.name} (${char.role})`}
            aria-pressed={isSelected}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(char.id);
              }
            }}
            bg="bg.surface"
            borderRadius="lg"
            borderWidth={isSelected ? '2px' : '1px'}
            borderColor={isSelected ? primaryColor : 'border.subtle'}
            p="3"
            cursor="pointer"
            onClick={() => onSelect(char.id)}
            transition="all 0.15s ease"
            _hover={{ borderColor: primaryColor }}
            position="relative"
          >
            <HStack justify="space-between" align="center" mb="1">
              <HStack gap="1.5">
                {char.avatarImageUrl ? (
                  <Box
                    width="20px"
                    height="20px"
                    borderRadius="full"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={primaryColor}
                  >
                    <Image
                      src={char.avatarImageUrl}
                      alt={char.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  </Box>
                ) : (
                  <User size={12} color={primaryColor} />
                )}
                <Text fontSize="3xs" fontWeight="bold" color="fg.muted" lineClamp={1}>
                  {char.role}
                </Text>
              </HStack>

              <HStack gap="1">
                {char.isCustom && (
                  <Badge size="xs" variant="solid" colorPalette="teal" fontSize="3xs">
                    CUSTOM
                  </Badge>
                )}
                <Badge
                  size="xs"
                  variant={isSelected ? 'solid' : 'subtle'}
                  colorPalette={isSelected ? 'cyan' : 'gray'}
                  fontSize="3xs"
                >
                  {char.tag}
                </Badge>
                {char.isCustom && (
                  <Button
                    size="2xs"
                    variant="ghost"
                    colorPalette="red"
                    p="1"
                    minW="auto"
                    h="auto"
                    title="Видалити кастомний аватар"
                    aria-label="Видалити кастомний аватар"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustomCharacter(char.id);
                    }}
                  >
                    <Trash2 size={11} />
                  </Button>
                )}
              </HStack>
            </HStack>

            <Text fontWeight="bold" fontSize="xs" color="fg" lineClamp={1}>
              {char.name}
            </Text>

            <Text fontSize="3xs" color="fg.muted" lineClamp={2} my="1">
              {char.archetype}
            </Text>

            <VStack
              align="stretch"
              gap="0.5"
              mt="2"
              pt="2"
              borderTopWidth="1px"
              borderColor="border.subtle"
            >
              <HStack justify="space-between">
                <Text fontSize="3xs" color="fg.muted">
                  Головна фіча:
                </Text>
                <Text fontSize="3xs" color="fg" fontWeight="medium" lineClamp={1}>
                  {char.signatureFeature}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="3xs" color="fg.muted">
                  Палітра:
                </Text>
                <HStack gap="1">
                  {char.palette.map((color) => (
                    <Box
                      key={color}
                      width="10px"
                      height="10px"
                      borderRadius="full"
                      bg={color}
                      borderWidth="1px"
                      borderColor="border.subtle"
                    />
                  ))}
                </HStack>
              </HStack>
            </VStack>
          </Box>
        );
      })}

      {/* Add Custom Avatar Card */}
      <Box
        tabIndex={0}
        aria-label="Створити свій аватар"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCreateModal();
          }
        }}
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="cyan.muted"
        borderRadius="lg"
        p="3"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        bg="cyan.500/5"
        transition="all 0.15s ease"
        _hover={{ bg: 'cyan.500/10', borderColor: 'cyan.solid' }}
        onClick={openCreateModal}
        minHeight="110px"
      >
        <Box p="2" borderRadius="full" bg="cyan.500/15" color="cyan.fg" mb="1.5">
          <Plus size={16} />
        </Box>
        <Text fontSize="xs" fontWeight="bold" color="cyan.fg">
          + Створити свій аватар
        </Text>
        <Text fontSize="3xs" color="fg.muted" textAlign="center" mt="0.5">
          Завантажте власний PNG спрайт
        </Text>
      </Box>
    </SimpleGrid>
  );
};
