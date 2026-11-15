import { useMatchStore } from '@/entities/game';
import { Badge, Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react';
import type React from 'react';

export interface RoundResultOverlayProps {
  onContinue?: () => void;
  correctAnswerText?: string;
  myRoundScore?: number;
  opponentRoundScore?: number;
  eloDelta?: number;
}

export const RoundResultOverlay: React.FC<RoundResultOverlayProps> = ({
  onContinue,
  correctAnswerText,
  myRoundScore = 85,
  opponentRoundScore = 60,
  eloDelta = 12,
}) => {
  const currentRound = useMatchStore((s) => s.current_round);
  const myTotalScore = useMatchStore((s) => s.my_score);
  const oppTotalScore = useMatchStore((s) => s.opponent_score);
  const opponent = useMatchStore((s) => s.opponent);

  const isWin = myRoundScore >= opponentRoundScore;
  const roundNum = currentRound?.round_index ?? 1;

  return (
    <Box
      position="absolute"
      inset={0}
      zIndex={50}
      bg="rgba(5, 8, 16, 0.88)"
      backdropFilter="blur(12px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '520px' }}
      >
        <Box
          bg="gray.900"
          borderWidth="1px"
          borderColor={isWin ? 'cyan.500' : 'orange.500'}
          borderRadius="xl"
          boxShadow="0 0 35px rgba(0, 240, 255, 0.2)"
          overflow="hidden"
          p={{ base: 5, md: 8 }}
        >
          <VStack gap={5} align="stretch" textAlign="center">
            {/* Header */}
            <VStack gap={1}>
              <Badge
                colorPalette={isWin ? 'cyan' : 'orange'}
                size="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                Round {roundNum} Concluded
              </Badge>
              <Text fontSize="2xl" fontWeight="black" color="white" mt={1}>
                {isWin ? 'Telemetry Acquired!' : 'Signal Degraded'}
              </Text>
            </VStack>

            {/* Scores comparison */}
            <Flex
              justify="space-around"
              align="center"
              bg="whiteAlpha.050"
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
            >
              <VStack gap={0}>
                <Text fontSize="xs" color="gray.400" textTransform="uppercase">
                  Your Score
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="cyan.400" fontFamily="mono">
                  +{myRoundScore}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Total: {myTotalScore}
                </Text>
              </VStack>

              <Box h="40px" w="1px" bg="whiteAlpha.200" />

              <VStack gap={0}>
                <Text fontSize="xs" color="gray.400" textTransform="uppercase">
                  {opponent?.callsign ?? 'Opponent'}
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="orange.400" fontFamily="mono">
                  +{opponentRoundScore}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Total: {oppTotalScore}
                </Text>
              </VStack>
            </Flex>

            {/* Answer disclosure */}
            {correctAnswerText && (
              <Box
                p={3}
                bg="blueAlpha.100"
                borderWidth="1px"
                borderColor="blueAlpha.300"
                borderRadius="md"
                textAlign="left"
              >
                <HStack gap={2} mb={1} color="blue.300">
                  <CheckCircle2 size={16} />
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                    Target Identification
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.200">
                  {correctAnswerText}
                </Text>
              </Box>
            )}

            {/* ELO projection */}
            <HStack justify="center" gap={2} color="green.400" fontSize="sm" fontWeight="semibold">
              <TrendingUp size={16} />
              <Text>Estimated Rating Delta: +{eloDelta} ELO</Text>
            </HStack>

            {/* Action */}
            {onContinue && (
              <Button colorPalette="cyan" size="lg" w="100%" onClick={onContinue}>
                Continue <ChevronRight size={18} />
              </Button>
            )}
          </VStack>
        </Box>
      </motion.div>
    </Box>
  );
};
