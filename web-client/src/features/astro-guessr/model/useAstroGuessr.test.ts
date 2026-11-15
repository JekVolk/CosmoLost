import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAstroGuessr } from './useAstroGuessr';

vi.mock('@/shared/api/ws-client', () => ({
  wsClient: {
    send: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
    disconnect: vi.fn(),
  },
}));

describe('useAstroGuessr', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMatchStore.getState().reset();
  });

  it('initializes with null pin and isSubmitted = false', () => {
    const { result } = renderHook(() => useAstroGuessr());
    expect(result.current.pin).toBeNull();
    expect(result.current.isSubmitted).toBe(false);
  });

  it('updates pin when setPin is called', () => {
    const { result } = renderHook(() => useAstroGuessr());

    act(() => {
      result.current.setPin({ lat: 18.38, lon: -77.53 });
    });

    expect(result.current.pin).toEqual({ lat: 18.38, lon: -77.53 });
  });

  it('sends WS action submit_guess on submit and disables further modifications', () => {
    const { result } = renderHook(() => useAstroGuessr());

    act(() => {
      result.current.setPin({ lat: 4.5, lon: 137.4 });
    });

    act(() => {
      result.current.submit();
    });

    expect(result.current.isSubmitted).toBe(true);
    expect(wsClient.send).toHaveBeenCalledTimes(1);
    expect(wsClient.send).toHaveBeenCalledWith('submit_guess', {
      latitude: 4.5,
      longitude: 137.4,
    });

    // Trying to change pin after submission must be ignored
    act(() => {
      result.current.setPin({ lat: 0, lon: 0 });
    });
    expect(result.current.pin).toEqual({ lat: 4.5, lon: 137.4 });

    // Trying to submit again must not send additional messages
    act(() => {
      result.current.submit();
    });
    expect(wsClient.send).toHaveBeenCalledTimes(1);
  });
});
