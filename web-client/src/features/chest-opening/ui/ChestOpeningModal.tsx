import { useMatchStore } from '@/entities/game';
import {
  RP_TOKEN_ICON_URL,
  getContainerIconUrl,
  getEquipmentIconUrl,
  getRarityBadgeIconUrl,
  playSfx,
} from '@/shared/lib';
import { Badge, Box, Button, HStack, Heading, Image, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useState } from 'react';

const RARITY_COLORS: Record<string, { hex: string; colorScheme: string }> = {
  SCRAP: { hex: '#718096', colorScheme: 'gray' },
  STANDARD: { hex: '#CBD5E0', colorScheme: 'gray' },
  SPECIALIZED: { hex: '#38A169', colorScheme: 'green' },
  PROTOTYPE: { hex: '#3182CE', colorScheme: 'blue' },
  AUTONOMOUS: { hex: '#805AD5', colorScheme: 'purple' },
  HISTORIC: { hex: '#D69E2E', colorScheme: 'yellow' },
  ANOMALY: { hex: '#E53E3E', colorScheme: 'red' },
};

export interface UnlockedArtifact {
  id: string;
  name: string;
  description: string;
  equipment_class: string;
  rarity: string;
  image_url?: string | null;
}

export interface ChestReward {
  artifact?: UnlockedArtifact;
  is_duplicate?: boolean;
  rp_gained?: number;
  seal_progress?: number;
}

interface ChestOpeningModalProps {
  isOpen?: boolean;
  reward?: ChestReward | null;
  onGoToProfile?: () => void;
  onPlayAgain?: () => void;
}

