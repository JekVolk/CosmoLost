import { beforeEach, describe, expect, it } from 'vitest';
import { useMatchStore } from './useMatchStore';

describe('useMatchStore', () => {
  beforeEach(() => {
    useMatchStore.getState().reset();
  });

  it('manages phase transitions IDLE -> SEARCHING -> IN_MATCH -> ROUND_ACTIVE -> MATCH_END', () => {
    expect(useMatchStore.getState().phase).toBe('IDLE');

    useMatchStore.getState().setPhase('SEARCHING');
    expect(useMatchStore.getState().phase).toBe('SEARCHING');

    useMatchStore.getState().setMatchData('match-42', {
      callsign: 'BotViking',
      elo: 1100,
      is_bot: true,
    });
    useMatchStore.getState().setPhase('IN_MATCH');
    expect(useMatchStore.getState().phase).toBe('IN_MATCH');
    expect(useMatchStore.getState().opponent?.callsign).toBe('BotViking');

    useMatchStore.getState().setRound(
      {
        round_index: 1,
        round_type: 'ASTRO_GUESSR',
        time_limit_sec: 45,
        payload: { planet: 'MARS' },
      },
      45,
    );
    expect(useMatchStore.getState().phase).toBe('ROUND_ACTIVE');
    expect(useMatchStore.getState().round_timer_sec).toBe(45);

    useMatchStore.getState().endMatch(true);
    expect(useMatchStore.getState().phase).toBe('MATCH_END');
    expect(useMatchStore.getState().chest_earned).toBe(true);
  });

  it('ticks timer down and stops at 0', () => {
    useMatchStore.getState().setRound(
      {
        round_index: 1,
        round_type: 'FORENSIC_SOL',
        time_limit_sec: 2,
        payload: {},
      },
      2,
    );

    useMatchStore.getState().tickTimer();
    expect(useMatchStore.getState().round_timer_sec).toBe(1);

    useMatchStore.getState().tickTimer();
    expect(useMatchStore.getState().round_timer_sec).toBe(0);

    useMatchStore.getState().tickTimer();
    expect(useMatchStore.getState().round_timer_sec).toBe(0);
  });

  it('resets state completely on reset()', () => {
    useMatchStore.getState().setMatchData('m1', { callsign: 'Opp', elo: 1000, is_bot: false });
    useMatchStore.getState().updateScores(150, 120);
    useMatchStore.getState().setPhase('ROUND_ACTIVE');

    useMatchStore.getState().reset();

    const state = useMatchStore.getState();
    expect(state.phase).toBe('IDLE');
    expect(state.match_id).toBeNull();
    expect(state.opponent).toBeNull();
    expect(state.my_score).toBe(0);
    expect(state.opponent_score).toBe(0);
  });
});
