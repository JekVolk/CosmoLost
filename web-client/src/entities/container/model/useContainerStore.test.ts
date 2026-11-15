import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type ContainerSlot, containerRepository } from '../api/container-repository';
import { useContainerStore } from './useContainerStore';

describe('useContainerStore', () => {
  beforeEach(() => {
    useContainerStore.getState().reset();
    vi.restoreAllMocks();
  });

  const mockSlots: ContainerSlot[] = [
    {
      slot_index: 0,
      container_type: 'Titanium Container',
      filled_at: '2026-11-15T12:00:00Z',
      seal_progress: 0,
      is_reserved: false,
    },
    {
      slot_index: 1,
      container_type: 'Obsidian Container',
      filled_at: '2026-11-15T13:00:00Z',
      seal_progress: 50,
      is_reserved: false,
    },
  ];

  it('fetchSlots fetches slots and updates store', async () => {
    vi.spyOn(containerRepository, 'getSlots').mockResolvedValueOnce({
      slots: mockSlots,
      next_fill_at: '2026-11-15T18:00:00Z',
    });

    await useContainerStore.getState().fetchSlots();

    const state = useContainerStore.getState();
    expect(state.slots).toHaveLength(2);
    expect(state.slots[0].container_type).toBe('Titanium Container');
    expect(state.next_fill_at).toBe('2026-11-15T18:00:00Z');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('startMatchWithSlot creates match and marks slot as reserved', async () => {
    useContainerStore.getState().setSlots(mockSlots);

    vi.spyOn(containerRepository, 'startMatchWithSlot').mockResolvedValueOnce({
      match_id: 'match-xyz',
      ws_url: '/ws/game/match-xyz/',
    });

    const res = await useContainerStore.getState().startMatchWithSlot(0);

    expect(res).toBeDefined();
    expect(res?.match_id).toBe('match-xyz');

    const state = useContainerStore.getState();
    expect(state.slots[0].is_reserved).toBe(true);
    expect(state.slots[1].is_reserved).toBe(false);
  });

  it('claimDaily requests daily container and refreshes slots', async () => {
    vi.spyOn(containerRepository, 'claimDaily').mockResolvedValueOnce({
      status: 'claimed',
      expires_at: '2026-11-16T00:00:00Z',
    });

    vi.spyOn(containerRepository, 'getSlots').mockResolvedValueOnce({
      slots: [
        ...mockSlots,
        {
          slot_index: 2,
          container_type: 'Daily Chest',
          filled_at: '2026-11-15T14:00:00Z',
          seal_progress: 0,
          is_reserved: false,
        },
      ],
      next_fill_at: null,
    });

    const result = await useContainerStore.getState().claimDaily();

    expect(result?.status).toBe('claimed');
    const state = useContainerStore.getState();
    expect(state.slots).toHaveLength(3);
    expect(state.slots[2].container_type).toBe('Daily Chest');
  });

  it('handles API errors gracefully', async () => {
    vi.spyOn(containerRepository, 'getSlots').mockRejectedValueOnce(new Error('Network error'));

    await useContainerStore.getState().fetchSlots();

    const state = useContainerStore.getState();
    expect(state.error).toBe('Network error');
    expect(state.isLoading).toBe(false);
  });
});
