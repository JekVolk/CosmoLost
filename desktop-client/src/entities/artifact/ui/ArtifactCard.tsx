import { Badge, Box, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import type { ArtifactDomainModel } from '../model/types';

interface ArtifactCardProps {
  artifact: ArtifactDomainModel;
  isSelected?: boolean;
  onSelect?: (artifact: ArtifactDomainModel) => void;
}

const TYPE_TRANSLATIONS: Record<string, string> = {
  RETRO_REFLECTOR: 'Ретрорефлектор',
  DESCENT_STAGE: 'Спускний ступінь',
  LANDER: 'Посадковий модуль',
  HELICOPTER: 'Гелікоптер',
  ROVER: 'Марсохід',
  INSTRUMENT: 'Науковий прилад',
  DEBRIS: 'Уламки',
};

const OFFICIAL_FALLBACK_IMAGES: Record<string, string> = {
  'apollo-11-lrr': 'https://images-assets.nasa.gov/image/6900957/6900957~medium.jpg',
  'apollo-11-descent-stage':
    'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
  'apollo-11-lm-eagle': 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
  'insight-lander': 'https://images-assets.nasa.gov/image/PIA23014/PIA23014~thumb.jpg',
  'ingenuity-helicopter': 'https://images-assets.nasa.gov/image/PIA24836/PIA24836~medium.jpg',
  'opportunity-rover': 'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg',
  'sojourner-rover': 'https://images-assets.nasa.gov/image/PIA01120/PIA01120~medium.jpg',
  'spirit-rover': 'https://images-assets.nasa.gov/image/PIA03253/PIA03253~medium.jpg',
};

export function ArtifactCard({ artifact, isSelected = false, onSelect }: ArtifactCardProps) {
  const isMars = artifact.celestialBody === 'mars';
  const typeLabel = TYPE_TRANSLATIONS[artifact.artifactType] || artifact.artifactType;
  const fallbackUrl =
    OFFICIAL_FALLBACK_IMAGES[artifact.id] ||
    (isMars
      ? 'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg'
      : 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg');

  const [currentImgSrc, setCurrentImgSrc] = useState(artifact.previewImageUrl || fallbackUrl);

  return (
    <Box
      p="2.5"
      borderRadius="lg"
      bg={isSelected ? 'bg.subtle' : 'bg.panel'}
      borderWidth="1.5px"
      borderColor={isSelected ? 'teal.500' : 'border.subtle'}
      cursor={onSelect ? 'pointer' : 'default'}
      transition="all 0.16s ease"
      position="relative"
      _hover={
        onSelect
          ? {
              borderColor: isSelected ? 'teal.400' : 'border.emphasized',
              transform: 'translateY(-1px)',
              shadow: 'sm',
            }
          : undefined
      }
      onClick={() => onSelect?.(artifact)}
      boxSizing="border-box"
    >
      {isSelected && (
        <Box
          position="absolute"
          top="1.5"
          right="1.5"
          bg="teal.500"
          color="white"
          borderRadius="full"
          p="0.5"
          display="flex"
          alignItems="center"
          justifyContent="center"
          shadow="sm"
        >
          <Check size={11} strokeWidth={3} />
        </Box>
      )}

      <Flex gap="2.5" align="center">
        {/* Real NASA Photo Thumbnail */}
        <Box
          width="50px"
          height="50px"
          borderRadius="md"
          overflow="hidden"
          flexShrink={0}
          bg="blackAlpha.800"
          borderWidth="1px"
          borderColor="border.subtle"
        >
          <Image
            src={currentImgSrc}
            alt={artifact.name}
            width="100%"
            height="100%"
            objectFit="cover"
            loading="lazy"
            onError={() => {
              if (currentImgSrc !== fallbackUrl) {
                setCurrentImgSrc(fallbackUrl);
              }
            }}
          />
        </Box>

        <VStack align="stretch" gap="0.5" flex="1" minWidth="0">
          <Text
            fontWeight="semibold"
            fontSize="xs"
            color="fg"
            lineClamp={2}
            lineHeight="1.2"
            title={artifact.name}
          >
            {artifact.name}
          </Text>

          <Text fontSize="2xs" color="fg.muted" lineClamp={1}>
            {artifact.missionName}
          </Text>

          <HStack gap="1.5" pt="0.5" wrap="wrap">
            <Badge
              colorPalette={isMars ? 'red' : 'blue'}
              size="xs"
              variant="subtle"
              px="2.5"
              py="0.5"
              borderRadius="md"
              fontWeight="semibold"
            >
              {isMars ? '🔴 Марс' : '⚪ Місяць'}
            </Badge>

            <Badge
              variant="outline"
              size="xs"
              px="2.5"
              py="0.5"
              borderRadius="md"
              colorPalette="gray"
            >
              {typeLabel}
            </Badge>

            {artifact.lastContactSol && (
              <Badge
                colorPalette="yellow"
                variant="subtle"
                size="xs"
                px="2"
                py="0.5"
                borderRadius="md"
              >
                SOL {artifact.lastContactSol}
              </Badge>
            )}
          </HStack>
        </VStack>
      </Flex>
    </Box>
  );
}
