import { useMatchStore } from '@/entities/game';
import { Box, Flex, VStack } from '@chakra-ui/react';
import type React from 'react';
import { MiniGameRenderer } from './MiniGameRenderer';
import { OpponentProgress } from './OpponentProgress';
import { RoundResultOverlay } from './RoundResultOverlay';
import { ScoreHUD } from './ScoreHUD';

export interface BattleArenaProps {
  onContinueRound?: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ onContinueRound }) => {
  const phase = useMatchStore((s) => s.phase);
  const setPhase = useMatchStore((s) => s.setPhase);

  const handleContinue = () => {
    if (onContinueRound) {
      onContinueRound();
    } else {
      setPhase('ROUND_ACTIVE');
    }
  };

  return (
    <Flex
      direction="column"
      w="100%"
      h="100%"
      minH="calc(100vh - 64px)"
      bg="#070A13"
      position="relative"
      overflow="hidden"
    >
      {/* Top HUD with Score and Countdown */}
      <ScoreHUD />

      {/* Opponent Progress indicator */}
      <Box px={4} pt={2} pb={1}>
        <OpponentProgress />
      </Box>

      {/* Main Mini-Game Canvas / Active Zone */}
      <Box flex="1" p={{ base: 2, md: 4 }} display="flex" flexDirection="column">
        <VStack flex="1" w="100%" maxW="1200px" mx="auto" align="stretch">
          <MiniGameRenderer />
        </VStack>
      </Box>

      {/* Round Result Overlay */}
      {phase === 'ROUND_RESULT' && <RoundResultOverlay onContinue={handleContinue} />}
    </Flex>
  );
};
