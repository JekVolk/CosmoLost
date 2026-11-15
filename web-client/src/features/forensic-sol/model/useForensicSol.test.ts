import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useForensicSol } from './useForensicSol';

vi.mock('@/shared/api/ws-client', () => ({
  wsClient: {
    send: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
    disconnect: vi.fn(),
  },
}));

describe('useForensicSol', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMatchStore.getState().reset();
  });

  it('initializes with selected = null and isSubmitted = false', () => {
    const { result } = renderHook(() => useForensicSol());
    expect(result.current.selected).toBeNull();
    expect(result.current.isSubmitted).toBe(false);
  });

  it('updates selection when select is called', () => {
    const { result } = renderHook(() => useForensicSol());

    act(() => {
      result.current.select('Perseverance');
    });

    expect(result.current.selected).toBe('Perseverance');
  });

  it('submits buzzer_click WS action and prevents further selection change', () => {
    const { result } = renderHook(() => useForensicSol());

    act(() => {
      result.current.select('Curiosity');
    });

    act(() => {
      result.current.submit();
    });

    expect(result.current.isSubmitted).toBe(true);
    expect(wsClient.send).toHaveBeenCalledWith('buzzer_click', {
      selected_id: 'Curiosity',
      answer: 'Curiosity',
    });

    act(() => {
      result.current.select('Opportunity');
    });

    // Should remain Curiosity because isSubmitted is true
    expect(result.current.selected).toBe('Curiosity');
  });
});
