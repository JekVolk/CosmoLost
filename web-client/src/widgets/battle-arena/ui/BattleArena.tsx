import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useMatchStore } from '@/entities/game';
import { AstroGuessrGame } from '@/features/astro-guessr';
import { ForensicSolGame } from '@/features/forensic-sol';
import { MissionHangarGame } from '@/features/mission-hangar';

export const BattleArena: React.FC = () => {
  const { currentRound, timerSec, myScore, opponentScore, opponent } = useMatchStore();

  return (
    <VStack gap={4} align="stretch">
      <HStack justify="space-between" p={4} bg="#111622" borderRadius="md" border="1px solid #1F293D">
        <Text fontWeight="bold">Ви: {myScore} pts</Text>
        <Text color="cyan.400" fontSize="xl">⏱️ 00:{timerSec < 10 ? `0${timerSec}` : timerSec}</Text>
        <Text fontWeight="bold">{opponent?.callsign || 'Суперник'}: {opponentScore} pts</Text>
      </HStack>

      <Box minH="350px">
        {currentRound?.mini_game === 'astro_guessr' && <AstroGuessrGame payload={currentRound.payload} />}
        {currentRound?.mini_game === 'forensic_sol' && <ForensicSolGame payload={currentRound.payload} />}
        {currentRound?.mini_game === 'mission_hangar' && <MissionHangarGame payload={currentRound.payload} />}
        {!currentRound && <Text textAlign="center" color="gray.500">Очікування початку раунду...</Text>}
      </Box>
    </VStack>
  );
};
