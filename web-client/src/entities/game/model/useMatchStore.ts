import { create } from 'zustand';

export type MatchPhase =
  | 'IDLE'
  | 'SEARCHING'
  | 'IN_MATCH'
  | 'ROUND_ACTIVE'
  | 'ROUND_RESULT'
  | 'MATCH_END';

export interface RoundInfo {
  round_num: number;
  mini_game: string;
  artifact_id: number;
  artifact_name: string;
  time_limit_sec: number;
  payload: Record<string, unknown>;
}

interface MatchState {
  phase: MatchPhase;
  matchId: string | null;
  opponent: { callsign: string; elo: number; is_bot: boolean } | null;
  myScore: number;
  opponentScore: number;
  currentRound: RoundInfo | null;
  timerSec: number;
  chestEarned: boolean;
  setPhase: (phase: MatchPhase) => void;
  setMatchData: (matchId: string, opponent: MatchState['opponent']) => void;
  setRound: (round: RoundInfo, timer: number) => void;
  tickTimer: () => void;
  updateScores: (myScore: number, oppScore: number) => void;
  endMatch: (chestEarned: boolean) => void;
  reset: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  phase: 'IDLE',
  matchId: null,
  opponent: null,
  myScore: 0,
  opponentScore: 0,
  currentRound: null,
  timerSec: 0,
  chestEarned: false,
  setPhase: (phase) => set({ phase }),
  setMatchData: (matchId, opponent) => set({ matchId, opponent, phase: 'IN_MATCH' }),
  setRound: (round, timer) => set({ currentRound: round, timerSec: timer, phase: 'ROUND_ACTIVE' }),
  tickTimer: () => set((s) => ({ timerSec: Math.max(0, s.timerSec - 1) })),
  updateScores: (myScore, opponentScore) => set({ myScore, opponentScore }),
  endMatch: (chestEarned) => set({ phase: 'MATCH_END', chestEarned }),
  reset: () =>
    set({
      phase: 'IDLE',
      matchId: null,
      opponent: null,
      myScore: 0,
      opponentScore: 0,
      currentRound: null,
      timerSec: 0,
      chestEarned: false,
    }),
}));
