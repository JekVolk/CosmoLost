import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStatGuesser } from './useStatGuesser';

vi.mock('@/shared/api/ws-client', () => ({
  wsClient: {
    send: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(() => vi.fn()),
    disconnect: vi.fn(),
  },
}));

describe('useStatGuesser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMatchStore.getState().reset();
  });

  it('calculates total mass correctly as objects are toggled', () => {
    const { result } = renderHook(() => useStatGuesser());
    expect(result.current.currentTotalMassKg).toBe(0);

    // Add car (1500kg)
    act(() => {
      result.current.toggleObject('car');
    });
    expect(result.current.currentTotalMassKg).toBe(1500);

    // Add elephant (5000kg)
    act(() => {
      result.current.toggleObject('elephant');
    });
    expect(result.current.currentTotalMassKg).toBe(6500);

    // Remove car
    act(() => {
      result.current.removeObject('car');
    });
    expect(result.current.currentTotalMassKg).toBe(5000);
  });

  it('submits only object_ids and never target mass', () => {
    const { result } = renderHook(() => useStatGuesser());

    act(() => {
      result.current.addObject('car');
      result.current.addObject('piano');
    });

    act(() => {
      result.current.check();
    });

    expect(result.current.isChecking).toBe(true);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.attempts).toBe(1);

    expect(wsClient.send).toHaveBeenCalledTimes(1);
    expect(wsClient.send).toHaveBeenCalledWith('stat_guesser_check', {
      object_ids: ['car', 'piano'],
    });
  });

  it('handles feedback states correctly', () => {
    const { result } = renderHook(() => useStatGuesser());

    act(() => {
      result.current.addObject('car');
      result.current.check();
    });

    // Simulate feedback: spacecraft_heavier
    act(() => {
      result.current.applyFeedback('spacecraft_heavier');
    });

    expect(result.current.feedback).toBe('spacecraft_heavier');
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isRoundOver).toBe(false);

    // Continue weighing
    act(() => {
      result.current.continueAttempt();
    });
    expect(wsClient.send).toHaveBeenCalledWith('stat_guesser_continue', {});

    // Ready for next attempt
    act(() => {
      result.current.readyNextAttempt();
    });
    expect(result.current.canEdit).toBe(true);
    expect(result.current.feedback).toBeNull();

    // Check with balanced feedback
    act(() => {
      result.current.check();
      result.current.applyFeedback('balanced');
    });

    expect(result.current.feedback).toBe('balanced');
    expect(result.current.isRoundOver).toBe(true);
    expect(result.current.canEdit).toBe(false);
  });

  it('sends stop action and ends round on stopAttempt', () => {
    const { result } = renderHook(() => useStatGuesser());

    act(() => {
      result.current.stopAttempt();
    });

    expect(wsClient.send).toHaveBeenCalledWith('stat_guesser_stop', {});
    expect(result.current.isRoundOver).toBe(true);
    expect(result.current.canEdit).toBe(false);
  });
});