export const ChestOpeningModal: React.FC<ChestOpeningModalProps> = ({
  isOpen,
  reward,
  onGoToProfile,
  onPlayAgain,
}) => {
  const phase = useMatchStore((s) => s.phase);
  const chestEarned = useMatchStore((s) => s.chest_earned);
  const resetMatch = useMatchStore((s) => s.reset);

  const [stage, setStage] = useState<'shaking' | 'revealed'>('shaking');

  const isVisible = isOpen !== undefined ? isOpen : phase === 'MATCH_END' && chestEarned;

  // Graceful fallback reward data if none provided by parent props
  const defaultArtifact: UnlockedArtifact = {
    id: 'unknown_artifact',
    name: 'NavCam Navigation Camera',
    description: 'High-resolution optical sensor for surface mapping.',
    equipment_class: 'Optics & Navigation',
    rarity: 'SPECIALIZED',
  };

  const activeArtifact = reward?.artifact || defaultArtifact;
  const rarityInfo = RARITY_COLORS[activeArtifact.rarity] || {
    hex: '#3182CE',
    colorScheme: 'blue',
  };

  useEffect(() => {
    if (isVisible) {
      setStage('shaking');
      playSfx('chest_click');

      const timer = setTimeout(() => {
        setStage('revealed');
        const isHighTier =
          activeArtifact.rarity === 'HISTORIC' || activeArtifact.rarity === 'ANOMALY';
        playSfx(isHighTier ? 'chest_open_historic' : 'chest_open_common');
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isVisible, activeArtifact.rarity]);

  if (!isVisible) return null;

  const handlePlayAgain = () => {
    resetMatch();
    onPlayAgain?.();
  };

  const handleGoToProfile = () => {
    resetMatch();
    onGoToProfile?.();
  };

  const containerImg = getContainerIconUrl(
    activeArtifact.rarity === 'ANOMALY'
      ? 'alien_anomaly'
      : activeArtifact.rarity === 'HISTORIC'
        ? 'deep_space'
        : 'standard',
    false,
  );

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1500}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0, 0, 0, 0.85)"
      backdropFilter="blur(10px)"
      p={4}
    >
      <VStack gap={6} maxW="460px" w="100%" textAlign="center">
        {stage === 'shaking' ? (
          <VStack gap={4}>
            <Heading size="lg" color="yellow.400">
              Opening Container...
            </Heading>
            <motion.div
              animate={{
                rotate: [0, -8, 8, -8, 8, -4, 4, 0],
                x: [0, -6, 6, -6, 6, -3, 3, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1,
                ease: 'easeInOut',
                repeat: 1,
              }}
              style={{
                width: 140,
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2D3748, #1A202C)',
                borderRadius: '16px',
                border: '2px solid #ECC94B',
                boxShadow: '0 0 24px rgba(236, 201, 75, 0.4)',
              }}
            >
              <Image
                src={containerImg}
                alt="Container"
                width="100px"
                height="100px"
                objectFit="contain"
              />
            </motion.div>
            <Text color="gray.400" fontSize="sm">
              Removing the container's protective seals...
            </Text>
          </VStack>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ width: '100%' }}
          >
            <VStack
              gap={5}
              p={6}
              bg="gray.900"
              borderRadius="2xl"
              border="2px solid"
              borderColor={rarityInfo.hex}
              boxShadow={`0 0 40px ${rarityInfo.hex}55`}
              w="100%"
            >
              <Heading size="md" color="white">
                New Artifact Unlocked!
              </Heading>

              {/* Artifact visual asset with rarity glow */}
              <Box
                w="160px"
                h="160px"
                borderRadius="xl"
                bg="gray.950"
                border="1px solid"
                borderColor={rarityInfo.hex}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                position="relative"
                overflow="hidden"
                boxShadow={`inset 0 0 20px ${rarityInfo.hex}33`}
                p={3}
              >
                {activeArtifact.image_url ? (
                  <Image
                    src={activeArtifact.image_url}
                    alt={activeArtifact.name}
                    maxH="130px"
                    maxW="130px"
                    objectFit="contain"
                  />
                ) : (
                  <VStack gap={2}>
                    <Image
                      src={getRarityBadgeIconUrl(activeArtifact.rarity)}
                      alt={activeArtifact.rarity}
                      width="64px"
                      height="64px"
                      objectFit="contain"
                    />
                    <Text
                      fontSize="2xs"
                      color="gray.400"
                      letterSpacing="wider"
                      textTransform="uppercase"
                    >
                      3D ARTIFACT
                    </Text>
                  </VStack>
                )}
              </Box>

              <VStack gap={2}>
                <Badge
                  bg={rarityInfo.hex}
                  color="black"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontWeight="bold"
                  fontSize="xs"
                >
                  {activeArtifact.rarity}
                </Badge>
                <Heading size="lg" color="white">
                  {activeArtifact.name}
                </Heading>
                <HStack gap={1.5} align="center">
                  <Image
                    src={getEquipmentIconUrl(activeArtifact.equipment_class)}
                    alt=""
                    width="16px"
                    height="16px"
                    objectFit="contain"
                  />
                  <Text fontSize="xs" color="blue.300">
                    {activeArtifact.equipment_class}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.300">
                  {activeArtifact.description}
                </Text>
              </VStack>

              {/* Duplicate or Seal progress notices */}
              {reward?.is_duplicate && (
                <Box
                  w="100%"
                  p={3}
                  bg="yellow.950"
                  border="1px solid"
                  borderColor="yellow.600"
                  borderRadius="md"
                >
                  <HStack justify="center" gap={2}>
                    <Image src={RP_TOKEN_ICON_URL} alt="RP Token" width="20px" height="20px" />
                    <Text color="yellow.300" fontSize="xs" fontWeight="medium">
                      +{reward.rp_gained || 50} RP (Duplicate converted to Research Points)
                    </Text>
                  </HStack>
                </Box>
              )}

              {reward?.seal_progress === 50 && (
                <Box
                  w="100%"
                  p={3}
                  bg="blue.950"
                  border="1px solid"
                  borderColor="blue.600"
                  borderRadius="md"
                >
                  <Text color="blue.300" fontSize="xs">
                    50% of the container seal has been removed! Win one more round to open it.
                  </Text>
                </Box>
              )}

              {/* Action buttons */}
              <HStack gap={3} w="100%" pt={2}>
                <Button
                  flex={1}
                  variant="outline"
                  borderColor="gray.600"
                  color="gray.200"
                  onClick={handleGoToProfile}
                >
                  Go to Profile
                </Button>
                <Button flex={1} colorPalette="blue" variant="solid" onClick={handlePlayAgain}>
                  Play Again
                </Button>
              </HStack>
            </VStack>
          </motion.div>
        )}
      </VStack>
    </Box>
  );
};
