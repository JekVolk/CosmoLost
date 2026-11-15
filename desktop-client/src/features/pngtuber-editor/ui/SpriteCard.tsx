import { Badge, Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { Upload } from 'lucide-react';
import type React from 'react';
import { useRef } from 'react';
import type { CharacterPreset, PngTuberSpriteItem } from '../model/types';

interface SpriteCardProps {
  sprite: PngTuberSpriteItem;
  character: CharacterPreset;
  isActive: boolean;
  onSelect: () => void;
  onUpload: (dataUrl: string) => void;
}

export const SpriteCard: React.FC<SpriteCardProps> = ({
  sprite,
  character,
  isActive,
  onSelect,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isClosed = sprite.phase === 'CLOSED';
  const primaryColor = character.palette[0] || 'var(--chakra-colors-cyan-400)';
  const bgColor = character.palette[1] || 'var(--chakra-colors-gray-900)';

  return (
    <Box
      bg="bg.surface"
      borderRadius="lg"
      borderWidth={isActive ? '2px' : '1px'}
      borderColor={isActive ? primaryColor : 'border.subtle'}
      p="3"
      cursor="pointer"
      tabIndex={0}
      aria-label={`Спрайт ${sprite.name} (${sprite.badge})`}
      aria-pressed={isActive}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      onClick={onSelect}
      transition="all 0.15s ease"
      _hover={{ borderColor: primaryColor }}
      position="relative"
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header */}
      <HStack justify="space-between" align="center" mb="2">
        <HStack gap="1.5">
          <Text fontWeight="bold" fontSize="xs" color="fg">
            {sprite.name}
          </Text>
        </HStack>
        <Badge
          size="xs"
          variant="surface"
          colorPalette={isClosed ? 'gray' : 'cyan'}
          fontSize="3xs"
          px="1.5"
          py="0.5"
        >
          {sprite.badge}
        </Badge>
      </HStack>

      {/* Canvas Mockup Preview */}
      <Box
        height="110px"
        width="100%"
        borderRadius="md"
        bg="bg.panel"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
        borderWidth="1px"
        borderColor="border.subtle"
      >
        {sprite.customDataUrl ? (
          <img
            src={sprite.customDataUrl}
            alt={sprite.name}
            style={{ maxHeight: '100px', objectFit: 'contain' }}
          />
        ) : (
          <svg viewBox="0 0 100 100" width="80" height="80" role="img">
            <title>{sprite.name}</title>
            {/* Outer Helmet */}
            <circle cx="50" cy="50" r="40" fill={bgColor} stroke={primaryColor} strokeWidth="2.5" />
            {/* Visor Area */}
            <rect
              x="22"
              y="28"
              width="56"
              height="46"
              rx="12"
              fill="#080F1F"
              stroke={primaryColor}
              strokeWidth="1.5"
            />

            {/* Expression Eyes */}
            {sprite.emotion === 'SHOCK' ? (
              <g>
                <circle cx="38" cy="46" r="8" fill="#FFFFFF" />
                <circle cx="62" cy="46" r="8" fill="#FFFFFF" />
                <circle cx="38" cy="46" r="3.5" fill="#080F1F" />
                <circle cx="62" cy="46" r="3.5" fill="#080F1F" />
              </g>
            ) : sprite.emotion === 'HYPE' ? (
              <g>
                <text x="29" y="52" fill="#FBBF24" fontSize="15" fontWeight="bold">
                  ★
                </text>
                <text x="55" y="52" fill="#FBBF24" fontSize="15" fontWeight="bold">
                  ★
                </text>
              </g>
            ) : sprite.emotion === 'EXPERT' ? (
              <g>
                <rect
                  x="28"
                  y="42"
                  width="44"
                  height="8"
                  rx="2"
                  fill={primaryColor}
                  opacity="0.8"
                />
                <circle cx="38" cy="46" r="2" fill="#FFFFFF" />
                <circle cx="62" cy="46" r="2" fill="#FFFFFF" />
              </g>
            ) : (
              <g>
                <circle cx="38" cy="46" r="3.5" fill="#FFFFFF" />
                <circle cx="62" cy="46" r="3.5" fill="#FFFFFF" />
              </g>
            )}

            {/* Mouth Phase */}
            {isClosed ? (
              <line
                x1="43"
                y1="62"
                x2="57"
                y2="62"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              <ellipse
                cx="50"
                cy="62"
                rx={sprite.emotion === 'SHOCK' ? 8 : 7}
                ry={sprite.emotion === 'SHOCK' ? 8 : 5}
                fill={sprite.emotion === 'SHOCK' ? '#EF4444' : '#F97316'}
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            )}
          </svg>
        )}

        {/* Small Overlay indicator */}
        <Box
          position="absolute"
          bottom="1"
          right="1"
          bg="rgba(0,0,0,0.7)"
          px="1.5"
          py="0.5"
          borderRadius="sm"
        >
          <Text fontSize="3xs" color="fg.muted">
            {isClosed ? 'Amp: 0.0' : 'Amp > -22dB'}
          </Text>
        </Box>
      </Box>

      {/* Description & Upload Trigger */}
      <VStack align="stretch" gap="1" mt="2">
        <Text fontSize="3xs" color="fg.muted" lineClamp={2}>
          {sprite.description}
        </Text>
        <HStack justify="space-between" align="center" mt="1">
          <Text fontSize="3xs" color="fg.muted" fontFamily="monospace">
            {sprite.filename}
          </Text>
          <Button
            size="2xs"
            variant="outline"
            colorPalette="gray"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            title={`Завантажити PNG для ${sprite.name}`}
            aria-label={`Завантажити PNG для ${sprite.name}`}
          >
            <Upload size={10} />
            PNG
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};
