import { create } from 'zustand';

export type MatchPhase =
  | 'IDLE'
  | 'SEARCHING'
  | 'IN_MATCH'
  | 'ROUND_ACTIVE'
  | 'ROUND_RESULT'
  | 'MATCH_END';

export interface RoundData {
  round_index: number;
  round_type: string;
  time_limit_sec: number;
  payload: Record<string, unknown>;
}

export interface MatchOpponent {
  callsign: string;
  elo: number;
  is_bot: boolean;
}

export interface MatchState {
  phase: MatchPhase;
  match_id: string | null;
  opponent: MatchOpponent | null;
  my_score: number;
  opponent_score: number;
  current_round: RoundData | null;
  round_timer_sec: number;
  chest_earned: boolean;

  setPhase: (p: MatchPhase) => void;
  setMatchData: (match_id: string, opponent: MatchOpponent | null) => void;
  setRound: (round: RoundData, timer: number) => void;
  tickTimer: () => void;
  updateScores: (my: number, opp: number) => void;
  endMatch: (chest_earned: boolean) => void;
  reset: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  phase: 'IDLE',
  match_id: null,
  opponent: null,
  my_score: 0,
  opponent_score: 0,
  current_round: null,
  round_timer_sec: 0,
  chest_earned: false,

  setPhase: (phase) => set({ phase }),
  setMatchData: (match_id, opponent) => set({ match_id, opponent }),
  setRound: (round, timer) =>
    set({
      current_round: round,
      round_timer_sec: timer,
      phase: 'ROUND_ACTIVE',
    }),
  tickTimer: () => set((s) => ({ round_timer_sec: Math.max(0, s.round_timer_sec - 1) })),
  updateScores: (my_score, opponent_score) => set({ my_score, opponent_score }),
  endMatch: (chest_earned) => set({ phase: 'MATCH_END', chest_earned }),
  reset: () =>
    set({
      phase: 'IDLE',
      match_id: null,
      opponent: null,
      my_score: 0,
      opponent_score: 0,
      current_round: null,
      round_timer_sec: 0,
      chest_earned: false,
    }),
}));
