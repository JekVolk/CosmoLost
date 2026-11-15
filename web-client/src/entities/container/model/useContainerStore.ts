import { create } from 'zustand';
import {
  type ContainerSlot,
  type DailyClaimState,
  type MatchCreateResponse,
  containerRepository,
} from '../api/container-repository';

export interface ContainerState {
  slots: ContainerSlot[];
  next_fill_at: string | null;
  isLoading: boolean;
  error: string | null;

  fetchSlots: () => Promise<void>;
  startMatchWithSlot: (slot_index: number) => Promise<MatchCreateResponse | undefined>;
  claimDaily: () => Promise<DailyClaimState | undefined>;
  setSlots: (slots: ContainerSlot[]) => void;
  reset: () => void;
}

export const useContainerStore = create<ContainerState>((set) => ({
  slots: [],
  next_fill_at: null,
  isLoading: false,
  error: null,

  fetchSlots: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await containerRepository.getSlots();
      set({
        slots: data.slots,
        next_fill_at: data.next_fill_at,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  startMatchWithSlot: async (slot_index: number) => {
    try {
      const response = await containerRepository.startMatchWithSlot(slot_index);
      set((state) => ({
        slots: state.slots.map((s) =>
          s.slot_index === slot_index ? { ...s, is_reserved: true } : s,
        ),
      }));
      return response;
    } catch (err) {
      set({ error: (err as Error).message });
      return undefined;
    }
  },

  claimDaily: async () => {
    try {
      const result = await containerRepository.claimDaily();
      const data = await containerRepository.getSlots();
      set({
        slots: data.slots,
        next_fill_at: data.next_fill_at,
      });
      return result;
    } catch (err) {
      set({ error: (err as Error).message });
      return undefined;
    }
  },

  setSlots: (slots) => set({ slots }),

  reset: () =>
    set({
      slots: [],
      next_fill_at: null,
      isLoading: false,
      error: null,
    }),
}));
