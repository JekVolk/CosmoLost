import React from 'react';
import { Container, Heading, VStack } from '@chakra-ui/react';
import { useMatchStore } from '@/entities/game';
import { MatchmakingView } from '@/features/matchmaking';
import { BattleArena } from '@/widgets/battle-arena';

export const ArenaPage: React.FC = () => {
  const { phase, setPhase } = useMatchStore();

  return (
    <Container maxW="container.lg" py={8}>
      <VStack gap={6} align="stretch">
        <Heading size="xl" textAlign="center" color="cyan.400">Дедуктивна Арена</Heading>

        {phase === 'IDLE' && (
          <MatchmakingView
            isSearching={false}
            onStart={() => setPhase('SEARCHING')}
            onCancel={() => setPhase('IDLE')}
          />
        )}

        {phase === 'SEARCHING' && (
          <MatchmakingView
            isSearching={true}
            onStart={() => {}}
            onCancel={() => setPhase('IDLE')}
          />
        )}

        {(phase === 'IN_MATCH' || phase === 'ROUND_ACTIVE' || phase === 'ROUND_RESULT') && (
          <BattleArena />
        )}
      </VStack>
    </Container>
  );
};
