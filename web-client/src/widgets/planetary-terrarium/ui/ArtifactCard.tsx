import { RarityBadge } from '@/shared/ui';
import { Badge, Box, Button, HStack, Portal, Text, VStack } from '@chakra-ui/react';
import { Compass, Globe, Quote, X } from 'lucide-react';
import type React from 'react';
import type { TerrariumArtifact } from '../model/usePlanetaryTerrarium';

export interface ArtifactCardProps {
  artifact: TerrariumArtifact | null;
  onClose: () => void;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, onClose }) => {
  if (!artifact) return null;

  return (
    <Portal>
      <Box
        position="fixed"
        inset={0}
        zIndex={100}
        bg="blackAlpha.700"
        backdropFilter="blur(6px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
        onClick={onClose}
      >
        <Box
          bg="gray.900"
          borderWidth="1px"
          borderColor="cyan.600"
          borderRadius="xl"
          maxW="560px"
          w="100%"
          p={{ base: 4, md: 6 }}
          boxShadow="0 0 30px rgba(0, 240, 255, 0.25)"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <HStack justify="space-between" align="flex-start" mb={4}>
            <VStack align="flex-start" gap={1}>
              <HStack gap={2}>
                <Text fontSize="xl" fontWeight="black" color="white">
                  {artifact.name}
                </Text>
                {artifact.rarity && <RarityBadge rarity={artifact.rarity} size="sm" />}
              </HStack>
              <Text fontSize="xs" color="gray.400" textTransform="uppercase">
                {artifact.equipment_class ?? 'Planetary Artifact'}
              </Text>
            </VStack>

            <Button
              size="xs"
              variant="ghost"
              color="gray.400"
              _hover={{ color: 'white' }}
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </HStack>

          {/* Location details */}
          <HStack
            gap={4}
            p={3}
            bg="whiteAlpha.050"
            borderRadius="md"
            mb={4}
            color="cyan.300"
            fontSize="xs"
            fontFamily="mono"
          >
            <HStack gap={1}>
              <Globe size={14} />
              <Text>Lat: {artifact.latitude.toFixed(4)}°</Text>
            </HStack>
            <HStack gap={1}>
              <Compass size={14} />
              <Text>Lon: {artifact.longitude.toFixed(4)}°</Text>
            </HStack>
          </HStack>

          {/* First person monologue */}
          {artifact.first_person_monologue && (
            <Box
              p={4}
              bg="rgba(0, 240, 255, 0.04)"
              borderLeftWidth="3px"
              borderLeftColor="cyan.400"
              borderRadius="sm"
              mb={4}
            >
              <HStack gap={2} mb={1} color="cyan.400">
                <Quote size={14} />
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                  First-Person Monologue
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.200" fontStyle="italic" lineHeight="tall">
                &ldquo;{artifact.first_person_monologue}&rdquo;
              </Text>
            </Box>
          )}

          {/* Cause of deactivation */}
          {artifact.cause_of_deactivation && (
            <Box
              p={3}
              bg="rgba(237, 137, 54, 0.08)"
              borderLeftWidth="3px"
              borderLeftColor="orange.400"
              borderRadius="sm"
              mb={4}
            >
              <Text
                fontSize="xs"
                fontWeight="bold"
                color="orange.400"
                textTransform="uppercase"
                mb={1}
              >
                Cause of Deactivation
              </Text>
              <Text fontSize="xs" color="gray.300">
                {artifact.cause_of_deactivation}
              </Text>
            </Box>
          )}

          {/* Footer details */}
          <HStack
            justify="space-between"
            pt={2}
            borderTopWidth="1px"
            borderTopColor="whiteAlpha.100"
          >
            <Badge size="xs" colorPalette="gray" variant="outline">
              ID: {artifact.id}
            </Badge>
            <Button size="sm" colorPalette="cyan" variant="outline" onClick={onClose}>
              Dismiss Dossier
            </Button>
          </HStack>
        </Box>
      </Box>
    </Portal>
  );
};
