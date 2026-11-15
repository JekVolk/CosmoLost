import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('sets token and user profile', () => {
    useAuthStore.getState().setToken('sample-access-token');
    useAuthStore.getState().setUser({ callsign: 'MajorTom', elo_rating: 1250 });

    const state = useAuthStore.getState();
    expect(state.token).toBe('sample-access-token');
    expect(state.user).toEqual({ callsign: 'MajorTom', elo_rating: 1250 });
  });

  it('clears token and user on logout', () => {
    useAuthStore.getState().setToken('sample-token');
    useAuthStore.getState().setUser({ callsign: 'MajorTom', elo_rating: 1250 });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
