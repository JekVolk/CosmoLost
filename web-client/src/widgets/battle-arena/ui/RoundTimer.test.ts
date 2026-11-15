import { useMatchStore } from '@/entities/game';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoundTimer } from './RoundTimer';

describe('RoundTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useMatchStore.setState({
      round_timer_sec: 45,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const renderWithChakra = (ui: React.ReactElement) => {
    return render(React.createElement(ChakraProvider, { value: defaultSystem }, ui));
  };

  it('ticks timer and decrements round_timer_sec every second', () => {
    renderWithChakra(React.createElement(RoundTimer));

    expect(useMatchStore.getState().round_timer_sec).toBe(45);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(useMatchStore.getState().round_timer_sec).toBe(44);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(useMatchStore.getState().round_timer_sec).toBe(42);
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = renderWithChakra(React.createElement(RoundTimer));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(useMatchStore.getState().round_timer_sec).toBe(44);

    unmount();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(useMatchStore.getState().round_timer_sec).toBe(44);
  });
});
