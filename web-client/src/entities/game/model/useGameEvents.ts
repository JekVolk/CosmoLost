import { wsClient } from '@/shared/api';
import { useEffect } from 'react';
import { type MatchOpponent, type RoundData, useMatchStore } from './useMatchStore';

export interface GameEventOptions {
  onAnswerAccepted?: (data: unknown) => void;
  onOpponentActed?: (data: unknown) => void;
  onStatGuesserFeedback?: (data: unknown) => void;
}

export function useGameEvents(options: GameEventOptions = {}): void {
  const setMatchData = useMatchStore((state) => state.setMatchData);
  const setPhase = useMatchStore((state) => state.setPhase);
  const setRound = useMatchStore((state) => state.setRound);
  const updateScores = useMatchStore((state) => state.updateScores);
  const endMatch = useMatchStore((state) => state.endMatch);

  useEffect(() => {
    const unsubMatched = wsClient.on('game.matched', (data: unknown) => {
      const msg = data as {
        match_id: string;
        opponent: MatchOpponent;
      };
      if (msg?.match_id) {
        setMatchData(msg.match_id, msg.opponent ?? null);
        setPhase('IN_MATCH');
      }
    });

    const unsubRoundStart = wsClient.on('round.start', (data: unknown) => {
      const msg = data as {
        round?: RoundData;
        round_index?: number;
        round_type?: string;
        time_limit_sec?: number;
        payload?: Record<string, unknown>;
      };

      const round: RoundData = msg.round ?? {
        round_index: msg.round_index ?? 0,
        round_type: msg.round_type ?? '',
        time_limit_sec: msg.time_limit_sec ?? 30,
        payload: msg.payload ?? {},
      };

      const timer =
        typeof msg.time_limit_sec === 'number' ? msg.time_limit_sec : (round.time_limit_sec ?? 30);

      setRound(round, timer);
    });

    const unsubAnswerAccepted = wsClient.on('round.answer_accepted', (data: unknown) => {
      options.onAnswerAccepted?.(data);
    });

    const unsubOpponentActed = wsClient.on('round.opponent_acted', (data: unknown) => {
      options.onOpponentActed?.(data);
    });

    const unsubRoundResult = wsClient.on('round.result', (data: unknown) => {
      const msg = data as {
        my_score?: number;
        player_score?: number;
        opponent_score?: number;
      };
      const my = msg.my_score ?? msg.player_score ?? 0;
      const opp = msg.opponent_score ?? 0;
      updateScores(my, opp);
      setPhase('ROUND_RESULT');
    });

    const unsubStatGuesserFeedback = wsClient.on('stat_guesser_feedback', (data: unknown) => {
      options.onStatGuesserFeedback?.(data);
    });

    const unsubStatGuesserDotFeedback = wsClient.on('stat_guesser.feedback', (data: unknown) => {
      options.onStatGuesserFeedback?.(data);
    });

    const unsubMatchFinish = wsClient.on('match.finish', (data: unknown) => {
      const msg = data as { chest_earned?: boolean };
      endMatch(Boolean(msg?.chest_earned));
    });

    return () => {
      unsubMatched();
      unsubRoundStart();
      unsubAnswerAccepted();
      unsubOpponentActed();
      unsubRoundResult();
      unsubStatGuesserFeedback();
      unsubStatGuesserDotFeedback();
      unsubMatchFinish();
    };
  }, [
    setMatchData,
    setPhase,
    setRound,
    updateScores,
    endMatch,
    options.onAnswerAccepted,
    options.onOpponentActed,
    options.onStatGuesserFeedback,
  ]);
}
