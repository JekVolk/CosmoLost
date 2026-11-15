import { useMatchStore } from '@/entities/game';
import { Badge, Box, Button, HStack, Heading, Text, VStack } from '@chakra-ui/react';
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

  useEffect(() => {
    if (isVisible) {
      setStage('shaking');
      const timer = setTimeout(() => {
        setStage('revealed');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  // Graceful fallback reward data if none provided by parent props
  const defaultArtifact: UnlockedArtifact = {
    id: 'unknown_artifact',
    name: 'Камера навігації NavCam',
    description: 'Оптичний сенсор високої чіткості для картографування поверхні.',
    equipment_class: 'Оптика & Навігація',
    rarity: 'SPECIALIZED',
  };

  const activeArtifact = reward?.artifact || defaultArtifact;
  const rarityInfo = RARITY_COLORS[activeArtifact.rarity] || {
    hex: '#3182CE',
    colorScheme: 'blue',
  };

  const handlePlayAgain = () => {
    resetMatch();
    onPlayAgain?.();
  };

  const handleGoToProfile = () => {
    resetMatch();
    onGoToProfile?.();
  };

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
              Відкриття контейнера...
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
              <Text fontSize="5xl" aria-label="Контейнер">
                📦
              </Text>
            </motion.div>
            <Text color="gray.400" fontSize="sm">
              Зняття захисних пломб контейнера...
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
                Новий артефакт розблоковано!
              </Heading>

              {/* Artifact visual placeholder with rarity glow */}
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
              >
                {/* SVG Visual Placeholder / Cue for real 3D model */}
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={rarityInfo.hex}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <Text
                  fontSize="2xs"
                  color="gray.500"
                  mt={2}
                  letterSpacing="wider"
                  textTransform="uppercase"
                >
                  3D ARTIFACT
                </Text>
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
                <Text fontSize="xs" color="blue.300">
                  {activeArtifact.equipment_class}
                </Text>
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
                  <Text color="yellow.300" fontSize="xs" fontWeight="medium">
                    +{reward.rp_gained || 50} RP (Дублікат перетворено на Дослідницькі Бали)
                  </Text>
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
                    Знято 50% пломби контейнера! Зіграйте ще один переможний раунд для відкриття.
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
                  До профілю
                </Button>
                <Button flex={1} colorPalette="blue" variant="solid" onClick={handlePlayAgain}>
                  Грати ще
                </Button>
              </HStack>
            </VStack>
          </motion.div>
        )}
      </VStack>
    </Box>
  );
};
