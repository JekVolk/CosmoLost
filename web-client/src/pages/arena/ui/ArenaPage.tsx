import { useMatchStore } from '@/entities/game';
import { useAuthStore } from '@/entities/user';
import { ChestOpeningModal } from '@/features/chest-opening';
import { MatchmakingModal, useMatchmaking } from '@/features/matchmaking';
import { BattleArena } from '@/widgets/battle-arena';
import { Badge, Box, Button, Flex, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, Play, RotateCcw, Swords, User } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

export const ArenaPage: React.FC = () => {
  const navigate = useNavigate();
  const phase = useMatchStore((s) => s.phase);
  const resetMatch = useMatchStore((s) => s.reset);
  const myScore = useMatchStore((s) => s.my_score);
  const opponentScore = useMatchStore((s) => s.opponent_score);
  const opponent = useMatchStore((s) => s.opponent);
  const chestEarned = useMatchStore((s) => s.chest_earned);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const { startMatchmaking, isLoading } = useMatchmaking();

  const handleStartMatch = () => {
    if (!token) {
      navigate('/login', { state: { from: { pathname: '/arena' } } });
      return;
    }
    startMatchmaking(0);
  };

  const handlePlayAgain = () => {
    resetMatch();
    if (!token) {
      navigate('/login', { state: { from: { pathname: '/arena' } } });
      return;
    }
    startMatchmaking(0);
  };

  const handleGoToProfile = () => {
    resetMatch();
    navigate(`/profile/${user?.callsign ?? 'Commander'}`);
  };

  const handleReturnHome = () => {
    resetMatch();
    navigate('/game');
  };

  const isWin = myScore >= opponentScore;

  // Active match rendering
  if (phase === 'IN_MATCH' || phase === 'ROUND_ACTIVE' || phase === 'ROUND_RESULT') {
    return <BattleArena />;
  }

  // Post match summary (MATCH_END)
  if (phase === 'MATCH_END') {
    return (
      <Box
        w="100%"
        minH="100vh"
        bg="#070A13"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        {/* Chest opening modal if unlocked */}
        {chestEarned && (
          <ChestOpeningModal
            isOpen={true}
            onGoToProfile={handleGoToProfile}
            onPlayAgain={handlePlayAgain}
          />
        )}

        <Box
          maxW="600px"
          w="100%"
          bg="gray.900"
          borderWidth="1px"
          borderColor={isWin ? 'cyan.500' : 'orange.500'}
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          boxShadow="0 0 35px rgba(0, 240, 255, 0.2)"
          textAlign="center"
        >
          <VStack gap={6} align="stretch">
            <VStack gap={2}>
              <Badge
                colorPalette={isWin ? 'cyan' : 'orange'}
                size="lg"
                px={4}
                py={1}
                borderRadius="full"
              >
                Match Completed
              </Badge>
              <Heading size="2xl" color="white" fontWeight="black">
                {isWin ? 'VICTORY' : 'MISSION ABORTED'}
              </Heading>
              <Text fontSize="sm" color="gray.400">
                {isWin
                  ? 'Telemetry synchronization complete. Container seals updated.'
                  : 'Telemetry link was lost before full consensus.'}
              </Text>
            </VStack>

            {/* Scorecard */}
            <Flex
              justify="space-around"
              align="center"
              p={4}
              bg="whiteAlpha.050"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
            >
              <VStack gap={1}>
                <Text fontSize="xs" color="gray.400" textTransform="uppercase">
                  You ({user?.callsign ?? 'Commander'})
                </Text>
                <Text fontSize="4xl" fontWeight="black" color="cyan.400" fontFamily="mono">
                  {myScore}
                </Text>
              </VStack>

              <Box color="gray.600">
                <Swords size={24} />
              </Box>

              <VStack gap={1}>
                <Text fontSize="xs" color="gray.400" textTransform="uppercase">
                  {opponent?.callsign ?? 'Opponent'}
                </Text>
                <Text fontSize="4xl" fontWeight="black" color="orange.400" fontFamily="mono">
                  {opponentScore}
                </Text>
              </VStack>
            </Flex>

            {/* Actions */}
            <HStack gap={3} justify="center">
              <Button colorPalette="cyan" size="lg" onClick={handlePlayAgain}>
                <RotateCcw size={18} /> Play Again
              </Button>
              <Button variant="outline" colorPalette="gray" size="lg" onClick={handleGoToProfile}>
                <User size={18} /> View Profile
              </Button>
            </HStack>

            <Button variant="ghost" size="sm" color="gray.400" onClick={handleReturnHome}>
              Return to Command Center
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  // IDLE or SEARCHING
  return (
    <Box
      w="100%"
      minH="100vh"
      bg="#070A13"
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      position="relative"
    >
      {/* Matchmaking modal when searching */}
      {phase === 'SEARCHING' && <MatchmakingModal isOpen={true} />}

      <Box
        maxW="680px"
        w="100%"
        bg="rgba(15, 23, 42, 0.75)"
        backdropFilter="blur(10px)"
        borderWidth="1px"
        borderColor="cyan.900"
        borderRadius="2xl"
        p={{ base: 6, md: 10 }}
        boxShadow="0 4px 40px rgba(0, 0, 0, 0.6)"
      >
        <VStack gap={6} align="stretch" textAlign="center">
          <Button
            variant="ghost"
            size="sm"
            color="gray.400"
            alignSelf="flex-start"
            onClick={() => navigate('/game')}
          >
            <ArrowLeft size={16} /> Command Center
          </Button>

          <VStack gap={2}>
            <Box
              p={4}
              borderRadius="full"
              bg="cyan.950"
              borderWidth="1px"
              borderColor="cyan.500"
              color="cyan.400"
              w="fit-content"
              mx="auto"
            >
              <Swords size={32} />
            </Box>
            <Heading size="xl" fontWeight="black" color="white">
              CosmoLost Battle Arena
            </Heading>
            <Text fontSize="sm" color="gray.400" maxW="480px" mx="auto">
              Real-time competitive planetary telemetry challenges: AstroGuessr, ForensicSol, and
              MissionHangar.
            </Text>
          </VStack>

          {/* Rules overview */}
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            gap={3}
            p={4}
            bg="whiteAlpha.050"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            textAlign="left"
          >
            <VStack align="flex-start" flex="1" gap={1}>
              <Text fontSize="xs" fontWeight="bold" color="cyan.300" textTransform="uppercase">
                3 Competitive Rounds
              </Text>
              <Text fontSize="xs" color="gray.300">
                0–100 score per round. Zero-knowledge reveal occurs when both players submit
                answers.
              </Text>
            </VStack>
            <VStack align="flex-start" flex="1" gap={1}>
              <Text fontSize="xs" fontWeight="bold" color="cyan.300" textTransform="uppercase">
                Container Rewards
              </Text>
              <Text fontSize="xs" color="gray.300">
                Victory unlocks container seals for rare artifact discoveries and engineering scrap.
              </Text>
            </VStack>
          </Flex>

          <Button
            colorPalette="cyan"
            size="xl"
            py={7}
            fontSize="lg"
            fontWeight="black"
            onClick={handleStartMatch}
            loading={isLoading}
            boxShadow="0 0 30px rgba(0, 240, 255, 0.4)"
          >
            <Play size={20} fill="currentColor" />
            FIND MATCH
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};
