import { Badge, Box, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react';
import type { ArtifactDomainModel } from '../model/types';

interface ArtifactCardProps {
  artifact: ArtifactDomainModel;
  isSelected?: boolean;
  onSelect?: (artifact: ArtifactDomainModel) => void;
}

export function ArtifactCard({ artifact, isSelected = false, onSelect }: ArtifactCardProps) {
  return (
    <Box
      p="4"
      borderRadius="xl"
      bg="bg.panel"
      borderWidth="1px"
      borderColor={isSelected ? 'teal.500' : 'border.subtle'}
      cursor={onSelect ? 'pointer' : 'default'}
      transition="all 0.2s"
      _hover={onSelect ? { borderColor: 'teal.400', transform: 'translateY(-2px)' } : undefined}
      onClick={() => onSelect?.(artifact)}
    >
      <Flex gap="4" align="center">
        <Box
          width="80px"
          height="80px"
          borderRadius="lg"
          overflow="hidden"
          flexShrink={0}
          bg="blackAlpha.400"
        >
          <Image
            src={artifact.previewImageUrl}
            alt={artifact.name}
            width="100%"
            height="100%"
            objectFit="cover"
          />
        </Box>

        <VStack align="stretch" gap="1" flex="1">
          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="md" color="fg" lineClamp={1}>
              {artifact.name}
            </Text>
            <Badge
              colorPalette={artifact.celestialBody === 'mars' ? 'red' : 'blue'}
              size="sm"
              variant="subtle"
            >
              {artifact.celestialBody.toUpperCase()}
            </Badge>
          </HStack>

          <Text fontSize="xs" color="fg.muted">
            {artifact.missionName}
          </Text>

          <HStack gap="2" pt="1">
            <Badge variant="outline" size="xs">
              {artifact.artifactType}
            </Badge>
            {artifact.telemetry?.sol && (
              <Badge colorPalette="yellow" variant="subtle" size="xs">
                SOL {artifact.telemetry.sol}
              </Badge>
            )}
            {artifact.model3dGlbUrl && (
              <Badge colorPalette="teal" variant="solid" size="xs">
                3D GLB
              </Badge>
            )}
          </HStack>
        </VStack>
      </Flex>
    </Box>
  );
}
