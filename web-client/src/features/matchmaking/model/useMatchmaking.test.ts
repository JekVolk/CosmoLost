import { containerRepository } from '@/entities/container';
import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMatchmaking } from './useMatchmaking';

vi.mock('@/entities/container', () => ({
  containerRepository: {
    startMatchWithSlot: vi.fn(),
  },
}));

vi.mock('@/shared/api/ws-client', () => ({
  wsClient: {
    connect: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    disconnect: vi.fn(),
  },
}));

describe('useMatchmaking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMatchStore.getState().reset();
  });

  it('starts matchmaking: calls containerRepository, sets phase SEARCHING, connects WS', async () => {
    vi.mocked(containerRepository.startMatchWithSlot).mockResolvedValueOnce({
      match_id: 'match-123',
      ws_url: 'ws://localhost:8000/ws/game/match-123/',
    });

    const { result } = renderHook(() => useMatchmaking());

    await act(async () => {
      await result.current.startMatchmaking(0);
    });

    expect(containerRepository.startMatchWithSlot).toHaveBeenCalledWith(0);
    expect(wsClient.connect).toHaveBeenCalledWith('ws://localhost:8000/ws/game/match-123/');
    expect(useMatchStore.getState().phase).toBe('SEARCHING');
    expect(useMatchStore.getState().match_id).toBe('match-123');
  });

  it('handles game.matched event with bot fallback', async () => {
    let wsEventHandler: ((data: unknown) => void) | undefined;
    vi.mocked(wsClient.on).mockImplementation((event, cb) => {
      if (event === 'game.matched') {
        wsEventHandler = cb;
      }
      return () => {};
    });

    vi.mocked(containerRepository.startMatchWithSlot).mockResolvedValueOnce({
      match_id: 'match-999',
      ws_url: 'ws://localhost:8000/ws/game/match-999/',
    });

    const { result } = renderHook(() => useMatchmaking());

    await act(async () => {
      await result.current.startMatchmaking(1);
    });

    expect(wsEventHandler).toBeDefined();

    // Trigger game.matched with bot opponent
    act(() => {
      wsEventHandler?.({
        match_id: 'match-999',
        opponent: { callsign: 'Ares_Bot_01', elo: 1000, is_bot: true },
      });
    });

    expect(useMatchStore.getState().phase).toBe('IN_MATCH');
    expect(useMatchStore.getState().opponent).toEqual({
      callsign: 'Ares_Bot_01',
      elo: 1000,
      is_bot: true,
    });
  });
});
