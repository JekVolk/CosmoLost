import { containerRepository } from '@/entities/container';
import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { useCallback, useState } from 'react';

export function useMatchmaking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phase = useMatchStore((s) => s.phase);
  const setPhase = useMatchStore((s) => s.setPhase);
  const setMatchData = useMatchStore((s) => s.setMatchData);

  const startMatchmaking = useCallback(
    async (slotIndex: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await containerRepository.startMatchWithSlot(slotIndex);

        // Update match state
        setMatchData(response.match_id, null);
        setPhase('SEARCHING');

        // Connect WebSocket singleton
        wsClient.connect(response.ws_url);

        // Listen for game.matched (≤8s; is_bot === true after bot fallback)
        wsClient.on('game.matched', (rawData: unknown) => {
          const data = rawData as {
            match_id?: string;
            opponent?: { callsign: string; elo: number; is_bot: boolean };
          };

          if (data?.opponent) {
            setMatchData(data.match_id || response.match_id, data.opponent);
            setPhase('IN_MATCH');
          }
        });
      } catch (err) {
        console.error('Failed to start matchmaking:', err);
        setError(err instanceof Error ? err.message : 'Failed to start matchmaking');
        setPhase('IDLE');
      } finally {
        setIsLoading(false);
      }
    },
    [setMatchData, setPhase],
  );

  return {
    startMatchmaking,
    isLoading,
    isSearching: phase === 'SEARCHING',
    error,
  };
}
