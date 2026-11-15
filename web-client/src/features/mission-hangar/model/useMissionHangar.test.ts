import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMissionHangar } from './useMissionHangar';

vi.mock('@/shared/api/ws-client', () => ({
  wsClient: {
    send: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
    disconnect: vi.fn(),
  },
}));

describe('useMissionHangar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMatchStore.getState().reset();
  });

  it('initializes with default categories and unassigned components', () => {
    const { result } = renderHook(() => useMissionHangar());
    expect(result.current.categories).toContain('Science');
    expect(result.current.categories).toContain('Power');
    expect(result.current.unassignedComponents.length).toBeGreaterThan(0);
    expect(result.current.isSubmitted).toBe(false);
  });

  it('moves component into category and tracks assignment', () => {
    const { result } = renderHook(() => useMissionHangar());

    act(() => {
      result.current.moveComponent('mast_cam', 'Science');
    });

    expect(result.current.grouping.Science).toContain('mast_cam');

    // Move to another category should transfer cleanly
    act(() => {
      result.current.moveComponent('mast_cam', 'Communication');
    });

    expect(result.current.grouping.Science).not.toContain('mast_cam');
    expect(result.current.grouping.Communication).toContain('mast_cam');
  });

  it('submits drag_drop WS action and locks state', () => {
    const { result } = renderHook(() => useMissionHangar());

    act(() => {
      result.current.moveComponent('rtg', 'Power');
    });

    act(() => {
      result.current.submit();
    });

    expect(result.current.isSubmitted).toBe(true);
    expect(wsClient.send).toHaveBeenCalledWith('drag_drop', {
      grouping: expect.objectContaining({
        Power: ['rtg'],
      }),
    });

    // Modifications after submission should be ignored
    act(() => {
      result.current.moveComponent('rtg', 'Science');
    });

    expect(result.current.grouping.Power).toContain('rtg');
    expect(result.current.grouping.Science).not.toContain('rtg');
  });
});
