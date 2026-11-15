import type { ShowcaseItem } from '@/entities/user';
import { create } from 'zustand';
import { showcaseRepository } from '../api/showcase-repository';

export interface CuratorShowcaseState {
  slots: (ShowcaseItem | null)[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchShowcase: (callsign: string) => Promise<void>;
  reorder: (fromIndex: number, toIndex: number) => void;
  setSlots: (slots: (ShowcaseItem | null)[]) => void;
  save: () => Promise<void>;
}

export const useCuratorShowcase = create<CuratorShowcaseState>((set, get) => ({
  slots: [null, null, null, null, null],
  isLoading: false,
  isSaving: false,
  error: null,

  fetchShowcase: async (callsign: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await showcaseRepository.getShowcase(callsign);
      const incoming = profile.showcase ?? [];
      const slots: (ShowcaseItem | null)[] = [null, null, null, null, null];
      for (let i = 0; i < 5; i++) {
        slots[i] = incoming[i] ?? null;
      }
      set({ slots, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch showcase',
        isLoading: false,
      });
    }
  },

  reorder: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const next = [...state.slots];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { slots: next };
    });
  },

  setSlots: (slots: (ShowcaseItem | null)[]) => set({ slots }),

  save: async () => {
    set({ isSaving: true, error: null });
    try {
      const updates = get()
        .slots.map((item, idx) => ({ item, slot: idx }))
        .filter((entry): entry is { item: ShowcaseItem; slot: number } => entry.item !== null)
        .map((entry) => ({
          inventory_item_id: entry.item.equipment.id,
          slot: entry.slot,
        }));

      await showcaseRepository.updateShowcase(updates);
      set({ isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save showcase',
        isSaving: false,
      });
    }
  },
}));
