import { useMatchStore } from '@/entities/game';
import { useAuthStore } from '@/entities/user';
import { ELO_RANK_CADET_ICON_URL } from '@/shared/lib';
import { Badge, Box, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { Bot, Swords, User } from 'lucide-react';
import type React from 'react';
import { RoundTimer } from './RoundTimer';

export interface ScoreHUDProps {
  totalRounds?: number;
}

export const ScoreHUD: React.FC<ScoreHUDProps> = ({ totalRounds = 3 }) => {
  const user = useAuthStore((s) => s.user);
  const opponent = useMatchStore((s) => s.opponent);
  const myScore = useMatchStore((s) => s.my_score);
  const opponentScore = useMatchStore((s) => s.opponent_score);
  const currentRound = useMatchStore((s) => s.current_round);

  const playerCallsign = user?.callsign ?? 'Commander';
  const playerElo = user?.elo_rating ?? 1000;

  const opponentCallsign = opponent?.callsign ?? 'Awaiting Opponent';
  const opponentElo = opponent?.elo ?? 1000;
  const isBot = opponent?.is_bot ?? false;

  const roundNum = currentRound?.round_index ?? 1;

  return (
    <Box
      w="100%"
      bg="rgba(11, 15, 25, 0.85)"
      backdropFilter="blur(8px)"
      borderBottomWidth="1px"
      borderBottomColor="cyan.900"
      px={{ base: 3, md: 6 }}
      py={3}
    >
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto" wrap="wrap" gap={3}>
        {/* Player Info */}
        <HStack gap={3} flex="1" minW="160px" justify="flex-start">
          <Box
            p={2}
            borderRadius="full"
            bg="blue.950"
            borderWidth="1px"
            borderColor="blue.500"
            color="blue.300"
          >
            <User size={18} />
          </Box>
          <VStack align="flex-start" gap={0}>
            <HStack gap={2}>
              <Text fontWeight="bold" fontSize="sm" color="gray.100">
                {playerCallsign}
              </Text>
              <Badge colorPalette="blue" size="xs">
                YOU
              </Badge>
            </HStack>
            <HStack gap={1} align="center">
              <Image src={ELO_RANK_CADET_ICON_URL} alt="Rank" width="13px" height="13px" />
              <Text fontSize="xs" color="gray.400" fontFamily="mono">
                ELO {playerElo}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        {/* Center: Round & Score & Timer */}
        <VStack gap={1} align="center" px={4}>
          <HStack gap={2} align="center">
            <Badge colorPalette="cyan" variant="outline" size="sm">
              Round {roundNum} / {totalRounds}
            </Badge>
            <RoundTimer />
          </HStack>
          <HStack gap={4} align="center">
            <Text
              fontSize="2xl"
              fontWeight="black"
              fontFamily="mono"
              color={myScore >= opponentScore ? 'cyan.400' : 'gray.400'}
            >
              {myScore}
            </Text>
            <Box color="gray.500">
              <Swords size={18} />
            </Box>
            <Text
              fontSize="2xl"
              fontWeight="black"
              fontFamily="mono"
              color={opponentScore >= myScore ? 'orange.400' : 'gray.400'}
            >
              {opponentScore}
            </Text>
          </HStack>
        </VStack>

        {/* Opponent Info */}
        <HStack gap={3} flex="1" minW="160px" justify="flex-end">
          <VStack align="flex-end" gap={0}>
            <HStack gap={2}>
              {isBot && (
                <Badge colorPalette="purple" size="xs">
                  AI SIM
                </Badge>
              )}
              <Text fontWeight="bold" fontSize="sm" color="gray.100">
                {opponentCallsign}
              </Text>
            </HStack>
            <HStack gap={1} align="center">
              <Image src={ELO_RANK_CADET_ICON_URL} alt="Rank" width="13px" height="13px" />
              <Text fontSize="xs" color="gray.400" fontFamily="mono">
                ELO {opponentElo}
              </Text>
            </HStack>
          </VStack>
          <Box
            p={2}
            borderRadius="full"
            bg="orange.950"
            borderWidth="1px"
            borderColor="orange.500"
            color="orange.300"
          >
            {isBot ? <Bot size={18} /> : <User size={18} />}
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
};
